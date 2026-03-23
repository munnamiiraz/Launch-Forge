import { httpClient } from "@/src/lib/axios/httpClient";
import type {
  AdminKpis, AdminUser, RevenuePoint, UserGrowthPoint,
  SignupSourcePoint, PlanBreakdownItem, AdminActivity,
  SystemHealth, TopWaitlist,
} from "../_types";

/* ── Fallback data ───────────────────────────────────────────────── */

const fallbackKpis: AdminKpis = {
  totalUsers: 0,
  newUsersToday: 0,
  newUsersThisWeek: 0,
  activeUsers30d: 0,
  totalWorkspaces: 0,
  totalWaitlists: 0,
  totalSubscribers: 0,
  totalReferrals: 0,
  totalFeedbackItems: 0,
  totalVotes: 0,
  mrr: 0,
  arr: 0,
  paidUsers: 0,
  freeUsers: 0,
  proUsers: 0,
  growthUsers: 0,
  churnedThisMonth: 0,
  avgWaitlistsPerUser: 0,
  avgSubscribersPerWaitlist: 0,
};

const fallbackRevenue: RevenuePoint[] = [];
const fallbackUserGrowth: UserGrowthPoint[] = [];
const fallbackPlanBreakdown: PlanBreakdownItem[] = [];
const fallbackSignupSources: SignupSourcePoint[] = [];
const fallbackActivity: AdminActivity[] = [];
const fallbackSystemHealth: SystemHealth = {
  api: "operational",
  database: "operational",
  stripe: "operational",
  email: "operational",
  uptime: 100,
  p99Latency: 0,
};
const fallbackTopWaitlists: TopWaitlist[] = [];
const fallbackRecentUsers: AdminUser[] = [];

/* ── KPIs ────────────────────────────────────────────────────────── */
export async function getAdminKpis(): Promise<AdminKpis> {
  try {
    const response = await httpClient.get<AdminKpis>("/admin/overview/kpis");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin KPIs:", error);
    return fallbackKpis;
  }
}

/* ── Revenue trend ───────────────────────────────────────────────── */
export async function getRevenueTrend(): Promise<RevenuePoint[]> {
  try {
    const response = await httpClient.get<RevenuePoint[]>("/admin/overview/revenue");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch revenue trend:", error);
    return fallbackRevenue;
  }
}

/* ── User growth ─────────────────────────────────────────────────── */
export async function getUserGrowth(days = 30): Promise<UserGrowthPoint[]> {
  try {
    const response = await httpClient.get<UserGrowthPoint[]>(`/admin/overview/growth?range=${days}d`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user growth:", error);
    return fallbackUserGrowth;
  }
}

/* ── Plan breakdown ──────────────────────────────────────────────── */
export async function getPlanBreakdown(): Promise<PlanBreakdownItem[]> {
  try {
    const response = await httpClient.get<PlanBreakdownItem[]>("/admin/overview/plans");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch plan breakdown:", error);
    return fallbackPlanBreakdown;
  }
}

/* ── Signup sources ──────────────────────────────────────────────── */
export async function getSignupSources(): Promise<SignupSourcePoint[]> {
  try {
    const response = await httpClient.get<SignupSourcePoint[]>("/admin/overview/sources");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch signup sources:", error);
    return fallbackSignupSources;
  }
}

/* ── Recent activity ──────────────────────────────────────────────── */
export async function getRecentActivity(): Promise<AdminActivity[]> {
  try {
    const response = await httpClient.get<AdminActivity[]>("/admin/overview/activity");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    return fallbackActivity;
  }
}

/* ── System health ───────────────────────────────────────────────── */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await httpClient.get<SystemHealth>("/admin/overview/health");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch system health:", error);
    return fallbackSystemHealth;
  }
}

/* ── Top waitlists ───────────────────────────────────────────────── */
export async function getTopWaitlists(): Promise<TopWaitlist[]> {
  try {
    const response = await httpClient.get<TopWaitlist[]>("/admin/overview/top-waitlists");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch top waitlists:", error);
    return fallbackTopWaitlists;
  }
}

/* ── Recent users ────────────────────────────────────────────────── */
export async function getRecentUsers(): Promise<AdminUser[]> {
  try {
    const response = await httpClient.get<AdminUser[]>("/admin/overview/recent-users");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch recent users:", error);
    return fallbackRecentUsers;
  }
}