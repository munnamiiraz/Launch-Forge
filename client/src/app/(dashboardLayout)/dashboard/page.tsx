"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Share2, BarChart3, Zap, RefreshCw } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button }              from "@/src/components/ui/button";
import { DashboardHeader }      from "@/src/components/module/dashboard/_components/DashboardHeader";
import { StatCard }             from "@/src/components/module/dashboard/_components/StatCard";
import { GrowthChart }          from "@/src/components/module/dashboard/_components/GrowthChart";
import { WaitlistsTable }       from "@/src/components/module/dashboard/_components/WaitlistsTable";
import { AiInsightsCard }     from "@/src/components/module/dashboard/_components/AiInsightsCard";
import { CreateWaitlistDialog } from "@/src/components/module/dashboard/_components/CreateWaitlistDialog";
import { authFetch }            from "@/src/lib/axios/authFetch";
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
  archivedAt?: string | null;
  subscribers?: number;
  totalReferrals?: number;
  referrals?: number;
  createdAt?: string;
  _count?: { subscribers?: number };
};

interface GrowthDataPoint {
  day: string;
  value: number;
}

export default function DashboardPage() {
  const { activeWorkspace } = useWorkspace();
  const [stats, setStats]         = useState<DashboardStats>({
    totalSubscribers: 0,
    totalWaitlists:   0,
    totalReferrals:   0,
    conversionRate:   0,
  });
  const [waitlists, setWaitlists] = useState<DashboardWaitlist[]>([]);
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch overview and growth data in parallel for a unified loading state
      const [overviewRes, growthRes] = await Promise.all([
        authFetch(`${BASE_URL}/workspaces/dashboard/overview?workspaceId=${activeWorkspace.id}`, { cache: "no-store" }),
        authFetch(`${BASE_URL}/workspaces/${activeWorkspace.id}/analytics/growth?range=7d`, { cache: "no-store" })
      ]);

      const [overviewJson, growthJson] = await Promise.all([
        overviewRes.json(),
        growthRes.json()
      ]);

      if (!overviewRes.ok) throw new Error(overviewJson.message || "Failed to fetch overview");

      // Process Overview
      const apiStats = overviewJson?.data?.stats ?? {};
      setStats({
        totalSubscribers: Number(apiStats.totalSubscribers ?? 0),
        totalWaitlists:   Number(apiStats.totalWaitlists ?? 0),
        totalReferrals:   Number(apiStats.totalReferrals ?? 0),
        conversionRate:   Number(apiStats.conversionRate ?? 0),
      });

      const apiWaitlists = Array.isArray(overviewJson?.data?.waitlists) ? overviewJson.data.waitlists : [];
      setWaitlists(apiWaitlists.map((w: ApiWaitlist) => ({
        id:          w.id,
        name:        w.name ?? "",
        slug:        w.slug ?? "",
        logoUrl:     w.logoUrl ?? null,
        isOpen:      Boolean(w.isOpen),
        archivedAt:  w.archivedAt ?? null,
        subscribers: Number(w.subscribers ?? w._count?.subscribers ?? 0),
        referrals:   Number(w.totalReferrals ?? w.referrals ?? 0),
        createdAt:   w.createdAt ?? "",
      })));

      // Process Growth
      if (growthRes.ok && Array.isArray(growthJson?.data)) {
        const transformed = growthJson.data.map((item: any) => ({
          day: item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3) : "",
          value: item.subscribers || 0,
        }));
        setGrowthData(transformed);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col h-full bg-background">
        <DashboardHeader title="Dashboard" subtitle="Please select a workspace" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">No workspace active</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Select a workspace from the sidebar to view your metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <DashboardHeader
        title="Dashboard"
        subtitle={`Overview for ${activeWorkspace.name}`}
      >
        <CreateWaitlistDialog />
      </DashboardHeader>

      <div className="flex flex-col gap-6 p-6">
        {loading ? (
          <>
            {/* Unified Skeleton for the whole page ── Matches loading.tsx exactly */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/40 p-5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                  <div className="flex flex-col gap-1.5 pt-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2 w-20 opacity-40" />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
              <Skeleton className="h-[420px] w-full rounded-2xl border border-border/40" />
              <Skeleton className="h-[420px] w-full rounded-2xl border border-border/40" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-32 rounded-lg" />
              </div>
              <div className="rounded-2xl border border-border/40 bg-card/20 overflow-hidden px-6 py-8">
                 <div className="flex flex-col gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-6">
                        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                        <div className="flex flex-col gap-2 flex-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32 opacity-40" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 py-16 text-center">
            <p className="text-sm font-medium text-red-400">{error}</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchDashboardData}
              className="mt-4 gap-2 text-muted-foreground/80 hover:text-foreground/80"
            >
              <RefreshCw size={13} /> Retry
            </Button>
          </div>
        ) : (
          <>
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

            <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
              <GrowthChart externalData={growthData} />
              <AiInsightsCard />
            </div>

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
