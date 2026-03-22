/* ── Response messages ───────────────────────────────────────────── */

export const SUBSCRIBER_MESSAGES = {
  FETCHED:      "Subscribers fetched successfully.",
  LEADERBOARD:  "Leaderboard fetched successfully.",
  UNAUTHORIZED: "You are not a member of this workspace.",
  NOT_FOUND:    "Waitlist not found or does not belong to this workspace.",
} as const;

/* ── Pagination ──────────────────────────────────────────────────── */

export const SUBSCRIBER_PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
} as const;

/* ── Leaderboard ─────────────────────────────────────────────────── */

export const LEADERBOARD_CONFIG = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT:     50,
} as const;

/* ── Sort field allowlist — matches Prisma orderBy keys ─────────── */

export const SUBSCRIBER_SORT_FIELDS = [
  "createdAt",
  "referralsCount",
  "name",
] as const;

export const SORT_ORDERS = ["asc", "desc"] as const;

/* ── Default sort ────────────────────────────────────────────────── */

export const SUBSCRIBER_DEFAULT_SORT = {
  FIELD: "createdAt",
  ORDER: "desc",
} as const;