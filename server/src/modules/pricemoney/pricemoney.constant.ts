/* ─────────────────────────────────────────────────────────────────
   Response messages
   ──────────────────────────────────────────────────────────────── */

export const PRIZE_MESSAGES = {
  CREATED:           "Prize created successfully.",
  UPDATED:           "Prize updated successfully.",
  DELETED:           "Prize deleted successfully.",
  FETCHED:           "Prizes fetched successfully.",
  PUBLIC_FETCHED:    "Prizes fetched successfully.",
  NOT_FOUND:         "Prize not found.",
  WAITLIST_NOT_FOUND:"Waitlist not found or does not belong to this workspace.",
  UNAUTHORIZED:      "You are not a member of this workspace.",
  FORBIDDEN:         "Only workspace owners can manage prizes.",
  RANK_OVERLAP:      "The rank range overlaps with an existing active prize on this waitlist.",
  RANK_INVALID:      "rankFrom must be less than or equal to rankTo.",
  ALREADY_AWARDED:   "This prize has already been awarded and cannot be modified.",
  RANK_MIN:          "Rank values must be at least 1.",
  MAX_PRIZES:        "A waitlist may have at most 10 active prizes at a time.",
} as const;

/* ─────────────────────────────────────────────────────────────────
   Field constraints
   ──────────────────────────────────────────────────────────────── */

export const PRIZE_FIELD = {
  TITLE_MIN:        3,
  TITLE_MAX:        120,
  DESCRIPTION_MAX:  1000,
  VALUE_MAX:        1_000_000,
  CURRENCY_LENGTH:  3,       // ISO 4217
  RANK_MIN:         1,
  RANK_MAX:         10_000,  // sanity cap
} as const;

/* ─────────────────────────────────────────────────────────────────
   Allowed prize types
   ──────────────────────────────────────────────────────────────── */

export const PRIZE_TYPES = [
  "CASH",
  "GIFT_CARD",
  "PRODUCT",
  "LIFETIME_ACCESS",
  "DISCOUNT",
  "CUSTOM",
] as const;

/* ─────────────────────────────────────────────────────────────────
   Allowed prize statuses
   ──────────────────────────────────────────────────────────────── */

export const PRIZE_STATUSES = [
  "ACTIVE",
  "AWARDED",
  "CANCELLED",
] as const;

/* ─────────────────────────────────────────────────────────────────
   Business rules
   ──────────────────────────────────────────────────────────────── */

/** Maximum number of ACTIVE prizes per waitlist */
export const MAX_ACTIVE_PRIZES_PER_WAITLIST = 10 as const;

/**
 * Statuses from which a prize can be edited.
 * AWARDED prizes are locked — they form part of the audit trail.
 */
export const EDITABLE_STATUSES: readonly string[] = ["ACTIVE"] as const;