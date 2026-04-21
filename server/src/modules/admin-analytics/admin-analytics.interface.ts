import { EngagementRange } from "./admin-analytics.constants";

/* ─────────────────────────────────────────────────────────────────
   Shared payload
   ──────────────────────────────────────────────────────────────── */

export interface AdminAnalyticsBasePayload {
  requestingUserId: string;
}

export interface EngagementTimelinePayload extends AdminAnalyticsBasePayload {
  range?: EngagementRange;
}

/* ─────────────────────────────────────────────────────────────────
   1. Engagement KPI strip (6 cards at top)
   Feeds: AnalyticsKpiRow
   ──────────────────────────────────────────────────────────────── */

export interface EngagementStats {
  dauToday:            number;
  wauThisWeek:         number;
  mauThisMonth:        number;
  dauOverMau:          number;
  avgSessionsPerUser:  number;
  avgSessionLengthMin: number;
  newUsersToday:       number;
  activeWorkspaces30d: number;
}

/* ─────────────────────────────────────────────────────────────────
   2. Engagement timeline chart
   Feeds: EngagementChart
   ──────────────────────────────────────────────────────────────── */

export interface EngagementPoint {
  date:   string;
  dau:    number;
  wau:    number;
  newReg: number;
}

/* ─────────────────────────────────────────────────────────────────
   3. Feature adoption
   Feeds: FeatureAdoptionChart
   ──────────────────────────────────────────────────────────────── */

export interface FeatureAdoptionItem {
  feature:  string;
  adopted:  number;
  total:    number;
  pct:      number;
  deltaWoW: number;
  fill:     string;
}

/* ─────────────────────────────────────────────────────────────────
   4. Platform subscriber growth
   Feeds: PlatformSubscriberChart
   ──────────────────────────────────────────────────────────────── */

export interface PlatformSubscriberPoint {
  month:          string;
  newSubscribers: number;
  cumulative:     number;
  referralSubs:   number;
  directSubs:     number;
}

export interface PlatformSubscriberStats {
  newThisMonth:  number;
  referralPct:   number;
  directPct:     number;
  cumulativeTotal: number;
  momGrowthPct:  number;
}

/* ─────────────────────────────────────────────────────────────────
   5. Waitlist health distribution
   Feeds: WaitlistHealthChart
   ──────────────────────────────────────────────────────────────── */

export interface WaitlistHealthBucket {
  bucket: string;
  count:  number;
  fill:   string;
}

export interface WaitlistHealthStats {
  total:      number;
  open:       number;
  closed:     number;
  avgSubs:    number;
  medianSubs: number;
  p90Subs:    number;
  totalSubs:  number;
}

/* ─────────────────────────────────────────────────────────────────
   6. Referral network
   Feeds: ReferralNetworkChart
   ──────────────────────────────────────────────────────────────── */

export interface ReferralNetworkPoint {
  month:          string;
  totalReferrals: number;
  chainReferrals: number;
  referrers:      number;
  avgChainDepth:  number;
}

export interface ReferralStats {
  totalReferrals:          number;
  totalReferrers:          number;
  avgReferralsPerReferrer: number;
  topKFactor:              number;
  platformKFactor:         number;
  confirmedPct:            number;
}

/* ─────────────────────────────────────────────────────────────────
   7. Feedback health
   Feeds: FeedbackHealthChart
   ──────────────────────────────────────────────────────────────── */

export interface FeedbackStatusBreakdown {
  status: string;
  count:  number;
  pct:    number;
  fill:   string;
}

export interface FeedbackCategoryPoint {
  date:     string;
  requests: number;
  votes:    number;
  comments: number;
}

export interface FeedbackStats {
  totalBoards:        number;
  totalRequests:      number;
  totalVotes:         number;
  totalComments:      number;
  avgVotesPerRequest: number;
  completedPct:       number;
  underReviewPct:     number;
}

/* ─────────────────────────────────────────────────────────────────
   8. Roadmap progress
   Feeds: RoadmapProgressChart
   ──────────────────────────────────────────────────────────────── */

export interface RoadmapProgressItem {
  status: string;
  count:  number;
  pct:    number;
  fill:   string;
}

export interface RoadmapStats {
  totalRoadmaps: number;
  totalItems:    number;
  completedPct:  number;
  inProgressPct: number;
  plannedPct:    number;
}

/* ─────────────────────────────────────────────────────────────────
   9. Changelog publishing
   Feeds: ChangelogChart
   ──────────────────────────────────────────────────────────────── */

export interface ChangelogPoint {
  month:     string;
  published: number;
  drafts:    number;
}

/* ─────────────────────────────────────────────────────────────────
   10. Workspace activity heatmap
   Feeds: WorkspaceHeatmap
   ──────────────────────────────────────────────────────────────── */

export interface HeatmapCell {
  day:   string;
  hour:  number;
  value: number;
}

/* ─────────────────────────────────────────────────────────────────
   11. Infrastructure Health
   ──────────────────────────────────────────────────────────────── */

export interface QueueMetrics {
  name:      string;
  waiting:   number;
  active:    number;
  completed: number;
  failed:    number;
  delayed:   number;
}

export interface InfrastructureHealthStats {
  queues: QueueMetrics[];
  totalWorkers: number;
  mode: string;
}