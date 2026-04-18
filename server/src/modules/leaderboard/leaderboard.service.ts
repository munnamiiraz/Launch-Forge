// .service
import status from "http-status";
import { prisma }   from "../../lib/prisma";
import AppError     from "../../errorHelpers/AppError";
import {
  GetLeaderboardPayload,
  GetLeaderboardPayloadWithSlug,
  PaginatedLeaderboard,
  LeaderboardEntry,
  MinimalLeaderboardEntry,
  RawSubscriberRow,
  LeaderboardSummary,
  LeaderboardPaginationMeta,
  GetPublicLeaderboardPayload,
  PaginatedPublicLeaderboard,
  PublicLeaderboardEntry,
} from "./leaderboard.interface";
import { LEADERBOARD_MESSAGES } from "./leaderboard.constants";
import {
  resolveTier,
  buildReferralUrl,
  countChain,
  buildChildrenMap,
  buildReferralPreview,
  calcSharePercent,
  filterByTier,
  normaliseLeaderboardPagination,
  buildLeaderboardMeta,
  maskEmail,
} from "./leaderboard.utils";
import { withCache } from "../../lib/redis";

/* ──────────────────────────────────────────────────────────────
   Internal Service Implementations (Raw)
   ────────────────────────────────────────────────────────────── */

const getPublicLeaderboardRaw = async (
  payload: GetPublicLeaderboardPayload,
): Promise<PaginatedPublicLeaderboard> => {
  const { waitlistSlug, query } = payload;

  /* 1. Resolve waitlist by slug (public — no workspace check) ───── */
  const waitlist = await prisma.waitlist.findFirst({
    where: { slug: waitlistSlug, deletedAt: null },
    select: { id: true, slug: true },
  });

  if (!waitlist) {
    throw new AppError(status.NOT_FOUND, LEADERBOARD_MESSAGES.NOT_FOUND);
  }

  /* 2. Fetch all non-deleted, confirmed subscribers ─────────────── */
  const allRaw: RawSubscriberRow[] = await prisma.subscriber.findMany({
    where: { waitlistId: waitlist.id, deletedAt: null },
    orderBy: [
      { referralsCount: "desc" },
      { createdAt:      "asc"  },
    ],
    select: {
      id:             true,
      name:           true,
      email:          true,
      referralCode:   true,
      referralsCount: true,
      referredById:   true,
      isConfirmed:    true,
      createdAt:      true,
    },
  });

  /* 3. Rank ─────────────────────────────────────────────────────── */
  const idToRank     = new Map<string, number>();
  const idToQueuePos = new Map<string, number>();

  allRaw.forEach((s, i) => {
    idToRank.set(s.id,     i + 1);
    idToQueuePos.set(s.id, i + 1);
  });

  /* 4. Summary stats ────────────────────────────────────────────── */
  const totalSubscribers = allRaw.length;
  const activeReferrers  = allRaw.filter(s => s.referralsCount > 0).length;
  const totalReferrals   = allRaw.reduce((sum, s) => sum + s.referralsCount, 0);
  const topReferralCount = allRaw.length > 0 ? allRaw[0].referralsCount : 0;
  const avgReferralsPerReferrer =
    activeReferrers === 0
      ? 0
      : Math.round((totalReferrals / activeReferrers) * 10) / 10;

  const newestSubscriberAt =
    allRaw.length === 0
      ? null
      : allRaw.reduce(
          (latest, s) => (s.createdAt > latest ? s.createdAt : latest),
          allRaw[0].createdAt,
        );

  const summary = {
    totalSubscribers,
    totalReferrals,
    activeReferrers,
    avgReferralsPerReferrer,
    topReferralCount,
    newestSubscriberAt,
  };

  /* 5. Build entries ────────────────────────────────────────────── */
  const childrenMap    = buildChildrenMap(allRaw);
  const subscribersMap = new Map<string, RawSubscriberRow>(
    allRaw.map(s => [s.id, s]),
  );

  const entries: PublicLeaderboardEntry[] = allRaw.map(sub => {
    const rank = idToRank.get(sub.id)!;

    const referredBy = sub.referredById
      ? (() => {
          const referrer = subscribersMap.get(sub.referredById);
          if (!referrer) return null;
          return {
            id:   referrer.id,
            name: referrer.name,
            rank: idToRank.get(referrer.id) ?? null,
            // email intentionally omitted
          };
        })()
      : null;

    return {
      rank,
      tier:            resolveTier(rank),
      id:              sub.id,
      name:            sub.name,
      email:           maskEmail(sub.email),
      referralCode:    sub.referralCode,
      referralUrl:     buildReferralUrl(waitlistSlug, sub.referralCode),
      directReferrals: sub.referralsCount,
      chainReferrals:  countChain(sub.id, childrenMap),
      sharePercent:    calcSharePercent(sub.referralsCount, totalReferrals),
      queuePosition:   idToQueuePos.get(sub.id)!,
      isConfirmed:     sub.isConfirmed,
      joinedAt:        sub.createdAt,
      referredBy,
      referralPreview: buildReferralPreview(sub.id, allRaw),
    };
  });

  /* 6. Apply tier + search filters ─────────────────────────────── */
  let filtered = filterByTier(entries, query.tier);

  if (query.search) {
    const q = query.search.toLowerCase();
    // Search on masked email intentionally — avoid leaking real addresses
    filtered = filtered.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q),
    );
  }

  /* 7. Paginate ─────────────────────────────────────────────────── */
  const { page, limit, skip } = normaliseLeaderboardPagination(query);
  const pageSlice = filtered.slice(skip, skip + limit);

  return {
    data:    pageSlice,
    meta:    buildLeaderboardMeta(filtered.length, page, limit),
    summary,
  };
};

