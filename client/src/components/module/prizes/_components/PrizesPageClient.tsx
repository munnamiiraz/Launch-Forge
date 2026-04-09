"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trophy, Loader2, RefreshCw } from "lucide-react";

import { DashboardHeader } from "@/src/components/module/dashboard/_components/DashboardHeader";
import { Button } from "@/src/components/ui/button";
import { PrizesClient } from "@/src/components/module/prizes/_components/PrizesClient";
import { authFetch } from "@/src/lib/axios/authFetch";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";
import type { Prize, PrizeWaitlist } from "@/src/components/module/prizes/_types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: unknown;
};

type ApiWaitlistItem = {
  id: string;
  name: string;
  slug: string;
  isOpen: boolean;
  _count?: { subscribers: number };
};

export function PrizesPageClient() {
  const { activeWorkspace } = useWorkspace();

  const [waitlists, setWaitlists] = useState<PrizeWaitlist[]>([]);
  const [initialPrizes, setInitialPrizes] = useState<Record<string, Prize[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    setError(null);

    try {
      const waitlistsRes = await authFetch(
        `${API_BASE}/waitlists/${activeWorkspace.id}?page=1&limit=100`,
        { cache: "no-store" },
      );
      const waitlistsJson = (await waitlistsRes.json()) as ApiResponse<ApiWaitlistItem[]>;
      if (!waitlistsRes.ok) throw new Error(waitlistsJson.message || "Failed to fetch waitlists");

      const rawWaitlists = Array.isArray(waitlistsJson.data) ? waitlistsJson.data : [];

      const prizeFetches = await Promise.all(
        rawWaitlists.map(async (w) => {
          const res = await authFetch(
            `${API_BASE}/prizes/waitlist/${w.id}?workspaceId=${activeWorkspace.id}`,
            { cache: "no-store" },
          );
          const json = (await res.json()) as ApiResponse<Prize[]>;
          if (!res.ok) throw new Error(json.message || `Failed to fetch prizes for ${w.name}`);
          return { waitlistId: w.id, prizes: Array.isArray(json.data) ? json.data : [] };
        }),
      );

      const prizesByWaitlist: Record<string, Prize[]> = {};
      for (const row of prizeFetches) prizesByWaitlist[row.waitlistId] = row.prizes;

      const mappedWaitlists: PrizeWaitlist[] = rawWaitlists.map((w) => {
        const prizes = prizesByWaitlist[w.id] ?? [];
        const activePrizes = prizes.filter((p) => p.status === "ACTIVE");
        const totalPrizePool = activePrizes
          .filter((p) => p.prizeType === "CASH" && p.value)
          .reduce((sum, p) => sum + (p.value ?? 0), 0);

        return {
          id: w.id,
          name: w.name,
          slug: w.slug,
          isOpen: Boolean(w.isOpen),
          subscribers: Number(w._count?.subscribers ?? 0),
          activePrizes: activePrizes.length,
          totalPrizePool,
        };
      });

      setInitialPrizes(prizesByWaitlist);
      setWaitlists(mappedWaitlists);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load prizes.");
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totals = useMemo(() => {
    const totalActivePrizes = waitlists.reduce((s, w) => s + (w.activePrizes ?? 0), 0);
    const totalPool = waitlists.reduce((s, w) => s + (w.totalPrizePool ?? 0), 0);
    return { totalActivePrizes, totalPool };
  }, [waitlists]);

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-50/50 dark:bg-[#0f1115]">
      {/* Premium Background Mesh - Adjusted for slightly lighter base */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[600px] w-[600px] rounded-full bg-indigo-500/15 blur-[120px] dark:bg-indigo-500/[0.08]" />
        <div className="absolute -right-[5%] top-[10%] h-[500px] w-[500px] rounded-full bg-amber-500/15 blur-[100px] dark:bg-amber-500/[0.06]" />
        <div className="absolute bottom-[20%] left-[15%] h-[550px] w-[550px] rounded-full bg-violet-500/15 blur-[130px] dark:bg-violet-500/[0.07]" />
        
        {/* Animated noise/grain texture for depth */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150" />
      </div>

      <div className="relative z-10 flex flex-col">
        <DashboardHeader
          title="Prizes"
          subtitle={
            loading
              ? "Loadingâ€¦"
              : `${totals.totalActivePrizes} active prize${totals.totalActivePrizes !== 1 ? "s" : ""} Â· $${totals.totalPool.toLocaleString()} total pool`
          }
        />

        <div className="flex flex-col gap-6 p-6">
          {/* Enhanced Promo/Info Banner - Lighter glassmorphism */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/60 px-6 py-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-amber-500/25 dark:bg-zinc-900/60 dark:backdrop-blur-xl">
            {/* Animated accent line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl transition-all duration-500 group-hover:bg-amber-500/15" />
            <div aria-hidden className="pointer-events-none absolute -left-8 bottom-0 h-32 w-64 rounded-full bg-indigo-500/5 blur-3xl" />

            <div className="relative flex items-center gap-5 sm:flex-row">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 transition-transform duration-300 group-hover:scale-110 dark:border-amber-500/30 dark:bg-amber-500/15">
                <Trophy size={22} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold tracking-tight text-foreground">Prize pool management</h1>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground/80">
                  Announce monetary rewards, gift cards, lifetime access, or custom prizes for top
                  referrers on each waitlist. Prizes appear on the public leaderboard to motivate
                  sharing â€” the more you offer, the more your subscribers will recruit.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground/80">
              <RefreshCw size={24} className="mb-4 animate-spin text-zinc-400 opacity-50" />
              <span className="text-sm font-medium tracking-wide">Syncing prize inventory...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/[0.02] py-20 text-center dark:bg-red-500/[0.05]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <RefreshCw size={20} />
              </div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchData}
                className="mt-6 border-red-500/20 text-xs hover:bg-red-500/10"
              >
                Try reconnecting
              </Button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
              <PrizesClient
                key={activeWorkspace?.id ?? "no-ws"}
                waitlists={waitlists}
                initialPrizes={initialPrizes}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

