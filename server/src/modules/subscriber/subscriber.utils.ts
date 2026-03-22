import {
  SubscriberPaginationMeta,
  GetSubscribersQuery,
  SubscriberRow,
  LeaderboardEntry,
} from "./subscriber.interface";
import {
  SUBSCRIBER_PAGINATION,
  LEADERBOARD_CONFIG,
} from "./subscriber.constants";

/* ── Pagination ──────────────────────────────────────────────────── */

export function normaliseSubscriberPagination(query: GetSubscribersQuery): {
  page:  number;
  limit: number;
  skip:  number;
} {
  const page  = Math.max(1, query.page  ?? SUBSCRIBER_PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    SUBSCRIBER_PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit ?? SUBSCRIBER_PAGINATION.DEFAULT_LIMIT),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function normaliseLeaderboardLimit(limit?: number): number {
  return Math.min(
    LEADERBOARD_CONFIG.MAX_LIMIT,
    Math.max(1, limit ?? LEADERBOARD_CONFIG.DEFAULT_LIMIT),
  );
}

export function buildSubscriberMeta(
  total:       number,
  confirmed:   number,
  page:        number,
  limit:       number,
): SubscriberPaginationMeta {
  const totalPages     = Math.ceil(total / limit);
  return {
    total,
    confirmed,
    unconfirmed:      total - confirmed,
    page,
    limit,
    totalPages,
    hasNextPage:      page < totalPages,
    hasPreviousPage:  page > 1,
  };
}

/* ── Position assignment ─────────────────────────────────────────── */

/**
 * Attach a 1-based queue position to each subscriber in a page slice.
 *
 * The canonical queue order is (referralsCount DESC, createdAt ASC).
 * We pass the global page offset so position numbers are globally correct
 * across pages — subscriber #21 on page 2 correctly shows position 21,
 * not position 1.
 *
 * IMPORTANT: The caller must have already fetched the slice in the same
 * ORDER BY as the queue definition. We do NOT re-sort here.
 */
export function attachPositions<T extends { id: string }>(
  pageSlice: T[],
  skip: number,
): (T & { position: number })[] {
  return pageSlice.map((row, i) => ({
    ...row,
    position: skip + i + 1,
  }));
}

/* ── Leaderboard helpers ─────────────────────────────────────────── */

/**
 * Calculate each entry's share of total referrals on the waitlist.
 * Returns a value rounded to one decimal place (e.g. 34.2).
 * Returns 0 when totalReferrals is 0 to avoid division by zero.
 */
export function calcSharePercent(
  referralsCount: number,
  totalReferrals: number,
): number {
  if (totalReferrals === 0) return 0;
  return Math.round((referralsCount / totalReferrals) * 1000) / 10;
}

/**
 * Attach rank (1-based), sharePercent, and re-map field names for the
 * authenticated leaderboard response.
 */
export function buildLeaderboardEntries(
  rows: Array<{
    id:             string;
    name:           string;
    email:          string;
    referralCode:   string;
    referralsCount: number;
    createdAt:      Date;
  }>,
  totalReferrals: number,
): LeaderboardEntry[] {
  return rows.map((row, i) => ({
    rank:           i + 1,
    id:             row.id,
    name:           row.name,
    email:          row.email,
    referralCode:   row.referralCode,
    referralsCount: row.referralsCount,
    sharePercent:   calcSharePercent(row.referralsCount, totalReferrals),
    joinedAt:       row.createdAt,
  }));
}