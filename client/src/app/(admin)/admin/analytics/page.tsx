import { type Metadata } from "next";
import { cookies } from "next/headers";
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
import { InfrastructureHealth }     from "@/src/components/module/admin-analytics/_components/InfrastructureHealth";
import { 
  type EngagementStats, 
  type EngagementPoint, 
  type FeatureAdoptionItem, 
  type PlatformSubscriberPoint, 
  type PlatformSubscriberStats, 
  type WaitlistHealthBucket, 
  type WaitlistHealthStats, 
  type ReferralNetworkPoint, 
  type ReferralStats, 
  type FeedbackStatusBreakdown, 
  type FeedbackCategoryPoint, 
  type FeedbackStats, 
  type RoadmapProgressItem, 
  type RoadmapStats, 
  type HeatmapCell, 
  type ChangelogPoint,
  type InfrastructureHealthStats 
} from "@/src/components/module/admin-analytics/_lib/analytics-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

async function fetchAnalyticsData<T>(endpoint: string): Promise<T | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Failed to fetch ${endpoint}:`, res.status);
      return null;
    }
    const json = await res.json();
    return json as T; // Return full response object (success, message, data, etc.)
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

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

// Minimal type for API responses
interface AdminApiResponse<TData = any, TStats = any> {
  success: boolean;
  message: string;
  data:    TData;
  stats?:  TStats;
}

export default async function AdminAnalyticsPage() {
  // Parallel fetch real data
  const [
    engStatsRes,
    engTimelineRes,
    featureAdoptionRes,
    subscriberDataRes,
    waitlistDataRes,
    referralDataRes,
    feedbackDataRes,
    roadmapDataRes,
    changelogDataRes,
    heatmapDataRes,
    infrastructureDataRes,
  ] = await Promise.all([
    fetchAnalyticsData<AdminApiResponse<EngagementStats>>("/admin/analytics/engagement"),
    fetchAnalyticsData<AdminApiResponse<EngagementPoint[]>>("/admin/analytics/engagement/timeline"),
    fetchAnalyticsData<AdminApiResponse<FeatureAdoptionItem[]>>("/admin/analytics/features"),
    fetchAnalyticsData<AdminApiResponse<PlatformSubscriberPoint[], PlatformSubscriberStats>>("/admin/analytics/subscribers"),
    fetchAnalyticsData<AdminApiResponse<WaitlistHealthBucket[], WaitlistHealthStats>>("/admin/analytics/waitlists"),
    fetchAnalyticsData<AdminApiResponse<ReferralNetworkPoint[], ReferralStats>>("/admin/analytics/referrals"),
    fetchAnalyticsData<AdminApiResponse<{ statusBreakdown: FeedbackStatusBreakdown[], timeline: FeedbackCategoryPoint[] }, FeedbackStats>>("/admin/analytics/feedback"),
    fetchAnalyticsData<AdminApiResponse<RoadmapProgressItem[], RoadmapStats>>("/admin/analytics/roadmap"),
    fetchAnalyticsData<AdminApiResponse<ChangelogPoint[]>>("/admin/analytics/changelog"),
    fetchAnalyticsData<AdminApiResponse<HeatmapCell[]>>("/admin/analytics/heatmap"),
    fetchAnalyticsData<AdminApiResponse<InfrastructureHealthStats>>("/admin/analytics/infrastructure"),
  ]);
  
  // Safe fallbacks — only real data or empty defaults (NO MOCK FALLBACKS)
  const safeEngStats   = engStatsRes?.data || { 
    dauToday: 0, wauThisWeek: 0, mauThisMonth: 0, 
    dauOverMau: 0, avgSessionsPerUser: 0, avgSessionLengthMin: 0,
    newUsersToday: 0, activeWorkspaces30d: 0 
  };
  const safeEngTl      = engTimelineRes?.data || [];
  const safeFeatures   = featureAdoptionRes?.data || [];
  const safeSubTl      = subscriberDataRes?.data || [];
  const safeWlBuckets  = waitlistDataRes?.data || [];
  const safeWlStats    = waitlistDataRes?.stats || { total: 0, open: 0, closed: 0, avgSubs: 0, medianSubs: 0, p90Subs: 0, totalSubs: 0 };
  const safeRefTl      = referralDataRes?.data || [];
  const safeRefStats   = referralDataRes?.stats || { totalReferrals: 0, totalReferrers: 0, avgReferralsPerReferrer: 0, topKFactor: 0, platformKFactor: 0, confirmedPct: 0 };
  const safeFbStatus   = feedbackDataRes?.data?.statusBreakdown || [];
  const safeFbTl       = feedbackDataRes?.data?.timeline || [];
  const safeFbStats    = feedbackDataRes?.stats || { totalBoards: 0, totalRequests: 0, totalVotes: 0, totalComments: 0, avgVotesPerRequest: 0, completedPct: 0, underReviewPct: 0 };
  const safeRoadTl     = roadmapDataRes?.data || [];
  const safeRoadStats  = roadmapDataRes?.stats || { totalRoadmaps: 0, totalItems: 0, completedPct: 0, inProgressPct: 0, plannedPct: 0 };
  const safeHeatmap    = heatmapDataRes?.data || [];
  const safeChangelog  = changelogDataRes?.data || [];
  const safeInfra      = infrastructureDataRes?.data || { queues: [], totalWorkers: 0, mode: "unknown" };

  return (
    <div className="flex min-h-full flex-col gap-8 p-6">

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
              <span className="block mt-1 font-semibold text-red-400">Data refreshes every 6 hours.</span>
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

      {/* ── Infrastructure Health ─────────────────────────── */}
      <section className="flex flex-col gap-4">
        <InfrastructureHealth data={safeInfra} />
      </section>

      {/* ── Engagement KPIs ─────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Engagement" sub="DAU · WAU · MAU · stickiness — from Session model" />
        <AnalyticsKpiRow stats={safeEngStats} />
        <EngagementChart data={safeEngTl} />
      </section>

      {/* ── Feature adoption ────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Feature adoption" sub="% of workspaces using each product feature" />
        <FeatureAdoptionChart data={safeFeatures} />
      </section>

      {/* ── Subscriber & waitlist health ─────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Subscriber & waitlist health" sub="Platform-wide Subscriber growth and Waitlist size distribution" />
        <div className="grid gap-4 lg:grid-cols-2">
          <PlatformSubscriberChart data={safeSubTl} />
          <WaitlistHealthChart buckets={safeWlBuckets} stats={safeWlStats} />
        </div>
      </section>

      {/* ── Referral network ────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Referral network" sub="Global referral chain depth and k-factor — Subscriber.referredById" />
        <ReferralNetworkChart data={safeRefTl} stats={safeRefStats} />
      </section>

      {/* ── Feedback & roadmap ──────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Feedback & roadmap" sub="FeatureRequest status, Vote & Comment activity, RoadmapItem progress" />
        <FeedbackHealthChart 
          breakdown={safeFbStatus}
          timeline={safeFbTl}
          stats={safeFbStats}
        />
        <RoadmapProgressChart data={safeRoadTl} stats={safeRoadStats} />
      </section>


    </div>
  );
}