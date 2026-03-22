/* ─────────────────────────────────────────────────────────────────
   Response messages
   ──────────────────────────────────────────────────────────────── */

export const FEEDBACK_MESSAGES = {
  SUBMITTED:         "Feature request submitted successfully.",
  FETCHED:           "Feedback fetched successfully.",
  VOTED:             "Vote recorded successfully.",
  ALREADY_VOTED:     "You have already voted for this request.",
  BOARD_NOT_FOUND:   "Feedback board not found or is not publicly accessible.",
  REQUEST_NOT_FOUND: "Feature request not found.",
  REQUEST_DELETED:   "This feature request is no longer available.",
  BOARD_PRIVATE:     "This feedback board is private.",
  DUPLICATE_TITLE:   "A feature request with this title already exists on this board.",
} as const;

/* ─────────────────────────────────────────────────────────────────
   Field constraints
   ──────────────────────────────────────────────────────────────── */

export const FEEDBACK_FIELD = {
  TITLE_MIN:        5,
  TITLE_MAX:        150,
  DESCRIPTION_MAX:  2000,
  AUTHOR_NAME_MAX:  80,
  EMAIL_MAX:        254,    // RFC 5321
} as const;

/* ─────────────────────────────────────────────────────────────────
   Pagination defaults
   ──────────────────────────────────────────────────────────────── */

export const FEEDBACK_PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
} as const;

/* ─────────────────────────────────────────────────────────────────
   Allowed sort fields (mirrors Prisma FeatureRequest keys)
   ──────────────────────────────────────────────────────────────── */

export const FEEDBACK_SORT_FIELDS = [
  "createdAt",
  "votesCount",
] as const;

export const SORT_ORDERS = ["asc", "desc"] as const;

/* ─────────────────────────────────────────────────────────────────
   Default sort — newest first
   ──────────────────────────────────────────────────────────────── */

export const FEEDBACK_DEFAULT_SORT = {
  FIELD: "createdAt",
  ORDER: "desc",
} as const;

/* ─────────────────────────────────────────────────────────────────
   Allowed FeatureRequestStatus values
   Mirrored from the Prisma enum so validation has a single source.
   ──────────────────────────────────────────────────────────────── */

export const FEATURE_REQUEST_STATUSES = [
  "UNDER_REVIEW",
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "DECLINED",
] as const;