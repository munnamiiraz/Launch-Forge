/* ─────────────────────────────────────────────────────────────────
   All revenue-specific types for /admin/revenue
   ──────────────────────────────────────────────────────────────── */

import { httpClient } from "@/src/lib/axios/httpClient";

export interface RevenueKpis {
  mrr:              number;
  arr:              number;
  mrrGrowthPct:     number;   // MoM %
  newMrrThisMonth:  number;
  churnedMrr:       number;
  expansionMrr:     number;   // upgrades
  netNewMrr:        number;   // new + expansion - churn
  ltv:              number;   // avg lifetime value
  arpu:             number;   // avg revenue per user (paid)
  payingUsers:      number;
  churnRatePct:     number;
  avgSubLengthMonths: number;
}

export interface MrrWaterfallPoint {
  month:     string;
  mrr:       number;
  newMrr:    number;
  expansion: number;
  churn:     number;
  net:       number;
}

export interface PlanRevenue {
  plan:         string;
  mode:         string;
  users:        number;
  mrr:          number;
  arr:          number;
  avgPrice:     number;
  churnPct:     number;
  fill:         string;
}

export interface RecentTransaction {
  id:          string;
  userId:      string;
  userName:    string;
  userEmail:   string;
  type:        "new" | "renewal" | "upgrade" | "downgrade" | "cancel" | "refund";
  plan:        string;
  amount:      number;
  currency:    string;
  status:      "paid" | "failed" | "refunded" | "pending";
  date:        string;
  stripeId:    string;
}

export interface CohortLtvRow {
  cohort:         string;   // "Jan 2025"
  startingUsers:  number;
  month1Mrr:      number;
  month3Mrr:      number;
  month6Mrr:      number;
  month12Mrr:     number;
  avgLtv:         number;
}

export interface ChurnDataPoint {
  month:        string;
  churned:      number;
  churnRate:    number;
  recovered:    number;
}

export interface RevenueByCountry {
  country:    string;
  flag:       string;
  users:      number;
  mrr:        number;
  pct:        number;
}

/* ── Fallback data for when API fails ───────────────────────────── */

const fallbackKpis: RevenueKpis = {
  mrr:                0,
  arr:                0,
  mrrGrowthPct:       0,
  newMrrThisMonth:    0,
  churnedMrr:         0,
  expansionMrr:       0,
  netNewMrr:          0,
  ltv:                0,
  arpu:               0,
  payingUsers:        0,
  churnRatePct:       0,
  avgSubLengthMonths: 0,
};

const fallbackMrrWaterfall: MrrWaterfallPoint[] = [];
const fallbackPlanRevenue: PlanRevenue[] = [];
const fallbackChurnData: ChurnDataPoint[] = [];
const fallbackCohortLtv: CohortLtvRow[] = [];
const fallbackRevenueByCountry: RevenueByCountry[] = [];
const fallbackTransactions: RecentTransaction[] = [];

/* ── API fetchers with fallback ────────────────────────────────── */

export async function getRevenueKpis(): Promise<RevenueKpis> {
  try {
    const response = await httpClient.get<RevenueKpis>("/admin/revenue/kpis");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch revenue KPIs:", error);
    return fallbackKpis;
  }
}

export async function getMrrWaterfall(): Promise<MrrWaterfallPoint[]> {
  try {
    const response = await httpClient.get<MrrWaterfallPoint[]>("/admin/revenue/waterfall");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch MRR waterfall:", error);
    return fallbackMrrWaterfall;
  }
}

export async function getPlanRevenue(): Promise<PlanRevenue[]> {
  try {
    const response = await httpClient.get<PlanRevenue[]>("/admin/revenue/plans");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch plan revenue:", error);
    return fallbackPlanRevenue;
  }
}

export async function getChurnData(): Promise<ChurnDataPoint[]> {
  try {
    const response = await httpClient.get<ChurnDataPoint[]>("/admin/revenue/churn");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch churn data:", error);
    return fallbackChurnData;
  }
}

export async function getCohortLtv(): Promise<CohortLtvRow[]> {
  try {
    const response = await httpClient.get<CohortLtvRow[]>("/admin/revenue/cohorts");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch cohort LTV:", error);
    return fallbackCohortLtv;
  }
}

export async function getRevenueByCountry(): Promise<RevenueByCountry[]> {
  try {
    const response = await httpClient.get<RevenueByCountry[]>("/admin/revenue/countries");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch revenue by country:", error);
    return fallbackRevenueByCountry;
  }
}

export async function getRecentTransactions(): Promise<RecentTransaction[]> {
  try {
    const response = await httpClient.get<RecentTransaction[]>(
      "/admin/revenue/transactions",
      { params: { type: "all", page: "1", limit: "20" } }
    );
    return response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch recent transactions:", error);
    return fallbackTransactions;
  }
}