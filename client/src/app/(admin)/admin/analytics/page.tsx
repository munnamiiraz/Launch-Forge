import { type Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { AnalyticsKpiRow }         from "@/src/components/module/admin-analytics/_components/AnalyticsKpiRow";
import { EngagementChart }          from "@/src/components/module/admin-analytics/_components/EngagementChart";
import { FeatureAdoptionChart }     from "@/src/components/module/admin-analytics/_components/FeatureAdoptionChart";
import {
  PlatformSubscriberChart,
  WaitlistHealthChart,
}                                   from "@/src/components/module/admin-analytics/_components/PlatformSubscriberChart";
import { ReferralNetworkChart }     from "@/src/components/module/admin-analytics/_components/ReferralNetworkChart";
import {
  FeedbackHealthChart,
  RoadmapProgressChart,
}                                   from "@/src/components/module/admin-analytics/_components/FeedbackHealthChart";
import {
  WorkspaceHeatmap,
  ChangelogChart,
}                                   from "@/src/components/module/admin-analytics/_components/WorkspaceHeatmap";
import { getEngagementStats }       from "@/src/components/module/admin-analytics/_lib/analytics-data";

export const metadata: Metadata = {
  title:       "Analytics — Admin · LaunchForge",
  description: "Platform-wide analytics — engagement, features, subscribers, referrals, feedback.",
};

function Divider({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-muted/60" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/70">{title}</span>
        {sub && <span className="text-[9px] text-muted-foreground/40">{sub}</span>}
      </div>
      <div className="h-px flex-1 bg-muted/60" />
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const engStats = getEngagementStats();

  return (
    <div className="flex flex-col gap-8 p-6">

      {/* ── Page identity band ───────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-card/30 px-6 py-5">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-red-500/5 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-8 bottom-0 h-24 w-48 rounded-full bg-violet-500/4 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10">
            <BarChart3 size={18} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">
              Platform analytics
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground/80">
              Full behavioural and product health metrics across every model —
              engagement, feature adoption, subscriber growth, referral network,
              feedback health, roadmap progress, and workspace activity patterns.
            </p>
            {/* Model legend */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                "User", "Session", "Workspace", "Waitlist", "Subscriber",
                "FeedbackBoard", "FeatureRequest", "Vote", "Comment",
                "Roadmap", "RoadmapItem", "Changelog",
              ].map((m) => (
                <code
                  key={m}
                  className="rounded border border-border/60 bg-card/60 px-1.5 py-0.5 text-[9px] text-muted-foreground/80"
                >
                  {m}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Engagement KPIs ─────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Engagement" sub="DAU · WAU · MAU · stickiness — from Session model" />
        <AnalyticsKpiRow stats={engStats} />
        <EngagementChart />
      </section>

      {/* ── Feature adoption ────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Feature adoption" sub="% of workspaces using each product feature" />
        <FeatureAdoptionChart />
      </section>

      {/* ── Subscriber & waitlist health ─────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Subscriber & waitlist health" sub="Platform-wide Subscriber growth and Waitlist size distribution" />
        <div className="grid gap-4 lg:grid-cols-2">
          <PlatformSubscriberChart />
          <WaitlistHealthChart />
        </div>
      </section>

      {/* ── Referral network ────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Referral network" sub="Global referral chain depth and k-factor — Subscriber.referredById" />
        <ReferralNetworkChart />
      </section>

      {/* ── Feedback & roadmap ──────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Feedback & roadmap" sub="FeatureRequest status, Vote & Comment activity, RoadmapItem progress" />
        <FeedbackHealthChart />
        <RoadmapProgressChart />
      </section>

      {/* ── Activity patterns & changelog ───────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Activity & content" sub="Workspace usage heatmap and Changelog publishing trends" />
        <WorkspaceHeatmap />
        <div className="grid gap-4 lg:grid-cols-2">
          <ChangelogChart />
          {/* Spacer / future chart placeholder */}
          <div className="hidden lg:flex items-center justify-center rounded-2xl border border-dashed border-border/40 text-[11px] text-muted-foreground/40">
            More charts coming soon
          </div>
        </div>
      </section>

    </div>
  );
}