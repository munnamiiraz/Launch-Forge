/* ── Response messages ───────────────────────────────────────────── */

export const ADMIN_OVERVIEW_MESSAGES = {
  KPIS_FETCHED:       "Platform KPIs fetched successfully.",
  REVENUE_FETCHED:    "Revenue trend fetched successfully.",
  GROWTH_FETCHED:     "User growth fetched successfully.",
  PLANS_FETCHED:      "Plan breakdown fetched successfully.",
  SOURCES_FETCHED:    "Signup sources fetched successfully.",
  ACTIVITY_FETCHED:   "Recent activity fetched successfully.",
  HEALTH_FETCHED:     "System health fetched successfully.",
  WAITLISTS_FETCHED:  "Top waitlists fetched successfully.",
  USERS_FETCHED:      "Recent users fetched successfully.",
  FORBIDDEN:          "Admin access required.",
} as const;

/* ── User growth time ranges ─────────────────────────────────────── */

export const GROWTH_RANGES = ["7d", "30d", "90d"] as const;
export type  GrowthRange   = (typeof GROWTH_RANGES)[number];

export const GROWTH_RANGE_DAYS: Record<GrowthRange, number> = {
  "7d":  7,
  "30d": 30,
  "90d": 90,
} as const;

/* ── Recent activity ─────────────────────────────────────────────── */

export const ACTIVITY_LIMIT = 20;

/* ── Top waitlists ───────────────────────────────────────────────── */

export const TOP_WAITLISTS_LIMIT = 10;

/* ── Recent users ────────────────────────────────────────────────── */

export const RECENT_USERS_LIMIT = 10;

/* ── Revenue months ──────────────────────────────────────────────── */

export const REVENUE_MONTHS = 12;

/* ── Plan amounts in USD (monthly equivalent) ────────────────────── */

export const PLAN_MRR: Record<string, number> = {
  PRO_MONTHLY:    19,
  PRO_YEARLY:     13,   // 156 / 12
  GROWTH_MONTHLY: 49,
  GROWTH_YEARLY:  33,   // 396 / 12
  FREE:            0,
} as const;

export const PLAN_META: Record<string, { label: string; fill: string }> = {
  FREE:           { label: "Free",           fill: "hsl(240 5% 55%)"      },
  PRO_MONTHLY:    { label: "Pro Monthly",    fill: "hsl(var(--chart-1))"  },
  PRO_YEARLY:     { label: "Pro Yearly",     fill: "hsl(var(--chart-2))"  },
  GROWTH_MONTHLY: { label: "Growth Monthly", fill: "hsl(var(--chart-3))"  },
  GROWTH_YEARLY:  { label: "Growth Yearly",  fill: "hsl(var(--chart-4))"  },
} as const;