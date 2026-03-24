"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Share2, BarChart3, Zap, Loader2, RefreshCw } from "lucide-react";
import { Button }              from "@/src/components/ui/button";
import { DashboardHeader }      from "@/src/components/module/dashboard/_components/DashboardHeader";
import { StatCard }             from "@/src/components/module/dashboard/_components/StatCard";
import { GrowthChart }          from "@/src/components/module/dashboard/_components/GrowthChart";
import { RecentActivityFeed }   from "@/src/components/module/dashboard/_components/RecentActivityFeed";
import { WaitlistsTable }       from "@/src/components/module/dashboard/_components/WaitlistsTable";
import { CreateWaitlistDialog } from "@/src/components/module/dashboard/_components/CreateWaitlistDialog";
import { useWorkspace }         from "@/src/provider/WorkspaceProvider";
import type { DashboardWaitlist } from "@/src/components/module/dashboard/_types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

interface DashboardStats {
  totalSubscribers: number;
  totalWaitlists:   number;
  totalReferrals:   number;
  conversionRate:   number;
}

type ApiDashboardOverview = {
  data?: {
    stats?: Partial<DashboardStats>;
    waitlists?: ApiWaitlist[];
  };
  message?: string;
};

type ApiWaitlist = {
  id: string;
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  isOpen?: boolean;
  subscribers?: number;
  totalReferrals?: number;
  referrals?: number;
  createdAt?: string;
  _count?: { subscribers?: number };
};

export default function DashboardPage() {
  const { activeWorkspace } = useWorkspace();
  const [stats, setStats]         = useState<DashboardStats>({
    totalSubscribers: 0,
    totalWaitlists:   0,
    totalReferrals:   0,
    conversionRate:   0,
  });
  const [waitlists, setWaitlists] = useState<DashboardWaitlist[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      // NOTE: We probably need an API endpoint that filters by workspaceId.
      // If /workspaces/dashboard/overview doesn't support workspaceId param, we might see everything.
      // Let's try passing it as a query param.
      const res = await fetch(`${BASE_URL}/workspaces/dashboard/overview?workspaceId=${activeWorkspace.id}`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = (await res.json()) as ApiDashboardOverview;
      if (!res.ok) throw new Error(json.message || "Failed to fetch overview");
      
      const apiStats = json?.data?.stats ?? {};
      setStats({
        totalSubscribers: Number(apiStats.totalSubscribers ?? 0),
        totalWaitlists:   Number(apiStats.totalWaitlists ?? 0),
        totalReferrals:   Number(apiStats.totalReferrals ?? 0),
        conversionRate:   Number(apiStats.conversionRate ?? 0),
      });

      const apiWaitlists = Array.isArray(json?.data?.waitlists) ? json.data.waitlists : [];
      setWaitlists(apiWaitlists.map((w) => ({
        id:          w.id,
        name:        w.name ?? "",
        slug:        w.slug ?? "",
        logoUrl:     w.logoUrl ?? null,
        isOpen:      Boolean(w.isOpen),
        subscribers: Number(w.subscribers ?? w._count?.subscribers ?? 0),
        referrals:   Number(w.totalReferrals ?? w.referrals ?? 0),
        createdAt:   w.createdAt ?? "",
      })));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch overview");
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col h-full bg-background">
        <DashboardHeader title="Dashboard" subtitle="Please select a workspace" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 mb-4">
            <Zap size={20} className="text-muted-foreground/60" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No workspace active</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Select a workspace from the sidebar to view your metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Dashboard"
        subtitle={`Overview for ${activeWorkspace.name}`}
      >
        <CreateWaitlistDialog />
      </DashboardHeader>

      <div className="flex flex-col gap-6 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground/80">
            <Loader2 size={20} className="animate-spin mr-2" />
            <span className="text-sm">Fetching metrics…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 py-16 text-center">
            <p className="text-sm font-medium text-red-400">{error}</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchOverview}
              className="mt-4 gap-2 text-muted-foreground/80 hover:text-foreground/80"
            >
              <RefreshCw size={13} /> Retry
            </Button>
          </div>
        ) : (
          <>
            {/* ── Stat cards ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <StatCard
                label="Total Subscribers"
                value={stats.totalSubscribers}
                delta="+0 today"
                deltaType="neutral"
                subtext="vs last week"
                icon={<Users size={15} />}
                accent="indigo"
                index={0}
              />
              <StatCard
                label="Active Waitlists"
                value={stats.totalWaitlists}
                delta="Updated just now"
                deltaType="neutral"
                icon={<Zap size={15} />}
                accent="violet"
                index={1}
              />
              <StatCard
                label="Total Referrals"
                value={stats.totalReferrals}
                delta="0%"
                deltaType="neutral"
                subtext="this month"
                icon={<Share2 size={15} />}
                accent="emerald"
                index={2}
              />
              <StatCard
                label="Conversion Rate"
                value={`${stats.conversionRate.toFixed(2)}%`}
                delta="0pp"
                deltaType="neutral"
                subtext="vs industry avg"
                icon={<BarChart3 size={15} />}
                accent="amber"
                index={3}
              />
            </div>

            {/* ── Chart + Activity ──────────────────────────────────── */}
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <GrowthChart />
              {/* <RecentActivityFeed /> */}
            </div>

            {/* ── Waitlists table ───────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground/90">Your waitlists</h2>
                  <p className="text-xs text-muted-foreground/60">{waitlists.length} total</p>
                </div>
                <CreateWaitlistDialog />
              </div>
              <WaitlistsTable waitlists={waitlists} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
