import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError   from "../../errorHelpers/AppError";
import {
  CreatePrizePayload,
  UpdatePrizePayload,
  DeletePrizePayload,
  GetPrizesPayload,
  GetPublicPrizesPayload,
  PrizeRow,
  PublicPrizeRow,
  DeletedPrizeAck,
} from "./pricemoney.interface";
import {
  PRIZE_MESSAGES,
  MAX_ACTIVE_PRIZES_PER_WAITLIST,
  EDITABLE_STATUSES,
} from "./pricemoney.constant";
import {
  hasRankOverlap,
  buildPrizeUpdateData,
  toPublicPrizeRow,
  sortPrizesByRank,
} from "./pricemoney.utils";
import { assertPlanFeature } from "../../middlewares/checkPlanFeature";

/* ── Shared Prisma select ────────────────────────────────────────── */

const PRIZE_SELECT = {
  id:          true,
  waitlistId:  true,
  title:       true,
  description: true,
  prizeType:   true,
  value:       true,
  currency:    true,
  rankFrom:    true,
  rankTo:      true,
  imageUrl:    true,
  status:      true,
  expiresAt:   true,
  createdAt:   true,
  updatedAt:   true,
} as const;

export const prizeService = {

  /* ──────────────────────────────────────────────────────────────
     POST /api/prizes
     Owner creates a prize for a specific rank range on a waitlist.
     Only OWNER role may create prizes.
     ────────────────────────────────────────────────────────────── */

  async createPrize(payload: CreatePrizePayload): Promise<PrizeRow> {
    const {
      waitlistId, workspaceId, requestingUserId,
      title, description, prizeType, value, currency,
      rankFrom, rankTo, imageUrl, expiresAt,
    } = payload;

    /* 1. Plan gate — require Pro or higher ──────────────────────── */
    await assertPlanFeature(workspaceId, "prizeAnnouncements");

    /* 2. Verify membership and require OWNER role ────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
      select: { role: true },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, PRIZE_MESSAGES.UNAUTHORIZED);
    }

    if (membership.role !== "OWNER") {
      throw new AppError(status.FORBIDDEN, PRIZE_MESSAGES.FORBIDDEN);
    }

    /* 2. Verify waitlist belongs to this workspace ───────────────── */
    const waitlist = await prisma.waitlist.findUnique({
      where: { id: waitlistId, workspaceId, deletedAt: null },
      select: { id: true },
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, PRIZE_MESSAGES.WAITLIST_NOT_FOUND);
    }

    /* 3. Enforce max active prizes per waitlist ──────────────────── */
    const activePrizeCount = await prisma.leaderboardPrize.count({
      where: { waitlistId, status: "ACTIVE", deletedAt: null },
    });

    if (activePrizeCount >= MAX_ACTIVE_PRIZES_PER_WAITLIST) {
      throw new AppError(status.CONFLICT, PRIZE_MESSAGES.MAX_PRIZES);
    }

    /* 4. Rank overlap guard — no two active prizes share ranks ───── */
    const existingPrizes = await prisma.leaderboardPrize.findMany({
      where:  { waitlistId, status: "ACTIVE", deletedAt: null },
      select: { id: true, rankFrom: true, rankTo: true },
    });

    if (hasRankOverlap(existingPrizes, rankFrom, rankTo)) {
      throw new AppError(status.CONFLICT, PRIZE_MESSAGES.RANK_OVERLAP);
    }

    /* 5. Create the prize ───────────────────────────────────────── */
    const prize = await prisma.leaderboardPrize.create({
      data: {
        waitlistId,
        title:       title.trim(),
        description: description?.trim() ?? null,
        prizeType,
        value:       value    ?? null,
        currency:    currency ?? null,
        rankFrom,
        rankTo,
        imageUrl:    imageUrl ?? null,
        expiresAt:   expiresAt ?? null,
        status:      "ACTIVE",
      },
      select: PRIZE_SELECT,
    });

    return prize as PrizeRow;
  },

  /* ──────────────────────────────────────────────────────────────
     PATCH /api/prizes/:id
     Owner updates prize fields. AWARDED prizes are immutable.
     ────────────────────────────────────────────────────────────── */

  async updatePrize(payload: UpdatePrizePayload): Promise<PrizeRow> {
    const { prizeId, waitlistId, workspaceId, requestingUserId } = payload;

    /* 1. Membership + OWNER check ───────────────────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
      select: { role: true },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, PRIZE_MESSAGES.UNAUTHORIZED);
    }

    if (membership.role !== "OWNER") {
      throw new AppError(status.FORBIDDEN, PRIZE_MESSAGES.FORBIDDEN);
    }

    /* 2. Fetch prize with its parent waitlist ────────────────────── */
    const prize = await prisma.leaderboardPrize.findUnique({
      where: { id: prizeId, deletedAt: null },
      select: {
        id:        true,
        status:    true,
        rankFrom:  true,
        rankTo:    true,
        waitlist: {
          select: { workspaceId: true, deletedAt: true },
        },
      },
    });

    if (!prize) {
      throw new AppError(status.NOT_FOUND, PRIZE_MESSAGES.NOT_FOUND);
    }

    /* 3. IDOR guard — surface as 404 ────────────────────────────── */
    if (
      prize.waitlist.workspaceId !== workspaceId ||
      prize.waitlist.deletedAt   !== null
    ) {
      throw new AppError(status.NOT_FOUND, PRIZE_MESSAGES.NOT_FOUND);
    }

    /* 4. Prevent editing AWARDED prizes ─────────────────────────── */
    if (!EDITABLE_STATUSES.includes(prize.status)) {
      throw new AppError(status.CONFLICT, PRIZE_MESSAGES.ALREADY_AWARDED);
    }

    /* 5. Rank overlap guard for the new range (if changed) ──────── */
    const newFrom = payload.rankFrom ?? prize.rankFrom;
    const newTo   = payload.rankTo   ?? prize.rankTo;

    if (
      payload.rankFrom !== undefined ||
      payload.rankTo   !== undefined
    ) {
      const siblings = await prisma.leaderboardPrize.findMany({
        where:  { waitlistId, status: "ACTIVE", deletedAt: null },
        select: { id: true, rankFrom: true, rankTo: true },
      });

      if (hasRankOverlap(siblings, newFrom, newTo, prizeId)) {
        throw new AppError(status.CONFLICT, PRIZE_MESSAGES.RANK_OVERLAP);
      }
    }

    /* 6. Build and apply the partial update ─────────────────────── */
    const data = buildPrizeUpdateData({
      title:       payload.title,
      description: payload.description,
      prizeType:   payload.prizeType,
      value:       payload.value,
      currency:    payload.currency,
      rankFrom:    payload.rankFrom,
      rankTo:      payload.rankTo,
      imageUrl:    payload.imageUrl,
      expiresAt:   payload.expiresAt,
      status:      payload.status,
    });

    const updated = await prisma.leaderboardPrize.update({
      where:  { id: prizeId },
      data,
      select: PRIZE_SELECT,
    });

    return updated as PrizeRow;
  },

  /* ──────────────────────────────────────────────────────────────
     DELETE /api/prizes/:id
     Soft-delete the prize. AWARDED prizes may not be deleted.
     ────────────────────────────────────────────────────────────── */

  async deletePrize(payload: DeletePrizePayload): Promise<DeletedPrizeAck> {
    const { prizeId, waitlistId, workspaceId, requestingUserId } = payload;

    /* 1. Membership + OWNER check ───────────────────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
      select: { role: true },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, PRIZE_MESSAGES.UNAUTHORIZED);
    }

    if (membership.role !== "OWNER") {
      throw new AppError(status.FORBIDDEN, PRIZE_MESSAGES.FORBIDDEN);
    }

    /* 2. Fetch and verify ───────────────────────────────────────── */
    const prize = await prisma.leaderboardPrize.findUnique({
      where: { id: prizeId, deletedAt: null },
      select: {
        id:     true,
        title:  true,
        status: true,
        waitlist: { select: { workspaceId: true } },
      },
    });

    if (!prize) {
      throw new AppError(status.NOT_FOUND, PRIZE_MESSAGES.NOT_FOUND);
    }

    if (prize.waitlist.workspaceId !== workspaceId) {
      throw new AppError(status.NOT_FOUND, PRIZE_MESSAGES.NOT_FOUND);
    }

    if (prize.status === "AWARDED") {
      throw new AppError(status.CONFLICT, PRIZE_MESSAGES.ALREADY_AWARDED);
    }

    /* 3. Soft-delete ────────────────────────────────────────────── */
    const deletedAt = new Date();

    await prisma.leaderboardPrize.update({
      where: { id: prizeId },
      data:  { deletedAt },
    });

    return { id: prize.id, title: prize.title, deletedAt };
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/prizes/waitlist/:waitlistId   (authenticated)
     Workspace members see all prizes including CANCELLED/AWARDED.
     ────────────────────────────────────────────────────────────── */

  async getPrizes(payload: GetPrizesPayload): Promise<PrizeRow[]> {
    const { waitlistId, workspaceId, requestingUserId } = payload;

    /* 1. Membership check ───────────────────────────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, PRIZE_MESSAGES.UNAUTHORIZED);
    }

    /* 2. Verify waitlist belongs to workspace ───────────────────── */
    const waitlist = await prisma.waitlist.findUnique({
      where: { id: waitlistId, workspaceId, deletedAt: null },
      select: { id: true },
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, PRIZE_MESSAGES.WAITLIST_NOT_FOUND);
    }

    /* 3. Fetch all non-deleted prizes ───────────────────────────── */
    const prizes = await prisma.leaderboardPrize.findMany({
      where:   { waitlistId, deletedAt: null },
      orderBy: [{ rankFrom: "asc" }, { rankTo: "asc" }],
      select:  PRIZE_SELECT,
    });

    return prizes as PrizeRow[];
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/prizes/public/:waitlistId   (no auth)
     Public visitors see only ACTIVE prizes that haven't expired.
     ────────────────────────────────────────────────────────────── */

  async getPublicPrizes(
    payload: GetPublicPrizesPayload,
  ): Promise<PublicPrizeRow[]> {
    const { waitlistId } = payload;

    /* Verify the waitlist exists and is public (not deleted) ─────── */
    const waitlist = await prisma.waitlist.findUnique({
      where: { id: waitlistId, deletedAt: null },
      select: { id: true },
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, "Waitlist not found.");
    }

    const now = new Date();

    /* Fetch ACTIVE prizes that haven't expired yet ───────────────── */
    const prizes = await prisma.leaderboardPrize.findMany({
      where: {
        waitlistId,
        status:    "ACTIVE",
        deletedAt: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: [{ rankFrom: "asc" }, { rankTo: "asc" }],
      select:  PRIZE_SELECT,
    });

    return sortPrizesByRank(prizes as PrizeRow[]).map(toPublicPrizeRow);
  },
};