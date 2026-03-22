import {
  LeaderboardTier,
  LeaderboardEntry,
  LeaderboardSummary,
  LeaderboardPaginationMeta,
  RawSubscriberRow,
  ReferralPreviewEntry,
  GetLeaderboardQuery,
} from "./leaderboard.interface";
import {
  LEADERBOARD_TIERS,
  LEADERBOARD_PAGINATION,
  REFERRAL_CHAIN,
} from "./leaderboard.constants";

/* ── Tier resolution ─────────────────────────────────────────────── */

/**
 * Resolve the visual tier badge for a given 1-based rank.
 * Subscribers with 0 referrals are excluded from the ranked list
 * so they never receive a tier.
 */
export function resolveTier(rank: number): LeaderboardTier {
  if (rank === LEADERBOARD_TIERS.CHAMPION_RANK) return "champion";
  if (rank <= LEADERBOARD_TIERS.TOP10_MAX)      return "top10";
  if (rank <= LEADERBOARD_TIERS.TOP25_MAX)      return "top25";
  return "rising";
}

/* ── Referral URL builder ────────────────────────────────────────── */

export function buildReferralUrl(waitlistSlug: string, referralCode: string): string {
  const base =
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://launchforge.app";

  const normalisedBase = base.replace(/\/+$/, "");
  return `${normalisedBase}/explore/${waitlistSlug}/${referralCode}`;
}

/* ── Referral chain counter ─────────────────────────────────────── */

/**
 * Count the total number of subscribers in a referrer's entire
 * downstream chain (direct + indirect up to MAX_DEPTH hops).
 *
 * Uses the referral index map built once from the full subscriber list
 * to avoid repeated DB queries. O(n) per subscriber in the worst case
 * but runs entirely in-process after a single DB fetch.
 *
 * @param rootId      - the subscriber whose chain we're counting
 * @param childrenMap - pre-built Map<subscriberId, directChildIds[]>
 * @param depth       - current recursion depth (caller passes 0)
 */
export function countChain(
  rootId: string,
  childrenMap: Map<string, string[]>,
  depth: number = 0,
): number {
  if (depth >= REFERRAL_CHAIN.MAX_DEPTH) return 0;

  const directChildren = childrenMap.get(rootId) ?? [];
  let total = directChildren.length;

  for (const childId of directChildren) {
    total += countChain(childId, childrenMap, depth + 1);
  }

  return total;
}

/**
 * Build a Map<parentId, childId[]> from the full subscriber list.
 * Called once per request; lookup is then O(1) per node.
 */
export function buildChildrenMap(
  subscribers: Pick<RawSubscriberRow, "id" | "referredById">[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const sub of subscribers) {
    if (sub.referredById) {
      const existing = map.get(sub.referredById) ?? [];
      existing.push(sub.id);
      map.set(sub.referredById, existing);
    }
  }

  return map;
}

/* ── Referral preview (top 3 direct referrals) ───────────────────── */

export function buildReferralPreview(
  referrerId: string,
  allSubscribers: Pick<RawSubscriberRow, "id" | "name" | "referredById" | "createdAt">[],
): ReferralPreviewEntry[] {
  return allSubscribers
    .filter((s) => s.referredById === referrerId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, REFERRAL_CHAIN.PREVIEW_LIMIT)
    .map((s) => ({ id: s.id, name: s.name, joinedAt: s.createdAt }));
}

/* ── Share percent ───────────────────────────────────────────────── */

export function calcSharePercent(
  referralsCount: number,
  totalReferrals: number,
): number {
  if (totalReferrals === 0) return 0;
  return Math.round((referralsCount / totalReferrals) * 1000) / 10;
}

/* ── Tier filtering ──────────────────────────────────────────────── */

/**
 * Apply the optional tier filter to an already-ranked slice.
 * "all" is a no-op. All other tiers filter by rank boundaries.
 */
export function filterByTier(
  entries: LeaderboardEntry[],
  tier: LeaderboardTier | undefined,
): LeaderboardEntry[] {
  if (!tier || tier === "all") return entries;

  const bounds: Record<string, { min: number; max: number | null }> = {
    champion: { min: 1,  max: 1    },
    top10:    { min: 1,  max: 10   },
    top25:    { min: 1,  max: 25   },
    rising:   { min: 26, max: null },
  };

  const b = bounds[tier];
  if (!b) return entries;

  return entries.filter(
    (e) => e.rank >= b.min && (b.max === null || e.rank <= b.max),
  );
}

/* ── Pagination ──────────────────────────────────────────────────── */

export function normaliseLeaderboardPagination(query: GetLeaderboardQuery): {
  page:  number;
  limit: number;
  skip:  number;
} {
  const page  = Math.max(1, query.page  ?? LEADERBOARD_PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    LEADERBOARD_PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit ?? LEADERBOARD_PAGINATION.DEFAULT_LIMIT),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function buildLeaderboardMeta(
  total: number,
  page:  number,
  limit: number,
): LeaderboardPaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage:     page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/* ── Summary stats ───────────────────────────────────────────────── */

export function buildSummary(
  allSubscribers: RawSubscriberRow[],
): LeaderboardSummary {
  const totalSubscribers = allSubscribers.length;

  const referrers = allSubscribers.filter((s) => s.referralsCount > 0);
  const totalReferrals = referrers.reduce((sum, s) => sum + s.referralsCount, 0);

  const activeReferrers = referrers.length;

  const avgReferralsPerReferrer =
    activeReferrers === 0
      ? 0
      : Math.round((totalReferrals / activeReferrers) * 10) / 10;

  const topReferralCount =
    referrers.length > 0
      ? Math.max(...referrers.map((s) => s.referralsCount))
      : 0;

  const sorted = [...allSubscribers].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const newestSubscriberAt = sorted[0]?.createdAt ?? null;

  return {
    totalSubscribers,
    totalReferrals,
    activeReferrers,
    avgReferralsPerReferrer,
    topReferralCount,
    newestSubscriberAt,
  };
}
