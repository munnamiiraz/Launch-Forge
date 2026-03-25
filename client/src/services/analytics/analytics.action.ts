"use client";

import type {
  SubscriberGrowthPoint,
  ReferralFunnelItem,
  ViralKFactorPoint,
  WaitlistComparisonItem,
  ConfirmationRatePoint,
  TopReferrerBar,
  CohortRow,
  PlanDistributionItem,
  RevenueTrendPoint,
  FeedbackActivityPoint,
  SignupSourceItem,
  AnalyticsSummary,
  TimeRange,
} from "@/src/components/module/owners-analytics/_types";

const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

type ApiResponse<T> = { success: boolean; message?: string; data: T };

import { authFetch } from "@/src/lib/axios/authFetch";

async function apiGet<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }

  const res = await authFetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = (await res.json()) as Partial<ApiResponse<T>> & { message?: string };
  if (!res.ok) throw new Error(json.message || "Request failed");
  if (!json.data) throw new Error("Malformed API response");
  return json.data;
}

export async function fetchAnalyticsSummary(payload: {
  workspaceId: string;
  range?: TimeRange;
  waitlistId?: string;
}): Promise<AnalyticsSummary> {
  const data = await apiGet<{
    totalSubscribers: number;
    totalWaitlists: number;
    totalReferrals: number;
    avgViralScore: number;
    confirmationRate: number;
    totalRevenueMrr: number;
    activeReferrers: number;
    feedbackItems: number;
    delta?: { weekOverWeekGrowth?: number };
    bestKFactor: number;
  }>(`/workspaces/${payload.workspaceId}/analytics/summary`, {
    range: payload.range,
    waitlistId: payload.waitlistId,
  });

  return {
    totalSubscribers: data.totalSubscribers,
    totalWaitlists: data.totalWaitlists,
    totalReferrals: data.totalReferrals,
    avgViralScore: data.avgViralScore,
    confirmationRate: data.confirmationRate,
    totalRevenueMrr: data.totalRevenueMrr,
    activeReferrers: data.activeReferrers,
    feedbackItems: data.feedbackItems,
    weekOverWeekGrowth: Number(data.delta?.weekOverWeekGrowth ?? 0),
    bestKFactor: data.bestKFactor,
  };
}

export async function fetchSubscriberGrowth(payload: {
  workspaceId: string;
  range?: TimeRange;
  waitlistId?: string;
}): Promise<SubscriberGrowthPoint[]> {
  return apiGet<SubscriberGrowthPoint[]>(`/workspaces/${payload.workspaceId}/analytics/growth`, {
    range: payload.range,
    waitlistId: payload.waitlistId,
  });
}

export async function fetchReferralFunnel(payload: {
  workspaceId: string;
  range?: TimeRange;
  waitlistId?: string;
}): Promise<{ funnel: ReferralFunnelItem[]; sources: SignupSourceItem[] }> {
  const data = await apiGet<{
    funnel: Array<{ label: string; value: number; pct: number }>;
    sources: SignupSourceItem[];
  }>(`/workspaces/${payload.workspaceId}/analytics/funnel`, {
    range: payload.range,
    waitlistId: payload.waitlistId,
  });

  const COLOURS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return {
    funnel: data.funnel.map((f, i) => ({
      ...f,
      color: COLOURS[i] ?? "hsl(240 4% 35%)",
    })),
    sources: data.sources,
  };
}

export async function fetchViralKFactor(payload: {
  workspaceId: string;
  range?: TimeRange;
  waitlistId?: string;
}): Promise<ViralKFactorPoint[]> {
  return apiGet<ViralKFactorPoint[]>(`/workspaces/${payload.workspaceId}/analytics/kfactor`, {
    range: payload.range,
    waitlistId: payload.waitlistId,
  });
}

export async function fetchWaitlistComparison(payload: {
  workspaceId: string;
  range?: TimeRange;
}): Promise<WaitlistComparisonItem[]> {
  const rows = await apiGet<
    Array<{
      name: string;
      subscribers: number;
      referrals: number;
      confirmed: number;
      viralScore: number;
    }>
  >(`/workspaces/${payload.workspaceId}/analytics/waitlists`, { range: payload.range });

  return rows.map((r) => ({
    name: r.name,
    subscribers: r.subscribers,
    referrals: r.referrals,
    confirmed: r.confirmed,
    viralScore: r.viralScore,
  }));
}

export async function fetchConfirmationRate(payload: {
  workspaceId: string;
  range?: TimeRange;
  waitlistId?: string;
}): Promise<ConfirmationRatePoint[]> {
  return apiGet<ConfirmationRatePoint[]>(`/workspaces/${payload.workspaceId}/analytics/confirmation`, {
    range: payload.range,
    waitlistId: payload.waitlistId,
  });
}

export async function fetchTopReferrers(payload: {
  workspaceId: string;
  range?: TimeRange;
  waitlistId?: string;
}): Promise<TopReferrerBar[]> {
  return apiGet<TopReferrerBar[]>(`/workspaces/${payload.workspaceId}/analytics/referrers`, {
    range: payload.range,
    waitlistId: payload.waitlistId,
  });
}

export async function fetchCohortRetention(payload: {
  workspaceId: string;
  range?: TimeRange;
  waitlistId?: string;
}): Promise<CohortRow[]> {
  return apiGet<CohortRow[]>(`/workspaces/${payload.workspaceId}/analytics/cohorts`, {
    range: payload.range,
    waitlistId: payload.waitlistId,
  });
}

export async function fetchRevenue(payload: {
  workspaceId: string;
  range?: TimeRange;
}): Promise<{ trend: RevenueTrendPoint[]; distribution: PlanDistributionItem[]; currentMrr: number; paidPct: number }> {
  return apiGet<{ trend: RevenueTrendPoint[]; distribution: PlanDistributionItem[]; currentMrr: number; paidPct: number }>(
    `/workspaces/${payload.workspaceId}/analytics/revenue`,
    { range: payload.range },
  );
}

export async function fetchFeedbackActivity(payload: {
  workspaceId: string;
  range?: TimeRange;
  waitlistId?: string;
}): Promise<FeedbackActivityPoint[]> {
  return apiGet<FeedbackActivityPoint[]>(`/workspaces/${payload.workspaceId}/analytics/feedback`, {
    range: payload.range,
    waitlistId: payload.waitlistId,
  });
}
