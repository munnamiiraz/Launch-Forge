import status from "http-status";
import { prisma }  from "../../lib/prisma";
import AppError    from "../../errorHelpers/AppError";
import {
  GetSubscribersPayload,
  GetLeaderboardPayload,
  PaginatedSubscribers,
  LeaderboardResult,
} from "./subscriber.interface";
import { SUBSCRIBER_MESSAGES } from "./subscriber.constants";
import {
  normaliseSubscriberPagination,
  normaliseLeaderboardLimit,
  buildSubscriberMeta,
  attachPositions,
  buildLeaderboardEntries,
  calcSharePercent,
} from "./subscriber.utils";

export const subscriberService = {

  /* ── GET /api/waitlists/:id/subscribers ──────────────────────── */

  async getSubscribers(
    payload: GetSubscribersPayload,
  ): Promise<PaginatedSubscribers> {
    const { waitlistId, workspaceId, requestingUserId, query } = payload;

    /* 1. Verify workspace membership ────────────────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, SUBSCRIBER_MESSAGES.UNAUTHORIZED);
    }

    /* 2. Verify waitlist belongs to this workspace ───────────────── */
    const waitlist = await prisma.waitlist.findUnique({
      where: { id: waitlistId, workspaceId, deletedAt: null },
      select: { id: true },
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, SUBSCRIBER_MESSAGES.NOT_FOUND);
    }

    /* 3. Build filters ──────────────────────────────────────────── */
    const { page, limit, skip } = normaliseSubscriberPagination(query);

    const searchFilter = query.search
      ? {
          OR: [
            { name:  { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const confirmedFilter =
      query.isConfirmed !== undefined
        ? { isConfirmed: query.isConfirmed }
        : {};

    const where = {
      waitlistId,
      deletedAt: null,
      ...searchFilter,
      ...confirmedFilter,
    };

    /*
     * Sort strategy:
     *
     * When the caller sorts by referralsCount we always apply createdAt ASC
     * as the tiebreaker — this matches the canonical queue order so position
     * numbers are stable and meaningful even mid-page.
     *
     * Any other sort field sorts independently (e.g. name A-Z).
     */
    const sortField = query.sortBy    ?? "createdAt";
    const sortOrder = query.sortOrder ?? "desc";

    const orderBy =
      sortField === "referralsCount"
        ? [{ referralsCount: sortOrder }, { createdAt: "asc" as const }]
        : [{ [sortField]: sortOrder }];

    /* 4. Parallel: confirmed count + total count + page slice ───── */
    const [confirmedCount, total, rows] = await prisma.$transaction([
      prisma.subscriber.count({ where: { waitlistId, deletedAt: null, isConfirmed: true } }),
      prisma.subscriber.count({ where }),
      prisma.subscriber.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id:             true,
          name:           true,
          email:          true,
          referralCode:   true,
          referralsCount: true,
          isConfirmed:    true,
          createdAt:      true,
          referredBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    /*
     * Position numbers are only globally accurate when sorting by the
     * canonical queue order (referralsCount DESC, createdAt ASC).
     * For other sorts we still attach positions but they reflect the
     * filtered+sorted slice — documented in the response.
     */
    const rowsWithPositions = attachPositions(rows, skip);

    return {
      data: rowsWithPositions.map((r) => ({
        id:             r.id,
        name:           r.name,
        email:          r.email,
        referralCode:   r.referralCode,
        referralsCount: r.referralsCount,
        isConfirmed:    r.isConfirmed,
        createdAt:      r.createdAt,
        position:       r.position,
        referredBy:     r.referredBy ?? null,
      })),
      meta: buildSubscriberMeta(total, confirmedCount, page, limit),
    };
  },

  /* ── GET /api/waitlists/:id/leaderboard ──────────────────────── */

  async getLeaderboard(
    payload: GetLeaderboardPayload,
  ): Promise<LeaderboardResult> {
    const { waitlistId, workspaceId, requestingUserId, query } = payload;

    /* 1. Verify workspace membership ────────────────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, SUBSCRIBER_MESSAGES.UNAUTHORIZED);
    }

    /* 2. Verify waitlist belongs to this workspace ───────────────── */
    const waitlist = await prisma.waitlist.findUnique({
      where: { id: waitlistId, workspaceId, deletedAt: null },
      select: { id: true },
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, SUBSCRIBER_MESSAGES.NOT_FOUND);
    }

    const topN = normaliseLeaderboardLimit(query.limit);

    /* 3. Parallel: total subscribers + sum of all referrals + top-N rows ─ */
    const [totalSubscribers, sumResult, topRows] = await prisma.$transaction([
      prisma.subscriber.count({
        where: { waitlistId, deletedAt: null },
      }),

      /*
       * Aggregate total referrals across all subscribers.
       * We use _sum on the denormalised referralsCount column — O(1) vs
       * a GROUP BY count which would be O(n).
       */
      prisma.subscriber.aggregate({
        where:  { waitlistId, deletedAt: null },
        _sum:   { referralsCount: true },
      }),

      prisma.subscriber.findMany({
        where:   { waitlistId, deletedAt: null, referralsCount: { gt: 0 } },
        orderBy: [{ referralsCount: "desc" }, { createdAt: "asc" }],
        take:    topN,
        select:  {
          id:             true,
          name:           true,
          email:          true,
          referralCode:   true,
          referralsCount: true,
          createdAt:      true,
        },
      }),
    ]);

    const totalReferrals = sumResult._sum.referralsCount ?? 0;

    return {
      data:             buildLeaderboardEntries(topRows, totalReferrals),
      totalReferrals,
      totalSubscribers,
    };
  },
};