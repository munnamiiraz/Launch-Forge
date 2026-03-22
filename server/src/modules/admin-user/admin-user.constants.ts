/* ── Response messages ───────────────────────────────────────────── */

export const ADMIN_USERS_MESSAGES = {
  /* Reads */
  LIST_FETCHED:   "Users fetched successfully.",
  STATS_FETCHED:  "User stats fetched successfully.",
  USER_FETCHED:   "User fetched successfully.",

  /* Mutations */
  SUSPENDED:      "User suspended successfully.",
  REACTIVATED:    "User reactivated successfully.",
  DELETED:        "User deleted successfully.",
  PROMOTED:       "User promoted to admin successfully.",
  DEMOTED:        "Admin role removed successfully.",
  INVITED:        "Invitation sent successfully.",
  BULK_SUSPENDED: "Users suspended successfully.",
  BULK_DELETED:   "Users deleted successfully.",

  /* Errors */
  FORBIDDEN:      "Admin access required.",
  NOT_FOUND:      "User not found.",
  ALREADY_DELETED:"User is already deleted.",
  CANNOT_SELF:    "You cannot perform this action on your own account.",
  INVALID_EMAIL:  "Invalid email address.",
  ALREADY_EXISTS: "A user with this email already exists.",
} as const;

/* ── Pagination ──────────────────────────────────────────────────── */

export const USERS_PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT:     100,
} as const;

/* ── Sort fields ─────────────────────────────────────────────────── */

export const USER_SORT_FIELDS = [
  "name",
  "createdAt",
  "lastActiveAt",
  "subscribers",
  "waitlists",
] as const;

export const SORT_ORDERS = ["asc", "desc"] as const;

/* ── Filter enums ────────────────────────────────────────────────── */

export const STATUS_FILTERS = ["ALL", "ACTIVE", "SUSPENDED", "DELETED"] as const;
export const PLAN_FILTERS   = ["ALL", "FREE", "PRO", "GROWTH"] as const;
export const ROLE_FILTERS   = ["ALL", "USER", "ADMIN"] as const;

export type SortField    = (typeof USER_SORT_FIELDS)[number];
export type SortOrder    = (typeof SORT_ORDERS)[number];
export type StatusFilter = (typeof STATUS_FILTERS)[number];
export type PlanFilter   = (typeof PLAN_FILTERS)[number];
export type RoleFilter   = (typeof ROLE_FILTERS)[number];

/* ── Bulk limits ─────────────────────────────────────────────────── */

export const BULK_MAX = 100;