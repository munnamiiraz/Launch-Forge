/* ── Response messages ───────────────────────────────────────────── */

export const ADMIN_ANALYTICS_MESSAGES = {
  ENGAGEMENT_FETCHED:   "Engagement stats fetched successfully.",
  TIMELINE_FETCHED:     "Engagement timeline fetched successfully.",
  FEATURES_FETCHED:     "Feature adoption fetched successfully.",
  SUBSCRIBERS_FETCHED:  "Platform subscriber growth fetched successfully.",
  WAITLISTS_FETCHED:    "Waitlist health fetched successfully.",
  REFERRALS_FETCHED:    "Referral network fetched successfully.",
  FEEDBACK_FETCHED:     "Feedback health fetched successfully.",
  ROADMAP_FETCHED:      "Roadmap progress fetched successfully.",
  CHANGELOG_FETCHED:    "Changelog timeline fetched successfully.",
  HEATMAP_FETCHED:      "Workspace heatmap fetched successfully.",
  FORBIDDEN:            "Admin access required.",
} as const;

/* ── Timeline ranges ─────────────────────────────────────────────── */

export const ENGAGEMENT_RANGES = ["30d", "60d"] as const;
export type  EngagementRange   = (typeof ENGAGEMENT_RANGES)[number];

export const ENGAGEMENT_RANGE_DAYS: Record<EngagementRange, number> = {
  "30d": 30,
  "60d": 60,
} as const;

/* ── Subscriber growth window ────────────────────────────────────── */

export const SUBSCRIBER_GROWTH_MONTHS = 12;

/* ── Referral network window ─────────────────────────────────────── */

export const REFERRAL_MONTHS = 12;

/* ── Feedback window ─────────────────────────────────────────────── */

export const FEEDBACK_WINDOW_DAYS = 30;

/* ── Changelog window ────────────────────────────────────────────── */

export const CHANGELOG_MONTHS = 12;

/* ── Waitlist size buckets ───────────────────────────────────────── */

export const WAITLIST_BUCKETS = [
  { label: "0–50",    min: 0,     max: 50    },
  { label: "51–200",  min: 51,    max: 200   },
  { label: "201–500", min: 201,   max: 500   },
  { label: "501–2k",  min: 501,   max: 2000  },
  { label: "2k–10k",  min: 2001,  max: 10000 },
  { label: "10k+",    min: 10001, max: null  },
] as const;

export const BUCKET_FILLS = [
  "hsl(var(--chart-5))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-1))",
  "hsl(260 80% 65%)",
] as const;

/* ── Feature definitions ─────────────────────────────────────────── */

/**
 * Each feature is detected by whether the workspace has at least one
 * non-deleted record in the corresponding relation.
 */
export const FEATURES = [
  {
    name: "Waitlists",
    fill: "hsl(var(--chart-1))",
    description: "Has at least one waitlist",
  },
  {
    name: "Referral tracking",
    fill: "hsl(var(--chart-2))",
    description: "Has at least one subscriber with a referredById",
  },
  {
    name: "Public leaderboard",
    fill: "hsl(var(--chart-3))",
    description: "Has a waitlist with referralsCount > 0",
  },
  {
    name: "Feedback board",
    fill: "hsl(var(--chart-4))",
    description: "Has at least one feedback board",
  },
  {
    name: "Roadmap",
    fill: "hsl(var(--chart-5))",
    description: "Has at least one roadmap",
  },
  {
    name: "Prizes",
    fill: "hsl(var(--chart-1))",
    description: "Has at least one active prize",
  },
  {
    name: "Changelog",
    fill: "hsl(var(--chart-2))",
    description: "Has at least one changelog entry",
  },
] as const;

/* ── Status colours ──────────────────────────────────────────────── */

export const FEEDBACK_STATUS_FILLS: Record<string, string> = {
  UNDER_REVIEW: "hsl(var(--chart-5))",
  PLANNED:      "hsl(var(--chart-1))",
  IN_PROGRESS:  "hsl(var(--chart-3))",
  COMPLETED:    "hsl(var(--chart-2))",
  DECLINED:     "hsl(var(--chart-4))",
} as const;

export const ROADMAP_STATUS_FILLS: Record<string, string> = {
  PLANNED:     "hsl(var(--chart-5))",
  IN_PROGRESS: "hsl(var(--chart-3))",
  COMPLETED:   "hsl(var(--chart-2))",
} as const;