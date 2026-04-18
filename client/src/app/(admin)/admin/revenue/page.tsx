import { type Metadata } from "next";
import { DollarSign } from "lucide-react";

import { RevenueKpiStrip }    from "@/src/components/module/admin-revenue/_components/RevenueKpiStrip";
import { MrrWaterfallChart }  from "@/src/components/module/admin-revenue/_components/MrrWaterfallChart";
import { PlanRevenueChart }   from "@/src/components/module/admin-revenue/_components/PlanRevenueChart";
import { ChurnAnalysisChart } from "@/src/components/module/admin-revenue/_components/ChurnAnalysisChart";
import { CohortLtvTable, RevenueByCountryCard } from "@/src/components/module/admin-revenue/_components/CohortLtvTable";
import { TransactionsTable }  from "@/src/components/module/admin-revenue/_components/TransactionsTable";
import {
  getRevenueKpis,
  getMrrWaterfall,
  getPlanRevenue,
  getChurnData,
  getCohortLtv,
  getRevenueByCountry,
  getRecentTransactions,
} from "@/src/components/module/admin-revenue/_lib/revenue-data";

export const metadata: Metadata = {
  title:       "Revenue — Admin · LaunchForge",
  description: "Platform-wide revenue analytics — MRR, churn, LTV, and transactions.",
};

function SectionDivider({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-muted/60" />
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/70">{title}</span>
        {sub && <span className="text-[9px] text-muted-foreground/40">{sub}</span>}
      </div>
      <div className="h-px flex-1 bg-muted/60" />
    </div>
  );
}

export default async function AdminRevenuePage() {
  const [kpis, mrrWaterfall, planRevenue, churnData, cohortLtv, countries, transactions] = await Promise.all([
    getRevenueKpis(),
    getMrrWaterfall(),
    getPlanRevenue(),
    getChurnData(),
    getCohortLtv(),
    getRevenueByCountry(),
    getRecentTransactions(),
  ]);

  // Ensure all data is defined with safe defaults
  const safeKpis = kpis ?? { mrr: 0, arr: 0, mrrGrowthPct: 0, newMrrThisMonth: 0, churnedMrr: 0, expansionMrr: 0, netNewMrr: 0, ltv: 0, arpu: 0, payingUsers: 0, churnRatePct: 0, avgSubLengthMonths: 0 };
  const safeMrrWaterfall = mrrWaterfall ?? [];
  const safePlanRevenue = planRevenue ?? [];
  const safeChurnData = churnData ?? [];
  const safeCohortLtv = cohortLtv ?? [];
  const safeCountries = countries ?? [];
  const safeTransactions = transactions ?? [];

  return (
    <div className="flex min-h-full flex-col gap-8 p-6">

      {/* ── Page identity band ────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-card/30 px-6 py-5">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-8 bottom-0 h-24 w-48 rounded-full bg-indigo-500/4 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10">
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">
              Revenue analytics
            </h1>
             <p className="mt-1 text-xs leading-relaxed text-muted-foreground/80">
               Full financial picture of the LaunchForge platform — MRR waterfall, plan breakdowns,
               churn analysis, cohort LTV, and every recent payment transaction.
               <span className="block mt-1 font-semibold text-emerald-400">Charts refresh every 6h. Transactions refresh every 1m.</span>
             </p>
          </div>
        </div>
      </div>

      {/* ── KPI strip ─────────────────────────────────────── */}
      <section>
        <RevenueKpiStrip kpis={safeKpis} />
      </section>

      {/* ── MRR waterfall ─────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionDivider title="MRR Trend" sub="12-month waterfall and net new MRR" />
        <MrrWaterfallChart data={safeMrrWaterfall} />
      </section>

      {/* ── Plan revenue breakdown ────────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionDivider title="Plan revenue" sub="Revenue and churn per subscription tier" />
        <PlanRevenueChart data={safePlanRevenue} />
      </section>

      {/* ── Churn analysis ────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionDivider title="Churn" sub="Monthly churn users, recovery, and rate trend" />
        <ChurnAnalysisChart data={safeChurnData} />
      </section>

      {/* ── Cohort LTV + geography ───────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionDivider title="LTV & Geography" sub="Cohort revenue retention and top markets" />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <CohortLtvTable data={safeCohortLtv} />
          <RevenueByCountryCard data={safeCountries} />
        </div>
      </section>

      {/* ── Transactions ─────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionDivider title="Transactions" sub="Recent payment events from the Payment model" />
        <TransactionsTable allTx={safeTransactions} />
      </section>

    </div>
  );
}