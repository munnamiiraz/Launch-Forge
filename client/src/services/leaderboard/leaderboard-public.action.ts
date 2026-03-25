"use server";

import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

/**
 * Types for leaderboard API response (authenticated)
 */
export interface LeaderboardEntry {
  rank: number;
  tier: "champion" | "top10" | "top25" | "rising";
  id: string;
  name: string;
  email: string;
  directReferrals: number;
  chainReferrals: number;
  sharePercent: number;
  queuePosition: number;
}

export interface LeaderboardMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface LeaderboardSummary {
  totalSubscribers: number;
  totalReferrals: number;
  activeReferrers: number;
  avgReferralsPerReferrer: number;
  topReferralCount: number;
  newestSubscriberAt: string;
}

export interface LeaderboardResponse {
  success: boolean;
  message: string;
  data: LeaderboardEntry[];
  meta: LeaderboardMeta;
  summary: LeaderboardSummary;
}

/**
 * Helper for authenticated fetch
 */
async function authFetch(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: cookieHeader,
      "Content-Type": "application/json",
    },
    next: { revalidate: 60 },
  });
}

/**
 * Fetch waitlist info by slug to get the waitlist ID
 */
export async function fetchWaitlistBySlug(slug: string) {
  const url = `${BACKEND}/public/waitlist/${slug}`;
  console.log(`[Action] Fetching waitlist info: ${url}`);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch waitlist: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch leaderboard by waitlist slug using authenticated endpoint
 * Endpoint: GET /workspaces/:workspaceId/waitlists/:waitlistId/leaderboard/:waitlistSlug
 * 
 * Note: The server endpoint /leaderboard/by-slug/:waitlistSlug handles the waitlist lookup internally
 * so we don't need to fetch workspaceId separately
 */
export async function fetchLeaderboardBySlug(
  waitlistSlug: string,
  params: {
    page?: number;
    limit?: number;
    tier?: string;
    search?: string;
  } = {}
): Promise<LeaderboardResponse> {
  const queryParams = new URLSearchParams({
    page: (params.page || 1).toString(),
    limit: (params.limit || 20).toString(),
  });
  
  if (params.tier) queryParams.set("tier", params.tier);
  if (params.search) queryParams.set("search", params.search);

  // Use the by-slug endpoint which handles waitlist lookup internally
  const url = `${BACKEND}/leaderboard/by-slug/${waitlistSlug}?${queryParams}`;
  console.log(`[Leaderboard Action] Fetching leaderboard from: ${url}`);

  const res = await authFetch(url);
  console.log(`[Leaderboard Action] Response status:`, res.status);
  
  const json = await res.json();
  console.log(`[Leaderboard Action] Response data:`, json);

  if (!res.ok) {
    console.error("[Leaderboard Action] API error:", json);
    throw new Error(json.message || "Failed to fetch leaderboard");
  }

  return json;
}

/**
 * Fetch public leaderboard by waitlist slug (with masked emails)
 * Endpoint: GET /leaderboard/public/:waitlistSlug
 * NOTE: This is a PUBLIC endpoint — do NOT use authFetch (cookies)
 */
export async function fetchPublicLeaderboard(
  waitlistSlug: string,
  params: {
    page?: number;
    limit?: number;
    tier?: string;
    search?: string;
  } = {}
): Promise<LeaderboardResponse> {
  const queryParams = new URLSearchParams({
    page: (params.page || 1).toString(),
    limit: (params.limit || 20).toString(),
  });
  
  if (params.tier) queryParams.set("tier", params.tier);
  if (params.search) queryParams.set("search", params.search);

  const url = `${BACKEND}/leaderboard/public/${waitlistSlug}?${queryParams}`;
  console.log(`[Action] Fetching public leaderboard: ${url}`);

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 },
  });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to fetch leaderboard");
  }

  return json;
}
