import { TxType } from "./admin-review.constants";

/* ─────────────────────────────────────────────────────────────────
   Shared payload
   ──────────────────────────────────────────────────────────────── */

export interface AdminRevenueBasePayload {
  requestingUserId: string;
}

/* ─────────────────────────────────────────────────────────────────
   1. Revenue KPIs (9-card strip at top)
   ──────────────────────────────────────────────────────────────── */

export interface RevenueKpis {
  mrr:                number;   // current total MRR
  arr:                number;   // mrr × 12
  mrrGrowthPct:       number;   // MoM % change
  newMrrThisMonth:    number;   // MRR from new subscribers this month
  churnedMrr:         number;   // MRR lost this month
  expansionMrr:       number;   // MRR gained from upgrades this month
  netNewMrr:          number;   // new + expansion − churn
  ltv:                number;   // avg customer lifetime value
  arpu:               number;   // avg revenue per paid user (mrr / payingUsers)
  payingUsers:        number;   // total active paid subscriptions
  churnRatePct:       number;   // % of paying users who churned this month
  avgSubLengthMonths: number;   // 1 / churnRatePct (months)
}

/* ─────────────────────────────────────────────────────────────────
   2. MRR Waterfall (12-month area chart)
   ──────────────────────────────────────────────────────────────── */

export interface MrrWaterfallPoint {
  month:     string;   // "Jan '25"
  mrr:       number;   // cumulative MRR at end of month
  newMrr:    number;   // MRR added from new subscriptions
  expansion: number;   // MRR from upgrades
  churn:     number;   // MRR lost
  net:       number;   // newMrr + expansion − churn
}

/* ─────────────────────────────────────────────────────────────────
   3. Plan revenue breakdown (donut + table)
   ──────────────────────────────────────────────────────────────── */

export interface PlanRevenue {
  plan:      string;   // "Pro" | "Growth"
  mode:      string;   // "Monthly" | "Yearly"
  users:     number;
  mrr:       number;
  arr:       number;
  avgPrice:  number;   // per-user monthly price
  churnPct:  number;   // churn rate for this plan segment
  fill:      string;   // chart colour
}

/* ─────────────────────────────────────────────────────────────────
   4. Churn analysis (12-month bar chart)
   ──────────────────────────────────────────────────────────────── */

export interface ChurnDataPoint {
  month:     string;
  churned:   number;   // users who cancelled
  churnRate: number;   // % of active users
  recovered: number;   // previously churned users who resubscribed
}

/* ─────────────────────────────────────────────────────────────────
   5. Cohort LTV heatmap
   ──────────────────────────────────────────────────────────────── */

export interface CohortLtvRow {
  cohort:        string;   // "Jan '25"
  startingUsers: number;   // new paid users in that month
  month1Mrr:     number;   // MRR retained at M1 (retention pct baked in)
  month3Mrr:     number;   // 0 if cohort < 3 months old
  month6Mrr:     number;
  month12Mrr:    number;
  avgLtv:        number;   // estimated avg LTV for cohort
}

/* ─────────────────────────────────────────────────────────────────
   6. Revenue by country
   ──────────────────────────────────────────────────────────────── */

export interface RevenueByCountry {
  country: string;
  flag:    string;
  users:   number;
  mrr:     number;
  pct:     number;   // % of total MRR
}

/* ─────────────────────────────────────────────────────────────────
   7. Transactions table (paginated + filterable)
   ──────────────────────────────────────────────────────────────── */

export interface TransactionsQuery {
  page?:   number;
  limit?:  number;
  search?: string;
  type?:   TxType;
}

export interface GetTransactionsPayload extends AdminRevenueBasePayload {
  query: TransactionsQuery;
}

export interface RecentTransaction {
  id:          string;
  userId:      string;
  userName:    string;
  userEmail:   string;
  type:        "new" | "renewal" | "upgrade" | "downgrade" | "cancel" | "refund";
  plan:        string;   // "Pro Monthly" | "Growth Yearly" etc.
  amount:      number;
  currency:    string;
  status:      "paid" | "failed" | "refunded" | "pending";
  date:        string;   // ISO
  stripeId:    string | null;
}

export interface PaginatedTransactions {
  data:         RecentTransaction[];
  meta:         TransactionsPaginationMeta;
  totalRevenue: number;   // sum of paid amounts in current filter
}

export interface TransactionsPaginationMeta {
  total:           number;
  page:            number;
  limit:           number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}