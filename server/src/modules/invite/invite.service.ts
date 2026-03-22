import status from "http-status";
import { prisma }         from "../../lib/prisma";
import AppError           from "../../errorHelpers/AppError";
import {
  CreateInvitePayload,
  GetInvitePayload,
  JoinViaInvitePayload,
  InviteCreatedResult,
  InviteDetailsResult,
  JoinViaInviteResult,
} from "./invite.interface";
import { INVITE_MESSAGES } from "./invite.constant";
import {
  buildInviteUrl,
  buildReferralUrl,
  maskName,
  derivePosition,
} from "./invite.utils";

export const inviteService = {

  /* ──────────────────────────────────────────────────────────────
     POST /api/invite
     ──────────────────────────────────────────────────────────────
     Create (or return existing) invite link for a subscriber.

     The invite code IS the subscriber's referralCode — no separate
     table is needed. The /invite/{code} URL is just a nicer route
     that resolves to the same subscriber record.

     Idempotent: if this subscriber already has a referralCode on
     this waitlist, we simply return it — never create a duplicate.
     ────────────────────────────────────────────────────────────── */

  async createInvite(
    payload: CreateInvitePayload,
  ): Promise<InviteCreatedResult> {
    const { waitlistId, createdBySubscriberId } = payload;

    /* 1. Resolve the subscriber — must be on this waitlist ─────── */
    if (!createdBySubscriberId) {
      throw new AppError(status.BAD_REQUEST, "subscriberId is required.");
    }

    const subscriber = await prisma.subscriber.findFirst({
      where: { id: createdBySubscriberId, waitlistId, deletedAt: null },
      select: {
        id:           true,
        name:         true,
        referralCode: true,
        waitlist: {
          select: {
            id:   true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!subscriber) {
      throw new AppError(
        status.NOT_FOUND,
        INVITE_MESSAGES.SUBSCRIBER_NOT_FOUND,
      );
    }

    /*
     * 2. The invite code is the subscriber's own referralCode.
     *    This is already guaranteed unique at the DB level (@@unique).
     *    No generation or retry loop needed here.
     */
    const inviteCode = subscriber.referralCode;
    const inviteUrl  = buildInviteUrl(subscriber.waitlist.slug, inviteCode);

    return {
      inviteCode,
      inviteUrl,
      waitlist: {
        id:   subscriber.waitlist.id,
        name: subscriber.waitlist.name,
        slug: subscriber.waitlist.slug,
      },
      createdBy: {
        id:           subscriber.id,
        name:         subscriber.name,
        referralCode: subscriber.referralCode,
      },
    };
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/invite/:inviteCode
     ──────────────────────────────────────────────────────────────
     Resolve an invite code to its waitlist details.
     Called by the frontend BEFORE the user fills in the join form
     so it can display the product name, logo, and creator context.

     No authentication required — this is a public GET.
     ────────────────────────────────────────────────────────────── */

  async getInvite(
    payload: GetInvitePayload,
  ): Promise<InviteDetailsResult> {
    const { inviteCode } = payload;

    /* 1. Resolve the subscriber whose referralCode = inviteCode ── */
    const subscriber = await prisma.subscriber.findFirst({
      where: { referralCode: inviteCode, deletedAt: null },
      select: {
        id:             true,
        name:           true,
        referralsCount: true,
        waitlist: {
          select: {
            id:          true,
            name:        true,
            slug:        true,
            description: true,
            logoUrl:     true,
            isOpen:      true,
          },
        },
      },
    });

    if (!subscriber) {
      throw new AppError(status.NOT_FOUND, INVITE_MESSAGES.NOT_FOUND);
    }

    /* 2. Count total subscribers for social proof ────────────────── */
    const totalSubscribers = await prisma.subscriber.count({
      where: {
        waitlistId: subscriber.waitlist.id,
        deletedAt:  null,
      },
    });

    return {
      inviteCode,
      inviteUrl:  buildInviteUrl(subscriber.waitlist.slug, inviteCode),
      waitlist: {
        id:               subscriber.waitlist.id,
        name:             subscriber.waitlist.name,
        slug:             subscriber.waitlist.slug,
        description:      subscriber.waitlist.description,
        logoUrl:          subscriber.waitlist.logoUrl,
        isOpen:           subscriber.waitlist.isOpen,
        totalSubscribers,
      },
      createdBy: {
        maskedName:    maskName(subscriber.name),
        referralCount: subscriber.referralsCount,
      },
    };
  },

  /* ──────────────────────────────────────────────────────────────
     POST /api/invite/:inviteCode/join
     ──────────────────────────────────────────────────────────────
     A new user joins a waitlist through an invite link.

     Core behaviour:
       A. Resolve the invite → subscriber who shared it
       B. Guard: waitlist must be open
       C. Idempotency: if email already exists on this waitlist,
          return their existing position (alreadyJoined: true)
       D. Guard: cannot join via your own invite link
       E. Create new Subscriber record + increment creator's
          referralsCount atomically inside a $transaction
       F. Return position, the new subscriber's own referral link,
          and the invite URL so the success screen can show everything
     ────────────────────────────────────────────────────────────── */

  async joinViaInvite(
    payload: JoinViaInvitePayload,
  ): Promise<JoinViaInviteResult> {
    const { inviteCode, name, email } = payload;

    /* 1. Resolve the invite (subscriber whose referralCode = inviteCode) */
    const inviteOwner = await prisma.subscriber.findFirst({
      where: { referralCode: inviteCode, deletedAt: null },
      select: {
        id:           true,
        name:         true,
        email:        true,
        referralCode: true,
        waitlistId:   true,
        waitlist: {
          select: {
            id:     true,
            name:   true,
            slug:   true,
            isOpen: true,
          },
        },
      },
    });

    if (!inviteOwner) {
      throw new AppError(status.NOT_FOUND, INVITE_MESSAGES.NOT_FOUND);
    }

    /* 2. Guard: waitlist must still be open ─────────────────────── */
    if (!inviteOwner.waitlist.isOpen) {
      throw new AppError(status.FORBIDDEN, INVITE_MESSAGES.WAITLIST_CLOSED);
    }

    const waitlistId = inviteOwner.waitlistId;
    const inviteUrl  = buildInviteUrl(inviteOwner.waitlist.slug, inviteCode);

    /* 3. Guard: cannot use your own invite link ─────────────────── */
    if (inviteOwner.email.toLowerCase() === email.toLowerCase()) {
      throw new AppError(status.BAD_REQUEST, INVITE_MESSAGES.SELF_INVITE);
    }

    /* 4. Idempotency — check if this email is already on the list ─ */
    const existing = await prisma.subscriber.findUnique({
      where: {
        waitlistId_email: { waitlistId, email: email.toLowerCase() },
      },
      select: { id: true, referralCode: true },
    });

    if (existing) {
      /* Already joined — derive their current position and return ─ */
      const [totalInQueue, orderedIds] = await prisma.$transaction([
        prisma.subscriber.count({
          where: { waitlistId, deletedAt: null },
        }),
        prisma.subscriber.findMany({
          where:   { waitlistId, deletedAt: null },
          orderBy: [{ referralsCount: "desc" }, { createdAt: "asc" }],
          select:  { id: true },
        }),
      ]);

      return {
        alreadyJoined: true,
        position:      derivePosition(orderedIds, existing.id),
        totalInQueue,
        referralCode:  existing.referralCode,
        referralUrl:   buildReferralUrl(inviteOwner.waitlist.slug, existing.referralCode),
        inviteUrl,
        waitlist: {
          id:   inviteOwner.waitlist.id,
          name: inviteOwner.waitlist.name,
          slug: inviteOwner.waitlist.slug,
        },
      };
    }

    /* 5. Generate a unique referral code for the new subscriber ─── */
    let newReferralCode = "";
    let attempts = 0;

    do {
      /*
       * Import generateReferralCode from the existing public-waitlist utils
       * to keep the generation algorithm consistent across both join flows.
       * We use a local import here so the invite module stays self-contained.
       */
      const { generateReferralCode } = await import(
        "../public-waitlist/public-waitlist.utils"
      );
      newReferralCode = generateReferralCode();

      const collision = await prisma.subscriber.findUnique({
        where:  { referralCode: newReferralCode },
        select: { id: true },
      });

      if (!collision) break;
      attempts++;
    } while (attempts < 5);

    if (!newReferralCode) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Could not generate a unique referral code. Please try again.",
      );
    }

    /* 6. Create subscriber + increment invite owner's count atomically */
    const newSubscriber = await prisma.$transaction(async (tx) => {
      const subscriber = await tx.subscriber.create({
        data: {
          waitlistId,
          name:         name.trim(),
          email:        email.toLowerCase(),
          referralCode: newReferralCode,
          /*
           * Link this subscriber to the invite owner.
           * This is the core of the referral tracking:
           *   - referredById = who shared the invite link
           *   - invite owner's referralsCount += 1 (below)
           */
          referredById: inviteOwner.id,
          isConfirmed:  false,
        },
        select: { id: true, referralCode: true },
      });

      /*
       * Increment the invite owner's denormalised referralsCount.
       * Using { increment: 1 } is safe under concurrent writes —
       * Prisma translates this to UPDATE … SET referralsCount = referralsCount + 1
       * which is atomic at the DB level.
       */
      await tx.subscriber.update({
        where: { id: inviteOwner.id },
        data:  { referralsCount: { increment: 1 } },
      });

      return subscriber;
    });

    /* 7. Derive the new subscriber's queue position ─────────────── */
    const [totalInQueue, orderedIds] = await prisma.$transaction([
      prisma.subscriber.count({
        where: { waitlistId, deletedAt: null },
      }),
      prisma.subscriber.findMany({
        where:   { waitlistId, deletedAt: null },
        orderBy: [{ referralsCount: "desc" }, { createdAt: "asc" }],
        select:  { id: true },
      }),
    ]);

    return {
      alreadyJoined: false,
      position:      derivePosition(orderedIds, newSubscriber.id),
      totalInQueue,
      referralCode:  newSubscriber.referralCode,
      referralUrl:   buildReferralUrl(inviteOwner.waitlist.slug, newSubscriber.referralCode),
      inviteUrl,
      waitlist: {
        id:   inviteOwner.waitlist.id,
        name: inviteOwner.waitlist.name,
        slug: inviteOwner.waitlist.slug,
      },
    };
  },
};
