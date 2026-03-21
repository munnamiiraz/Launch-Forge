/* ── Response messages ───────────────────────────────────────────── */

export const EXPLORE_MESSAGES = {
  LIST_FETCHED:   "Waitlists fetched successfully.",
  NOT_FOUND:      "Waitlist not found.",
} as const;

/* ── Pagination ──────────────────────────────────────────────────── */

export const EXPLORE_PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 12,   // 3-column grid → 4 rows per page
  MAX_LIMIT:     48,
} as const;

/* ── Sort options ────────────────────────────────────────────────── */

export const EXPLORE_SORT_OPTIONS = [
  "trending",      // most recentJoins in last 24h
  "newest",        // createdAt DESC
  "most-joined",   // totalSubscribers DESC
  "closing-soon",  // expiresAt ASC (nulls last)
] as const;

export type ExploreSortOption = (typeof EXPLORE_SORT_OPTIONS)[number];

/* ── Trending window ─────────────────────────────────────────────── */

export const TRENDING = {
  /** How many hours back we look to count "recent" joins */
  WINDOW_HOURS: 24,
} as const;

/* ── Top referrers per card ──────────────────────────────────────── */

export const EXPLORE_CARD = {
  TOP_REFERRERS: 3,   // top referrers shown on each card
  TOP_PRIZES:    4,   // max prizes shown per card
} as const;