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
        <div className="h-px flex-1 bg-zinc-800/60" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/70">
            {title}
          </span>
          {description && (
            <span className="text-[9px] text-zinc-700">{description}</span>
          )}
        </div>
        <div className="h-px flex-1 bg-zinc-800/60" />
      </div>
      {children}
    </section>
  );
}

export default async function AdminPage() {
  const [
    kpis, activity, health, topWaitlists, users,
  ] = await Promise.all([
    getAdminKpis(),
    getRecentActivity(),
    getSystemHealth(),
    getTopWaitlists(),
    getRecentUsers(),
  ]);

  return (
    <div className="flex flex-col gap-8 p-6">

      {/* ── Page title ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-zinc-900/30 px-6 py-5">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-red-500/6 blur-3xl" />
        <div className="relative">
          <h1 className="text-lg font-black tracking-tight text-zinc-100">
            Platform overview
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Real-time metrics across all users, workspaces, waitlists, and revenue.
            You are logged in as <span className="text-red-400 font-semibold">Super Admin</span>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-zinc-600">
            {[
              `${kpis.totalUsers.toLocaleString()} users`,
              `${kpis.totalWaitlists.toLocaleString()} waitlists`,
              `${(kpis.totalSubscribers / 1_000_000).toFixed(2)}M subscribers`,
              `$${(kpis.mrr / 1000).toFixed(1)}k MRR`,
            ].map((s) => (
              <span key={s} className="rounded-full border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI grid ──────────────────────────────────────────── */}
      <Section title="Platform KPIs" description="Key metrics — all workspaces combined">
        <AdminKpiGrid kpis={kpis} />
      </Section>

      {/* ── Revenue + growth charts ───────────────────────────── */}
      <Section title="Revenue & Growth" description="MRR trend and user acquisition">
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminRevenueChart />
          <AdminUserGrowthChart />
        </div>
      </Section>

      {/* ── Plan breakdown + signup sources ───────────────────── */}
      <Section title="Acquisition" description="Where users come from and what they pay">
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminPlanChart />
          <AdminSignupSourcesChart />
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

      {/* ── Users table ───────────────────────────────────────── */}
      <Section title="Users" description="All registered accounts — search, filter, and manage">
        <AdminUsersTable users={users} />
      </Section>

    </div>
  );
}