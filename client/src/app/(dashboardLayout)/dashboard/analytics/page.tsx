import { type Metadata } from "next";
import { cookies } from "next/headers";
import { Download } from "lucide-react";
import { Button } from "@/src/components/ui/button";

import { DashboardHeader }       from "@/src/components/module/dashboard/_components/DashboardHeader";
import { AnalyticsKpiStrip }     from "@/src/components/module/owners-analytics/_components/AnalyticsKpiStrip";
import { SubscriberGrowthChart } from "@/src/components/module/owners-analytics/_components/SubscriberGrowthChart";
import { ReferralFunnelChart, SignupSourceChart } from "@/src/components/module/owners-analytics/_components/ReferralFunnelChart";
import { ViralKFactorChart, WaitlistComparisonChart } from "@/src/components/module/owners-analytics/_components/ViralKFactorChart";
import { ConfirmationRateChart, TopReferrersChart } from "@/src/components/module/owners-analytics/_components/ConfirmationRateChart";
import { RevenueMrrChart, PlanDistributionChart } from "@/src/components/module/owners-analytics/_components/RevenueMrrChart";
import { CohortRetentionChart } from "@/src/components/module/owners-analytics/_components/CohortRetentionChart";
import { UpgradeGate } from "@/src/components/shared/UpgradeGate";
import { isFeatureAvailable, type PlanTier } from "@/src/lib/plan-limits";

export const metadata: Metadata = {
  title:       "Analytics — LaunchForge",
  description: "Full analytics dashboard for your waitlists, referrals, and revenue.",
};

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="text-sm font-bold tracking-tight text-foreground/90">{title}</h2>
      <p className="text-xs text-muted-foreground/60">{description}</p>
    </div>
  );
}

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-muted/60" />
      <div>{children}</div>
      <div className="h-px flex-1 bg-muted/60" />
    </div>
  );
}

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const activePlan = (cookieStore.get("activeWorkspacePlan")?.value?.toUpperCase() || "FREE") as PlanTier;
  const hasAnalytics = isFeatureAvailable(activePlan, "analytics");

  return (
    <div className="flex flex-col">

      {/* ── Sticky header ─────────────────────────────────────── */}
      <DashboardHeader
        title="Analytics"
        subtitle="Full picture of your waitlist performance"
      >
      </DashboardHeader>

      {!hasAnalytics ? (
        <UpgradeGate
          featureName="Analytics"
          requiredPlan="PRO"
          description="Unlock subscriber growth charts, referral funnels, viral coefficient tracking, cohort retention, and revenue analytics with the Pro plan."
        />
      ) : (
        <div className="flex flex-col gap-8 p-6">

          {/* ── KPI strip ─────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Overview"
              description="Key metrics across all your waitlists and revenue"
            />
            <AnalyticsKpiStrip />
          </section>

          {/* ── Growth ────────────────────────────────────────────── */}
          <SectionDivider>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
              Growth
            </span>
          </SectionDivider>

          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Subscriber growth"
              description="New signups and cumulative total — toggle between 7D / 30D / 90D / 12M"
            />
            <SubscriberGrowthChart />
          </section>

          {/* ── Referrals ─────────────────────────────────────────── */}
          <SectionDivider>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
              Referrals
            </span>
          </SectionDivider>

          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Referral & viral metrics"
              description="Funnel depth, signup sources, viral coefficient, and top performers"
            />
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <ReferralFunnelChart />
              <SignupSourceChart />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <ViralKFactorChart />
              <TopReferrersChart />
            </div>
          </section>

          {/* ── Waitlist health ───────────────────────────────────── */}
          <SectionDivider>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
              Waitlist health
            </span>
          </SectionDivider>

          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Waitlist performance"
              description="Compare subscribers, referrals, and confirmation rates across all waitlists"
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <WaitlistComparisonChart />
              <ConfirmationRateChart />
            </div>
          </section>

          {/* ── Retention ─────────────────────────────────────────── */}
          <SectionDivider>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
              Retention
            </span>
          </SectionDivider>

          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Cohort retention"
              description="How many subscribers from each weekly cohort remain active over time"
            />
            <CohortRetentionChart />
          </section>

          {/* ── Revenue ───────────────────────────────────────────── */}
          <SectionDivider>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
              Revenue
            </span>
          </SectionDivider>

          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Revenue & plan analytics"
              description="MRR trend and plan distribution derived from Payment records"
            />
            <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
              <RevenueMrrChart />
              <PlanDistributionChart />
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
