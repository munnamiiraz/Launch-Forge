/* ── Response messages ───────────────────────────────────────────── */

export const ANALYTICS_MESSAGES = {
  SUMMARY_FETCHED:     "Analytics summary fetched successfully.",
  GROWTH_FETCHED:      "Subscriber growth fetched successfully.",
  FUNNEL_FETCHED:      "Referral funnel fetched successfully.",
  KFACTOR_FETCHED:     "Viral k-factor fetched successfully.",
  CONFIRMATION_FETCHED:"Confirmation rate fetched successfully.",
  REFERRERS_FETCHED:   "Top referrers fetched successfully.",
  COHORT_FETCHED:      "Cohort retention fetched successfully.",
  WAITLISTS_FETCHED:   "Waitlist comparison fetched successfully.",
  REVENUE_FETCHED:     "Revenue analytics fetched successfully.",
  FEEDBACK_FETCHED:    "Feedback activity fetched successfully.",
  UNAUTHORIZED:        "You are not a member of this workspace.",
} as const;

/* ── Time ranges ─────────────────────────────────────────────────── */

export const TIME_RANGES = ["7d", "30d", "90d", "12m"] as const;
export type  TimeRange   = (typeof TIME_RANGES)[number];

/** How many days back each range covers */
export const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  "7d":  7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
} as const;

/* ── Cohort ──────────────────────────────────────────────────────── */

export const COHORT = {
  /** Number of bi-weekly cohorts to return */
  COHORT_COUNT: 6,
  /** Number of subsequent weeks to track retention */
  WEEK_COUNT: 7,
} as const;

/* ── Referral chain depth ────────────────────────────────────────── */

export const CHAIN_MAX_DEPTH = 4;

/* ── Top referrers ───────────────────────────────────────────────── */

export const TOP_REFERRERS_LIMIT = 10;

/* ── Feedback window ─────────────────────────────────────────────── */

export const FEEDBACK_WINDOW_DAYS = 30;
