import { useQuery } from "@tanstack/react-query";
import type { WaitlistStats, RecentSignup } from "../../components/module/home/hero-section/_types";

/* ── Query keys ──────────────────────────────────────────────────── */
export const waitlistKeys = {
  stats: ["waitlist", "stats"] as const,
  recent: ["waitlist", "recent"] as const,
};

/* ── Fetchers ────────────────────────────────────────────────────── */
async function fetchStats(): Promise<WaitlistStats> {
  const res = await fetch("/api/waitlist/stats", {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch waitlist stats");
  return res.json();
}

async function fetchRecent(): Promise<RecentSignup[]> {
  const res = await fetch("/api/waitlist/recent", {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error("Failed to fetch recent signups");
  return res.json();
}

/* ── Hooks ───────────────────────────────────────────────────────── */
export function useWaitlistStats(initialData?: WaitlistStats) {
  return useQuery({
    queryKey: waitlistKeys.stats,
    queryFn: fetchStats,
    initialData,
    staleTime: 60_000,        // treat as fresh for 60 s
    refetchInterval: 90_000,  // background refetch every 90 s
    refetchOnWindowFocus: true,
  });
}

export function useRecentSignups(initialData?: RecentSignup[]) {
  return useQuery({
    queryKey: waitlistKeys.recent,
    queryFn: fetchRecent,
    initialData,
    staleTime: 30_000,
    refetchInterval: 45_000,
    refetchOnWindowFocus: true,
  });
}
