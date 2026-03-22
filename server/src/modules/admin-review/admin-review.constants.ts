/* ── Response messages ───────────────────────────────────────────── */

export const ADMIN_REVENUE_MESSAGES = {
  KPIS_FETCHED:         "Revenue KPIs fetched successfully.",
  WATERFALL_FETCHED:    "MRR waterfall fetched successfully.",
  PLANS_FETCHED:        "Plan revenue fetched successfully.",
  CHURN_FETCHED:        "Churn analysis fetched successfully.",
  COHORT_FETCHED:       "Cohort LTV fetched successfully.",
  COUNTRIES_FETCHED:    "Revenue by country fetched successfully.",
  TRANSACTIONS_FETCHED: "Transactions fetched successfully.",
  FORBIDDEN:            "Admin access required.",
} as const;

/* ── Plan MRR amounts (monthly equivalent, USD) ──────────────────── */

export const PLAN_MRR: Record<string, number> = {
  PRO_MONTHLY:    19,
  PRO_YEARLY:     13,   // $156/yr ÷ 12
  GROWTH_MONTHLY: 49,
  GROWTH_YEARLY:  33,   // $396/yr ÷ 12
} as const;

export const PLAN_ARR: Record<string, number> = {
  PRO_MONTHLY:    228,   // 19 × 12
  PRO_YEARLY:     156,
  GROWTH_MONTHLY: 588,   // 49 × 12
  GROWTH_YEARLY:  396,
} as const;

export const PLAN_LABELS: Record<string, { plan: string; mode: string; fill: string }> = {
  PRO_MONTHLY:    { plan: "Pro",    mode: "Monthly", fill: "hsl(var(--chart-1))" },
  PRO_YEARLY:     { plan: "Pro",    mode: "Yearly",  fill: "hsl(var(--chart-2))" },
  GROWTH_MONTHLY: { plan: "Growth", mode: "Monthly", fill: "hsl(var(--chart-3))" },
  GROWTH_YEARLY:  { plan: "Growth", mode: "Yearly",  fill: "hsl(var(--chart-4))" },
} as const;

/* ── Transaction type filter options ─────────────────────────────── */

export const TX_TYPES = [
  "all", "new", "renewal", "upgrade", "downgrade", "cancel", "refund",
] as const;

export type TxType = (typeof TX_TYPES)[number];

/* ── Pagination (transactions table) ─────────────────────────────── */

export const TX_PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
} as const;

/* ── Cohort months ───────────────────────────────────────────────── */

export const COHORT_MONTHS  = 6;   // rolling 6 monthly cohorts
export const REVENUE_MONTHS = 12;  // 12-month waterfall

/* ── LTV calculation ─────────────────────────────────────────────── */

/**
 * LTV = ARPU / churnRate  (simple LTV formula)
 * We use this as a platform-wide estimate where per-user LTV isn't stored.
 */
export const LTV_CHURN_DIVISOR = 0.027;  // ~2.7% monthly churn