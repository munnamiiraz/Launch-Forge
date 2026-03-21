import status from "http-status";
import { prisma }   from "../../lib/prisma";
import AppError     from "../../errorHelpers/AppError";
import type { Prisma } from "../../../generated/client";
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

/* ── Shared Prisma select for a waitlist card ────────────────────── */

const WAITLIST_CARD_SELECT = {
  id:          true,
  slug:        true,
  name:        true,
  description: true,
  logoUrl:     true,
  isOpen:      true,
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
    },
  },
} as const;

export const exploreService = {

  /* ──────────────────────────────────────────────────────────────
     GET /api/explore/waitlists
     ──────────────────────────────────────────────────────────────
     Public — no auth required.

     Returns a paginated list of all non-deleted waitlists, enriched
     with subscriber counts, top referrers, and prizes.

     Supports:
       ?search=     — full-text search on name + description
       ?sort=       — trending | newest | most-joined | closing-soon
       ?openOnly=   — true to filter to isOpen = true
       ?prizesOnly= — true to filter to waitlists with ≥1 active prize
       ?page=       — pagination
       ?limit=      — page size (max 48)
     ────────────────────────────────────────────────────────────── */

  async getExploreWaitlists(
    payload: GetExploreWaitlistsPayload,
  ): Promise<PaginatedExploreWaitlists> {
    const { query } = payload;
    const { page, limit, skip } = normaliseExploreQuery(query);

    /* 1. Build the where clause ──────────────────────────────────── */
    const where: Prisma.WaitlistWhereInput = {
      deletedAt: null,
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

    /*
     * prizesOnly: waitlists with at least one ACTIVE, non-deleted prize.
     * Using `some` on the nested relation filter.
     */
    if (query.prizesOnly) {
      where.prizes = {
        some: { deletedAt: null, status: "ACTIVE" },
      };
    }

    /* 2. Build the orderBy clause ────────────────────────────────── */
    /*
     * "trending"    — we sort by recentJoins in-process after fetching,
     *                 because Prisma can't directly ORDER BY a nested COUNT
     *                 with a date filter inline. We over-fetch and re-sort.
     * "newest"      — createdAt DESC (simple)
     * "most-joined" — _count.subscribers DESC (Prisma supports this)
     * "closing-soon"— expiresAt ASC (nulls last — not in current schema,
     *                 falls back to newest)
     */
    const sort = query.sort ?? "trending";

    const orderBy: Prisma.WaitlistOrderByWithRelationInput =
      sort === "newest"
         ? { createdAt: "desc" as const }
         : sort === "most-joined"
         ? { subscribers: { _count: "desc" as const } }
         : { createdAt: "desc" as const };  // default for trending / closing-soon

    /* 3. Parallel: total count + page of waitlists ───────────────── */
    // Read-only endpoint: avoid Prisma transactions here (P2028 maxWait/timeout).
    const [total, rawWaitlists] = await Promise.all([
      prisma.waitlist.count({ where }),
      prisma.waitlist.findMany({
        where,
        orderBy,
        /*
         * For "trending" we need to score by recentJoins.
         * Fetch up to 3× the page to have enough rows to sort + slice.
         * For all other sorts, fetch exactly skip + limit.
         */
        skip:  sort === "trending" ? 0 : skip,
        take:  sort === "trending" ? Math.min(limit * 3, 200) : limit,
        select: WAITLIST_CARD_SELECT,
      }),
    ]);

    /* 4. Calculate recentJoins per waitlist ──────────────────────── */
    /*
     * "Trending" requires counting signups in the last 24h per waitlist.
     * We do this in a single aggregate query rather than N+1 queries.
     *
     * Result shape: [{ waitlistId: string, _count: { id: number } }]
     */
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
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/explore/waitlists/:slug
     ──────────────────────────────────────────────────────────────
     Public — no auth required.
     Returns the full card detail for a single waitlist by slug.
     Used when the frontend needs to pre-render the product detail
     sheet before the user submits the join form.
     ────────────────────────────────────────────────────────────── */

  async getExploreWaitlistBySlug(
    payload: GetExploreWaitlistBySlugPayload,
  ): Promise<ExploreWaitlistCard> {
    const { slug } = payload;

    const raw = await prisma.waitlist.findFirst({
      where:  { slug, deletedAt: null },
      select: WAITLIST_CARD_SELECT,
    });

    if (!raw) {
      throw new AppError(status.NOT_FOUND, EXPLORE_MESSAGES.NOT_FOUND);
    }

    /* Recent joins for this one waitlist */
    const cutoff = trendingCutoff();
    const recentCount = await prisma.subscriber.count({
      where: {
        waitlistId: raw.id,
        createdAt:  { gte: cutoff },
        deletedAt:  null,
      },
    });

    return toExploreCard(raw, recentCount);
  },
};
