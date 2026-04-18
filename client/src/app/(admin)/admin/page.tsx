import { type Metadata } from "next";
import {
  getAdminKpis, getRevenueTrend, getUserGrowth,
  getPlanBreakdown, getSignupSources, getRecentActivity,
  getSystemHealth, getTopWaitlists, getRecentUsers,
} from "@/src/components/module/admin/_lib/data";

import { AdminKpiGrid }        from "@/src/components/module/admin/_components/AdminKpiGrid";
import { AdminRevenueChart, AdminUserGrowthChart } from "@/src/components/module/admin/_components/AdminCharts";
import { AdminPlanChart, AdminSignupSourcesChart } from "@/src/components/module/admin/_components/AdminPlanCharts";
import { AdminActivityFeed, AdminSystemHealth, AdminTopWaitlists } from "@/src/components/module/admin/_components/AdminPanels";
import { AdminUsersTable }     from "@/src/components/module/admin/_components/AdminUsersTable";

export const metadata: Metadata = {
  title: "Admin — LaunchForge",
};

function Section({ title, description, children }: {
  title: string; description: string; children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-muted/60" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/70">
            {title}
          </span>
          {description && (
            <span className="text-[9px] text-muted-foreground/40">{description}</span>
          )}
        </div>
        <div className="h-px flex-1 bg-muted/60" />
      </div>
      {children}
    </section>
  );
}

export default async function AdminPage() {
  const [
    kpis, revenue, growth7d, growth30d, growth90d, plans, sources, activity, health, topWaitlists, users,
  ] = await Promise.all([
    getAdminKpis(),
    getRevenueTrend(),
    getUserGrowth(7),
    getUserGrowth(30),
    getUserGrowth(90),
    getPlanBreakdown(),
    getSignupSources(),
    getRecentActivity(),
    getSystemHealth(),
    getTopWaitlists(),
    getRecentUsers(),
  ]);

  const growthData = { "7d": growth7d, "30d": growth30d, "90d": growth90d };

  return (
    <div className="flex min-h-full flex-col gap-8 p-6">

      {/* ── Page title ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-card/30 px-6 py-5">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-red-500/6 blur-3xl" />
        <div className="relative">
          <h1 className="text-lg font-black tracking-tight text-foreground">
            Platform overview
          </h1>
          <p className="mt-1 text-xs text-muted-foreground/80 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Analytics data refreshes every <span className="font-bold text-foreground">6 hours</span>.</span>
            <span className="hidden sm:inline text-muted-foreground/30">•</span>
            <span>Activity feed is <span className="text-emerald-500 font-bold">Live</span>.</span>
            <span className="hidden sm:inline text-muted-foreground/30">•</span>
            <span>Logged in as <span className="text-red-400 font-semibold">Admin</span>.</span>
          </p>
        </div>
      </div>

      {/* ── KPI grid ──────────────────────────────────────────── */}
      <Section title="Platform KPIs" description="Key metrics — all workspaces combined">
        <AdminKpiGrid kpis={kpis} />
      </Section>

      {/* ── Revenue + growth charts ───────────────────────────── */}
      <Section title="Revenue & Growth" description="MRR trend and user acquisition">
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminRevenueChart data={revenue} />
          <AdminUserGrowthChart data={growthData} />
        </div>
      </Section>

      {/* ── Plan breakdown + signup sources ───────────────────── */}
      <Section title="Acquisition" description="Where users come from and what they pay">
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminPlanChart data={plans} />
          <AdminSignupSourcesChart data={sources} />
        </div>
      </Section>

      {/* ── Activity + system + top waitlists (3-col) ─────────── */}
      <Section title="Operations" description="Live activity, system status, and top performers">
        <div className="grid gap-4 lg:grid-cols-3">
          <AdminActivityFeed activities={activity} />
          <div className="flex flex-col gap-4">
            <AdminSystemHealth health={health} />
          </div>
          <AdminTopWaitlists waitlists={topWaitlists} />
        </div>
      </Section>

    </div>
  );
}