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
  dauToday:            number;   // unique users with a session today
  wauThisWeek:         number;   // unique users with a session this week
  mauThisMonth:        number;   // unique users with a session this month
  dauOverMau:          number;   // (dau / mau) × 100 — stickiness %
  avgSessionsPerUser:  number;   // total sessions / unique users (30d)
  avgSessionLengthMin: number;   // placeholder — schema has no session.duration
}

/* ─────────────────────────────────────────────────────────────────
   2. Engagement timeline chart (DAU/WAU/new registrations)
      Feeds: EngagementChart
   ──────────────────────────────────────────────────────────────── */

export interface EngagementPoint {
  date:   string;
  dau:    number;   // unique users with a session on this day
  wau:    number;   // rolling 7-day unique active users
  newReg: number;   // new user registrations on this day
}

/* ─────────────────────────────────────────────────────────────────
   3. Feature adoption
      Feeds: FeatureAdoptionChart
   ──────────────────────────────────────────────────────────────── */

export interface FeatureAdoptionItem {
  feature:  string;
  adopted:  number;   // workspace count using this feature
  total:    number;   // total workspace count (denominator)
  pct:      number;   // adopted / total × 100
  deltaWoW: number;   // WoW change in percentage points (estimated)
  fill:     string;
}

/* ─────────────────────────────────────────────────────────────────
   4. Platform subscriber growth (12 months)
      Feeds: PlatformSubscriberChart
   ──────────────────────────────────────────────────────────────── */

export interface PlatformSubscriberPoint {
  month:          string;
  newSubscribers: number;
  cumulative:     number;
  referralSubs:   number;   // joined via referral (referredById IS NOT NULL)
  directSubs:     number;   // joined directly
}

export interface PlatformSubscriberStats {
  newThisMonth:  number;
  referralPct:   number;   // % of new subs via referral
  directPct:     number;
  cumulativeTotal: number;
  momGrowthPct:  number;   // month-over-month growth %
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
   6. Referral network (12 months)
      Feeds: ReferralNetworkChart
   ──────────────────────────────────────────────────────────────── */

export interface ReferralNetworkPoint {
  month:          string;
  totalReferrals: number;
  chainReferrals: number;   // multi-hop referrals
  referrers:      number;   // unique subscribers who referred ≥1 person
  avgChainDepth:  number;
}

export interface ReferralStats {
  totalReferrals:          number;
  totalReferrers:          number;
  avgReferralsPerReferrer: number;
  topKFactor:              number;   // highest single-waitlist k-factor
  platformKFactor:         number;   // totalReferrals / totalSubscribers
  confirmedPct:            number;   // % of subscribers with isConfirmed
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
   9. Changelog publishing (12 months)
      Feeds: ChangelogChart
   ──────────────────────────────────────────────────────────────── */

export interface ChangelogPoint {
  month:     string;
  published: number;
  drafts:    number;
}

/* ─────────────────────────────────────────────────────────────────
   10. Workspace activity heatmap (day × hour)
       Feeds: WorkspaceHeatmap
   ──────────────────────────────────────────────────────────────── */

export interface HeatmapCell {
  day:   string;   // "Mon"–"Sun"
  hour:  number;   // 0–23
  value: number;   // normalised activity score 0–100
}