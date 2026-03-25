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
    <div className="flex flex-col">
      <DashboardHeader
        title="Prizes"
        subtitle={
          loading
            ? "Loadingâ€¦"
            : `${totals.totalActivePrizes} active prize${totals.totalActivePrizes !== 1 ? "s" : ""} Â· $${totals.totalPool.toLocaleString()} total pool`
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-card/30 px-6 py-5">
          <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-500/8 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -left-8 bottom-0 h-32 w-64 rounded-full bg-indigo-500/5 blur-3xl" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/12">
              <Trophy size={20} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-base font-bold text-foreground">Prize pool management</h1>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground/80">
                Announce monetary rewards, gift cards, lifetime access, or custom prizes for top
                referrers on each waitlist. Prizes appear on the public leaderboard to motivate
                sharing â€” the more you offer, the more your subscribers will recruit.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground/80">
            <Loader2 size={20} className="mr-2 animate-spin" />
            <span className="text-sm">Loading prizesâ€¦</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 py-16 text-center">
            <p className="text-sm font-medium text-red-400">{error}</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchData}
              className="mt-4 gap-2 text-muted-foreground/80 hover:text-foreground/80"
            >
              <RefreshCw size={13} /> Retry
            </Button>
          </div>
        ) : (
          <PrizesClient
            key={activeWorkspace?.id ?? "no-ws"}
            waitlists={waitlists}
            initialPrizes={initialPrizes}
          />
        )}
      </div>
    </div>
  );
}