/* ──────────────────────────────────────────────────────────────
   Exported Service with Redis Caching
   ────────────────────────────────────────────────────────────── */

export const leaderboardService = {

  /* ── GET /api/waitlists/:id/leaderboard/full ─────────────────── */

  async getLeaderboard(
    payload: GetLeaderboardPayload,
  ): Promise<PaginatedLeaderboard> {
    const { waitlistId, workspaceId, requestingUserId, query } = payload;

    /* 1. Verify workspace membership ────────────────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, LEADERBOARD_MESSAGES.UNAUTHORIZED);
    }

    /* 2. Verify waitlist belongs to this workspace ───────────────── */
    const waitlist = await prisma.waitlist.findUnique({
      where: { id: waitlistId, workspaceId, deletedAt: null },
      select: { id: true, slug: true },
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, LEADERBOARD_MESSAGES.NOT_FOUND);
    }
    const waitlistSlug = waitlist.slug;

    /* 3. Fetch ALL non-deleted subscribers for full context ───────── */
    const allRaw: RawSubscriberRow[] = await prisma.subscriber.findMany({
      where: { waitlistId, deletedAt: null },
      orderBy: [
        { referralsCount: "desc" },
        { createdAt:      "asc"  },
      ],
      select: {
        id:             true,
        name:           true,
        email:          true,
        referralCode:   true,
        referralsCount: true,
        referredById:   true,
        isConfirmed:    true,
        createdAt:      true,
      },
    });

    /* 4. Cross-reference counts if countMode === "confirmed" ────────
     * If the user wants "confirmed only", we recalculate directReferrals
     * by only counting confirmed children in the referral tree.
     * ────────────────────────────────────────────────────────────── */
    const isConfirmedOnly = query.countMode === "confirmed";
    const confirmedCounts = new Map<string, number>();

    if (isConfirmedOnly) {
      for (const s of allRaw) {
        if (s.isConfirmed && s.referredById) {
          confirmedCounts.set(s.referredById, (confirmedCounts.get(s.referredById) || 0) + 1);
        }
      }
    }

    // Map the raw data to a working object that includes the effective count
    const contestants = allRaw.map(s => ({
      ...s,
      effectiveReferrals: isConfirmedOnly 
        ? (confirmedCounts.get(s.id) || 0) 
        : s.referralsCount
    }));

    /* 5. Sort by effectiveReferrals for ranking ─────────────────── */
    contestants.sort((a, b) => {
      if (b.effectiveReferrals !== a.effectiveReferrals) {
        return b.effectiveReferrals - a.effectiveReferrals;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    /* 6. Rank everyone who matches the countMode criteria ─────────
     *
     * In "all" mode, everyone is on the leaderboard.
     * In "confirmed" mode, only confirmed subscribers are on the leaderboard.
     * ────────────────────────────────────────────────────────────── */
    const candidiates = isConfirmedOnly 
      ? contestants.filter(c => c.isConfirmed)
      : contestants;

    const idToRank = new Map<string, number>();
    candidiates.forEach((c, i) => {
      idToRank.set(c.id, i + 1);
    });

    /* 7. Build summary stats ────────────────────────────────────── */
    const totalSubscribers = allRaw.length;
    // activeReferrers = people with at least 1 referral (by current countMode)
    const activeReferrers  = candidiates.filter(c => c.effectiveReferrals > 0).length;
    const totalReferrals   = candidiates.reduce((sum, c) => sum + c.effectiveReferrals, 0);
    const topReferralCount = candidiates.length > 0 ? candidiates[0].effectiveReferrals : 0;
    const avgReferralsPerReferrer = activeReferrers === 0 ? 0 : Math.round((totalReferrals / activeReferrers) * 10) / 10;
    
    // Find newest date without mutating allRaw via sort()
    const newestSubscriberAt = allRaw.length === 0 
      ? null 
      : allRaw.reduce((latest, s) => s.createdAt > latest ? s.createdAt : latest, allRaw[0].createdAt);

    const summary: LeaderboardSummary = {
      totalSubscribers,
      totalReferrals,
      activeReferrers,
      avgReferralsPerReferrer,
      topReferralCount,
      newestSubscriberAt,
    };

    /* 8. Construct final entries ────────────────────────────────── */
    const childrenMap = buildChildrenMap(allRaw);
    const subscribersMap = new Map<string, RawSubscriberRow>();
    const idToQueuePos   = new Map<string, number>();
    
    // Map both for fast lookups
    for (let i = 0; i < allRaw.length; i++) {
      const s = allRaw[i];
      subscribersMap.set(s.id, s);
    }
    
    // Queue position is always calculated from the full canonical waitlist order (contestants)
    contestants.forEach((c, i) => idToQueuePos.set(c.id, i + 1));

    const entries: LeaderboardEntry[] = [];

    for (const sub of candidiates) {
      const rank = idToRank.get(sub.id)!;
      
      const referredBy = sub.referredById
        ? (() => {
            const referrer = subscribersMap.get(sub.referredById);
            if (!referrer) return null;
            return {
              id:    referrer.id,
              name:  referrer.name,
              email: referrer.email,
              rank:  idToRank.get(referrer.id) || null,
            };
          })()
        : null;

      entries.push({
        rank,
        tier:             resolveTier(rank),
        id:               sub.id,
        name:             sub.name,
        email:            sub.email,
        referralCode:     sub.referralCode,
        referralUrl:      buildReferralUrl(waitlistSlug, sub.referralCode),
        directReferrals:  sub.effectiveReferrals,
        chainReferrals:   countChain(sub.id, childrenMap),
        sharePercent:     calcSharePercent(sub.effectiveReferrals, totalReferrals),
        queuePosition:    idToQueuePos.get(sub.id)!,
        isConfirmed:      sub.isConfirmed,
        joinedAt:         sub.createdAt,
        referredBy,
        referralPreview:  buildReferralPreview(sub.id, allRaw),
      });
    }

    /* 9. Apply filters (Tier & Search) ───────────────────────────── */
    let filtered = filterByTier(entries, query.tier);

    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q),
      );
    }

    /* 10. Paginate ──────────────────────────────────────────────── */
    const { page, limit, skip } = normaliseLeaderboardPagination(query);
    const pageSlice = filtered.slice(skip, skip + limit);

    return {
      data:    pageSlice,
      meta:    buildLeaderboardMeta(filtered.length, page, limit),
      summary,
    };
  },


  /* ── GET /api/leaderboard/:waitlistSlug ──────────────────────────── */

  getPublicLeaderboard: withCache("leaderboard", 300, getPublicLeaderboardRaw),

  /* ── GET /api/leaderboard/by-slug/:waitlistSlug (authenticated) ── */

  async getLeaderboardBySlug(
    payload: GetLeaderboardPayloadWithSlug,
  ): Promise<PaginatedLeaderboard> {
    const { waitlistSlug, requestingUserId, query } = payload;

    /* 1. Find waitlist by slug OR by ID (UUID) and get its workspace */
    // First try to find by slug
    let waitlist = await prisma.waitlist.findFirst({
      where: { slug: waitlistSlug, deletedAt: null },
      select: { id: true, workspaceId: true },
    });

    // If not found by slug, try to find by ID (UUID)
    if (!waitlist) {
      waitlist = await prisma.waitlist.findUnique({
        where: { id: waitlistSlug, deletedAt: null },
        select: { id: true, workspaceId: true },
      });
    }

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, LEADERBOARD_MESSAGES.NOT_FOUND);
    }

    /* 2. Verify workspace membership */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId: waitlist.workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, LEADERBOARD_MESSAGES.UNAUTHORIZED);
    }

    /* 3. Use the existing getLeaderboard logic */
    return this.getLeaderboard({
      waitlistId: waitlist.id,
      workspaceId: waitlist.workspaceId,
      requestingUserId,
      query,
    });
  },

  /* ── GET /api/workspaces/:workspaceId/waitlists/:waitlistId/leaderboard/:waitlistSlug ─ */

  async getMinimalLeaderboard(
    payload: GetLeaderboardPayloadWithSlug,
  ): Promise<{
    data: MinimalLeaderboardEntry[];
    meta: LeaderboardPaginationMeta;
    summary: LeaderboardSummary;
  }> {
    const { waitlistSlug, requestingUserId, query } = payload;

    /* 1. Find waitlist by slug OR by ID (UUID) and get its workspace */
    let waitlist = await prisma.waitlist.findFirst({
      where: { slug: waitlistSlug, deletedAt: null },
      select: { id: true, workspaceId: true, slug: true },
    });

    if (!waitlist) {
      waitlist = await prisma.waitlist.findUnique({
        where: { id: waitlistSlug, deletedAt: null },
        select: { id: true, workspaceId: true, slug: true },
      });
    }

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, LEADERBOARD_MESSAGES.NOT_FOUND);
    }

    /* 2. Verify workspace membership */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId: waitlist.workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, LEADERBOARD_MESSAGES.UNAUTHORIZED);
    }

    /* 3. Fetch all non-deleted subscribers for full context */
    const allRaw: RawSubscriberRow[] = await prisma.subscriber.findMany({
      where: { waitlistId: waitlist.id, deletedAt: null },
      orderBy: [
        { referralsCount: "desc" },
        { createdAt:      "asc"  },
      ],
      select: {
        id:             true,
        name:           true,
        email:          true,
        referralCode:   true,
        referralsCount: true,
        referredById:   true,
        isConfirmed:    true,
        createdAt:      true,
      },
    });

    /* 4. Rank */
    const idToRank     = new Map<string, number>();
    const idToQueuePos = new Map<string, number>();

    allRaw.forEach((s, i) => {
      idToRank.set(s.id,     i + 1);
      idToQueuePos.set(s.id, i + 1);
    });

    /* 5. Build children map for chain calculations */
    const childrenMap = buildChildrenMap(allRaw);

    /* 6. Summary stats */
    const totalSubscribers = allRaw.length;
    const activeReferrers  = allRaw.filter(s => s.referralsCount > 0).length;
    const totalReferrals   = allRaw.reduce((sum, s) => sum + s.referralsCount, 0);
    const topReferralCount = allRaw.length > 0 ? allRaw[0].referralsCount : 0;
    const avgReferralsPerReferrer =
      activeReferrers === 0
        ? 0
        : Math.round((totalReferrals / activeReferrers) * 10) / 10;

    const newestSubscriberAt =
      allRaw.length === 0
        ? null
        : allRaw.reduce(
            (latest, s) => (s.createdAt > latest ? s.createdAt : latest),
            allRaw[0].createdAt,
          );

    const summary: LeaderboardSummary = {
      totalSubscribers,
      totalReferrals,
      activeReferrers,
      avgReferralsPerReferrer,
      topReferralCount,
      newestSubscriberAt,
    };

    /* 7. Build minimal entries */
    const entries: MinimalLeaderboardEntry[] = allRaw.map(sub => ({
      rank:            idToRank.get(sub.id)!,
      tier:            resolveTier(idToRank.get(sub.id)!),
      id:              sub.id,
      name:            sub.name,
      email:           sub.email,
      directReferrals: sub.referralsCount,
      chainReferrals:  countChain(sub.id, childrenMap),
      sharePercent:    calcSharePercent(sub.referralsCount, totalReferrals),
      queuePosition:   idToQueuePos.get(sub.id)!,
    }));

    /* 8. Apply filters */
    let filtered = entries;

    if (query.tier && query.tier !== "all") {
      filtered = filtered.filter(e => e.tier === query.tier);
    }

    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter(
        e => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
      );
    }

    /* 9. Paginate */
    const { page, limit, skip } = normaliseLeaderboardPagination(query);
    const pageSlice = filtered.slice(skip, skip + limit);

    return {
      data:    pageSlice,
      meta:    buildLeaderboardMeta(filtered.length, page, limit),
      summary,
    };
  },
};
