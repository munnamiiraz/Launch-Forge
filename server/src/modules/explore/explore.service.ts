import status from "http-status";
import { prisma }   from "../../lib/prisma";
import AppError     from "../../errorHelpers/AppError";
import type { Prisma } from "../../generated/client";
import {
  GetExploreWaitlistsPayload,
  GetExploreWaitlistBySlugPayload,
  PaginatedExploreWaitlists,
  ExploreWaitlistCard,
} from "./explore.interface";
import { EXPLORE_MESSAGES, EXPLORE_CARD } from "./explore.constant";
import {
  normaliseExploreQuery,
  buildExploreMeta,
  trendingCutoff,
  toExploreCard,
} from "./explore.utils";

import { withCache } from "../../lib/redis";

/* ── Shared Prisma select for a waitlist card ────────────────────── */

const WAITLIST_CARD_SELECT = {
  id:          true,
  slug:        true,
  name:        true,
  description: true,
  logoUrl:     true,
  category:    true,
  isOpen:      true,
  endDate:     true,
  createdAt:   true,
  workspace: {
    select: { slug: true },
  },
  _count: {
    select: { subscribers: { where: { deletedAt: null } } },
  },
  /*
   * We pull the top referrers directly inside the waitlist select
   * using a nested findMany ordered by referralsCount.
   * Prisma supports ORDER BY on nested relations via relation queries.
   */
  subscribers: {
    where:   { deletedAt: null, referralsCount: { gt: 0 } },
    orderBy: { referralsCount: "desc" as const },
    take:    EXPLORE_CARD.TOP_REFERRERS,
    select:  { name: true, referralsCount: true },
  },
  prizes: {
    where:   { deletedAt: null, status: "ACTIVE" as const },
    orderBy: { rankFrom: "asc" as const },
    take:    EXPLORE_CARD.TOP_PRIZES,
    select: {
      id:        true,
      rankFrom:  true,
      rankTo:    true,
      title:     true,
      prizeType: true,
      value:     true,
      currency:  true,
      expiresAt: true,
    },
  },
} as const;

/* ──────────────────────────────────────────────────────────────
   Internal Service Implementations (Raw)
   ────────────────────────────────────────────────────────────── */

const getExploreWaitlistsRaw = async (
  payload: GetExploreWaitlistsPayload,
): Promise<PaginatedExploreWaitlists> => {
  const { query } = payload;
  const { page, limit, skip } = normaliseExploreQuery(query);

  /* 1. Build the where clause ──────────────────────────────────── */
  const where: Prisma.WaitlistWhereInput = {
    deletedAt: null,
    archivedAt: null,
  };

  if (query.search?.trim()) {
    const q = query.search.trim();
    where.OR = [
      { name:        { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { slug:        { contains: q, mode: "insensitive" } },
    ];
  }

  if (query.openOnly) {
    where.isOpen = true;
  }

  if (query.prizesOnly) {
    where.prizes = {
      some: { deletedAt: null, status: "ACTIVE" },
    };
  }

  if (query.category) {
    where.category = { equals: query.category, mode: "insensitive" };
  }

  /* 2. Build the orderBy clause ────────────────────────────────── */
  const sort = query.sort ?? "trending";

  const orderBy: Prisma.WaitlistOrderByWithRelationInput =
    sort === "newest"
       ? { createdAt: "desc" as const }
       : sort === "most-joined"
       ? { subscribers: { _count: "desc" as const } }
       : { createdAt: "desc" as const };

  /* 3. Parallel: total count + page of waitlists ───────────────── */
  const [total, rawWaitlists] = await Promise.all([
    prisma.waitlist.count({ where }),
    prisma.waitlist.findMany({
      where,
      orderBy,
      skip:  sort === "trending" ? 0 : skip,
      take:  sort === "trending" ? Math.min(limit * 3, 200) : limit,
      select: WAITLIST_CARD_SELECT,
    }),
  ]);

  /* 4. Calculate recentJoins per waitlist ──────────────────────── */
  const cutoff = trendingCutoff();
  const recentJoinMap = new Map<string, number>();

  if (rawWaitlists.length > 0) {
    const recentJoinRows = await prisma.subscriber.groupBy({
      by:     ["waitlistId"],
      where: {
        waitlistId: { in: rawWaitlists.map((w) => w.id) },
        createdAt:  { gte: cutoff },
        deletedAt:  null,
      },
      _count: { id: true },
    });

    for (const row of recentJoinRows) {
      recentJoinMap.set(row.waitlistId, row._count.id);
    }
  }

  /* 5. Map to card shapes ─────────────────────────────────────── */
  let cards = rawWaitlists.map((raw) =>
    toExploreCard(raw, recentJoinMap.get(raw.id) ?? 0),
  );

  /* 6. Re-sort + paginate for "trending" ──────────────────────── */
  if (sort === "trending") {
    cards.sort((a, b) => b.recentJoins - a.recentJoins);
    cards = cards.slice(skip, skip + limit);
  }

  return {
    data: cards,
    meta: buildExploreMeta(total, page, limit),
  };
};

const getExploreWaitlistBySlugRaw = async (
  payload: GetExploreWaitlistBySlugPayload,
): Promise<ExploreWaitlistCard> => {
  const { slug } = payload;

  const raw = await prisma.waitlist.findFirst({
    where:  { slug, deletedAt: null, archivedAt: null },
    select: WAITLIST_CARD_SELECT,
  });

  if (!raw) {
    throw new AppError(status.NOT_FOUND, EXPLORE_MESSAGES.NOT_FOUND);
  }

  const cutoff = trendingCutoff();
  const recentCount = await prisma.subscriber.count({
    where: {
      waitlistId: raw.id,
      createdAt:  { gte: cutoff },
      deletedAt:  null,
    },
  });

  return toExploreCard(raw, recentCount);
};

/* ──────────────────────────────────────────────────────────────
   Exported Service with Redis Caching
   ────────────────────────────────────────────────────────────── */

export const exploreService = {
  getExploreWaitlists:      withCache("explore:grid", 300, getExploreWaitlistsRaw),
  getExploreWaitlistBySlug: withCache("explore:details", 300, getExploreWaitlistBySlugRaw),
};
