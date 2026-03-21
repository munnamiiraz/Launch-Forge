import status from "http-status";
import { prisma }  from "../../lib/prisma";
import AppError    from "../../errorHelpers/AppError";
import {
  GetPublicWaitlistPayload,
  JoinWaitlistPayload,
  PublicWaitlistPageData,
  JoinConfirmation,
} from "./public-waitlist.interface";
import { PUBLIC_WAITLIST_MESSAGES } from "./public-waitlist.constants";
import {
  generateReferralCode,
  buildReferralUrl,
  buildLeaderboard,
  derivePosition,
  resolveReferrerId,
} from "./public-waitlist.utils";

export const publicWaitlistService = {

  /* ── GET /api/public/waitlist/:slug ──────────────────────────── */

  async getPublicWaitlist(
    payload: GetPublicWaitlistPayload,
  ): Promise<PublicWaitlistPageData> {
    const { slug } = payload;

    /* 1. Look up the waitlist by slug (no workspaceId — slug is globally unique
          at the public layer because it includes the subdomain in production,
          but here we just resolve by slug + not deleted) ─────────── */
    const waitlist = await prisma.waitlist.findFirst({
      where: { slug, deletedAt: null },
      select: {
        id:          true,
        name:        true,
        slug:        true,
        description: true,
        logoUrl:     true,
        isOpen:      true,
      },
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, PUBLIC_WAITLIST_MESSAGES.NOT_FOUND);
    }

    /* 2. Fetch total subscriber count + top referrers in one transaction ─ */
    const [totalSubscribers, topReferrers] = await prisma.$transaction([
      prisma.subscriber.count({
        where: { waitlistId: waitlist.id, deletedAt: null },
      }),
      prisma.subscriber.findMany({
        where:   { waitlistId: waitlist.id, deletedAt: null, referralsCount: { gt: 0 } },
        orderBy: [{ referralsCount: "desc" }, { createdAt: "asc" }],
        take:    5,
        select:  { id: true, name: true, referralsCount: true },
      }),
    ]);

    return {
      name:             waitlist.name,
      slug:             waitlist.slug,
      description:      waitlist.description,
      logoUrl:          waitlist.logoUrl,
      isOpen:           waitlist.isOpen,
      totalSubscribers,
      topReferrers:     buildLeaderboard(topReferrers),
    };
  },

  /* ── POST /api/public/waitlist/:slug/join ────────────────────── */

  async joinWaitlist(
    payload: JoinWaitlistPayload,
  ): Promise<JoinConfirmation> {
    const { slug, name, email, referralCode: incomingCode } = payload;

    /* 1. Resolve the waitlist ────────────────────────────────────── */
    const waitlist = await prisma.waitlist.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true, isOpen: true },
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, PUBLIC_WAITLIST_MESSAGES.NOT_FOUND);
    }

    /* 2. Respect the isOpen gate ─────────────────────────────────── */
    if (!waitlist.isOpen) {
      throw new AppError(status.FORBIDDEN, PUBLIC_WAITLIST_MESSAGES.CLOSED);
    }

    /* 3. Idempotency — handle re-joins gracefully ─────────────────
          If this email is already on the list, return their existing
          position and referral link. Never throw a 409; treat as success
          with alreadyJoined: true so the UI can show the right message. */
    const existing = await prisma.subscriber.findUnique({
      where: {
        waitlistId_email: { waitlistId: waitlist.id, email },
      },
      select: { id: true, referralCode: true },
    });

    if (existing) {
      const [totalSubscribers, orderedIds] = await prisma.$transaction([
        prisma.subscriber.count({
          where: { waitlistId: waitlist.id, deletedAt: null },
        }),
        prisma.subscriber.findMany({
          where:   { waitlistId: waitlist.id, deletedAt: null },
          orderBy: [{ referralsCount: "desc" }, { createdAt: "asc" }],
          select:  { id: true },
        }),
      ]);

      return {
        position:      derivePosition(orderedIds, existing.id),
        referralCode:  existing.referralCode,
        referralUrl:   buildReferralUrl(existing.referralCode),
        totalInQueue:  totalSubscribers,
        alreadyJoined: true,
      };
    }

    /* 4. Resolve the referrer ────────────────────────────────────── */
    let referredById: string | null = null;

    if (incomingCode) {
      const referrer = await prisma.subscriber.findUnique({
        where: {
          referralCode: incomingCode,
          // Referrer must belong to the same waitlist
          waitlist: { id: waitlist.id },
        } as Parameters<typeof prisma.subscriber.findUnique>[0]["where"],
        select: { id: true, referralCode: true },
      });

      if (!referrer) {
        /* Invalid code — do NOT block the join, just ignore the referral.
           This prevents a bad actor from blocking signups by injecting
           random ref codes. We silently drop it and continue. */
        referredById = null;
      } else {
        referredById = referrer.id;
      }
    }

    /* 5. Generate a unique referral code for the new subscriber ────── */
    let newReferralCode: string;
    let codeIsUnique = false;
    let attempts = 0;

    do {
      newReferralCode = generateReferralCode();
      const collision = await prisma.subscriber.findUnique({
        where:  { referralCode: newReferralCode },
        select: { id: true },
      });
      codeIsUnique = !collision;
      attempts++;
    } while (!codeIsUnique && attempts < 5);

    if (!codeIsUnique) {
      // Collision after 5 attempts is astronomically unlikely but handled
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Could not generate a unique referral code. Please try again.",
      );
    }

    /* 6. Create subscriber + increment referrer's counter atomically ─ */
    const [newSubscriber] = await prisma.$transaction(async (tx) => {
      const subscriber = await tx.subscriber.create({
        data: {
          waitlistId:   waitlist.id,
          name:         name.trim(),
          email,
          referralCode: newReferralCode!,
          referredById,
          isConfirmed:  false,
        },
        select: { id: true, referralCode: true },
      });

      /* Increment the referring subscriber's denormalised counter */
      if (referredById) {
        await tx.subscriber.update({
          where: { id: referredById },
          data:  { referralsCount: { increment: 1 } },
        });
      }

      return [subscriber];
    });

    /* 7. Derive position from the live ordered list ─────────────── */
    const [totalSubscribers, orderedIds] = await prisma.$transaction([
      prisma.subscriber.count({
        where: { waitlistId: waitlist.id, deletedAt: null },
      }),
      prisma.subscriber.findMany({
        where:   { waitlistId: waitlist.id, deletedAt: null },
        orderBy: [{ referralsCount: "desc" }, { createdAt: "asc" }],
        select:  { id: true },
      }),
    ]);

    return {
      position:      derivePosition(orderedIds, newSubscriber.id),
      referralCode:  newSubscriber.referralCode,
      referralUrl:   buildReferralUrl(newSubscriber.referralCode),
      totalInQueue:  totalSubscribers,
      alreadyJoined: false,
    };
  },
};