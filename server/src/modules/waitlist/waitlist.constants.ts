/* ── Success messages ────────────────────────────────────────────── */

export const WAITLIST_MESSAGES = {
  CREATED:       "Waitlist created successfully.",
  FETCHED:       "Waitlists fetched successfully.",
  NOT_FOUND:     "Waitlist not found.",
  SLUG_TAKEN:    "A waitlist with this slug already exists in your workspace.",
  UNAUTHORIZED:  "You are not a member of this workspace.",
  FORBIDDEN:     "You do not have permission to perform this action.",
  PLAN_LIMIT:    "Your current plan does not allow more waitlists. Please upgrade.",
} as const;

/* ── Plan limits ─────────────────────────────────────────────────── */

export const WAITLIST_PLAN_LIMITS: Record<string, number> = {
  FREE:    1,
  STARTER: 1,
  PRO:     Infinity,
  GROWTH:  Infinity,
} as const;

/* ── Pagination defaults ─────────────────────────────────────────── */

export const WAITLIST_PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT:     100,
} as const;

/* ── Slug constraints ────────────────────────────────────────────── */

export const WAITLIST_SLUG = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 60,
  /** Only lowercase letters, digits, and hyphens */
  PATTERN:    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  PATTERN_MSG: "Slug may only contain lowercase letters, numbers, and hyphens (e.g. my-waitlist).",
} as const;

/* ── Field constraints ───────────────────────────────────────────── */

export const WAITLIST_FIELD = {
  NAME_MIN:        2,
  NAME_MAX:        120,
  DESCRIPTION_MAX: 1000,
} as const;

/* ── Messages specific to /:id operations ───────────────────────── */

export const WAITLIST_BY_ID_MESSAGES = {
  FETCHED:      "Waitlist fetched successfully.",
  DELETED:      "Waitlist deleted successfully.",
  NOT_FOUND:    "Waitlist not found or has already been deleted.",
  WRONG_WORKSPACE:
    "This waitlist does not belong to the specified workspace.",
  UNAUTHORIZED: "You are not a member of this workspace.",
  FORBIDDEN:    "You do not have permission to perform this action.",
  HAS_SUBSCRIBERS:
    "Cannot delete a waitlist that still has active subscribers. Remove all subscribers first or archive the waitlist instead.",
} as const;

/* ── Soft-delete audit ───────────────────────────────────────────── */

/**
 * Minimum role required to hard-delete a waitlist.
 * OWNER can delete; plain MEMBER cannot.
 */
export const DELETE_ALLOWED_ROLES = ["OWNER"] as const;

export type DeleteAllowedRole = (typeof DELETE_ALLOWED_ROLES)[number];