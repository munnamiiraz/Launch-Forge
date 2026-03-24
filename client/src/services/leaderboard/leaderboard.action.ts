"use server";

import { cookies } from "next/headers";
import type {
  LeaderboardResponse,
  WaitlistInfo,
  LeaderboardQueryParams,
} from "@/src/components/module/leaderboard/waitlistId/_types";
import type {
  WaitlistLeaderboardCard,
  LeaderboardPageStats,
  LeaderboardTier,
  TopReferrer,
} from "@/src/components/module/leaderboard/_types";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

type DashboardOverview = {
  stats: {
    totalSubscribers: number;
    totalWaitlists: number;
    totalReferrals: number;
    conversionRate: number;
  };
  waitlists: Array<{
    id: string;
    name: string;
    slug: string;
    isOpen: boolean;
    subscribers: number;
    totalReferrals: number;
    activeReferrers: number;
    avgReferrals: number;
    topReferrers: Array<{
      rank: number;
      name: string;
      email: string;
      directReferrals: number;
      isConfirmed: boolean;
      joinedAt: string;
    }>;
    createdAt: string;
  }>;
};

function rankToTier(rank: number): LeaderboardTier {
  if (rank === 1) return "champion";
  if (rank <= 10) return "top10";
  if (rank <= 25) return "top25";
  return "rising";
}

/**
 * 1. Helper to fetch with auth cookies
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
    cache: "no-store",
  });
}

/**
 * 2. Fetch standard waitlist info (needed for header)
 */
export async function fetchWaitlistInfo(waitlistId: string): Promise<WaitlistInfo> {
  const url = `${BACKEND}/waitlists/by-id/${waitlistId}`;
  console.log(`[Action] Resolving waitlist: ${url}`);

  const res = await authFetch(url);
  const json = await res.json();
  console.log("[Action] Waitlist info response", json);
  
  if (!res.ok) throw new Error(json.message || "Failed to fetch waitlist info");
  
  return {
    id:          json.data.id,
    workspaceId: json.data.workspaceId, // Required for subsequent leaderboard calls
    name:        json.data.name,
    slug:        json.data.slug,
    isOpen:      json.data.isOpen,
    description: json.data.description,
  };
}

/**
 * 3. Fetch full leaderboard entries for a specific waitlist
 */
export async function fetchLeaderboard(
  waitlistId: string,
  params:     LeaderboardQueryParams,
): Promise<LeaderboardResponse> {
  // Resolve the waitlist's workspaceId (required by the leaderboard route)
  const waitlistInfo = await fetchWaitlistInfo(waitlistId);
  const workspaceId = waitlistInfo.workspaceId;

  const queryParams = new URLSearchParams({
    page:      params.page.toString(),
    limit:     params.limit.toString(),
    tier:      params.tier,
    countMode: params.countMode,
  });
  if (params.search) queryParams.set("search", params.search);

  const url = `${BACKEND}/workspaces/${workspaceId}/waitlists/${waitlistId}/leaderboard/full?${queryParams}`;
  console.log(`[Action] Fetching leaderboard: ${url}`);

  const res = await authFetch(url);
  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Failed to fetch leaderboard");

  return {
    data: json.data,
    meta: json.meta,
    summary: json.summary,
  };
}

/**
 * 4. Fetch overview stats for the entire leaderboard dashboard (all waitlists)
 */
export async function fetchLeaderboardDashboardStats(workspaceId?: string): Promise<LeaderboardPageStats> {
  const url = workspaceId 
    ? `${BACKEND}/workspaces/dashboard/overview?workspaceId=${workspaceId}` 
    : `${BACKEND}/workspaces/dashboard/overview`;
  const res = await authFetch(url);
  const json = (await res.json()) as { data?: DashboardOverview; message?: string };
  
  if (!res.ok) throw new Error(json.message || "Failed to fetch stats");
  if (!json.data) throw new Error("Malformed stats response");
  
  return {
    totalWaitlists: json.data.stats.totalWaitlists,
    totalReferrals: json.data.stats.totalReferrals,
    totalReferrers: json.data.stats.totalSubscribers,
    topViralScore:  0,
  };
}

/**
 * 5. Fetch a list of leaderboard summary cards for all waitlists
 */
export async function fetchLeaderboardCards(workspaceId?: string): Promise<WaitlistLeaderboardCard[]> {
  const url = workspaceId 
    ? `${BACKEND}/workspaces/dashboard/overview?workspaceId=${workspaceId}` 
    : `${BACKEND}/workspaces/dashboard/overview`;
  const res = await authFetch(url);
  const json = (await res.json()) as { data?: DashboardOverview; message?: string };
  
  if (!res.ok) throw new Error(json.message || "Failed to fetch cards");
  if (!json.data) throw new Error("Malformed cards response");

  return json.data.waitlists.map((w) => ({
    waitlistId:       w.id,
    waitlistName:     w.name,
    waitlistSlug:     w.slug,
    isOpen:           w.isOpen,
    totalSubscribers: w.subscribers,
    totalReferrals:   w.totalReferrals,
    activeReferrers:  w.activeReferrers,
    avgReferrals:     w.avgReferrals,
    topReferralCount: w.topReferrers[0]?.directReferrals || 0,
    topReferrers:     w.topReferrers.map((r): TopReferrer => ({
      rank: r.rank,
      tier: rankToTier(r.rank),
      name: r.name,
      email: r.email,
      directReferrals: r.directReferrals,
      chainReferrals: 0,
      sharePercent: 0,
      isConfirmed: r.isConfirmed,
      joinedAt: r.joinedAt,
    })),
  }));
}

/**
 * 6. Fetch leaderboard using waitlistId and waitlistSlug
 * Endpoint: GET /workspaces/:workspaceId/waitlists/:waitlistId/leaderboard/:waitlistSlug
 */
export async function fetchLeaderboardBySlug(
  waitlistId: string,
  waitlistSlug: string,
  params: LeaderboardQueryParams,
): Promise<LeaderboardResponse> {
  // Resolve the waitlist's workspaceId (required by the leaderboard route)
  const waitlistInfo = await fetchWaitlistInfo(waitlistId);
  const workspaceId = waitlistInfo.workspaceId;

  const queryParams = new URLSearchParams({
    page:      params.page.toString(),
    limit:     params.limit.toString(),
    tier:      params.tier,
    countMode: params.countMode,
  });
  if (params.search) queryParams.set("search", params.search);

  const url = `${BACKEND}/workspaces/${workspaceId}/waitlists/${waitlistId}/leaderboard/${waitlistSlug}?${queryParams}`;
  console.log(`[Action] Fetching leaderboard by slug: ${url}`);

  const res = await authFetch(url);
  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Failed to fetch leaderboard");

  return {
    data: json.data,
    meta: json.meta,
    summary: json.summary,
  };
}
