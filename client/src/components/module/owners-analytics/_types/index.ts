/* ─────────────────────────────────────────────────────────────────
   All analytics data shapes derived from the Prisma schema.
   Replace the mock generators with real DB aggregation queries.
   ──────────────────────────────────────────────────────────────── */

/* ── Time range selector ─────────────────────────────────────────── */
export type TimeRange = "7d" | "30d" | "90d" | "12m";

/* ── Subscriber growth (Subscriber.createdAt daily) ─────────────── */
export interface SubscriberGrowthPoint {
  date:        string;  // "Jan 1"
  subscribers: number;  // new signups that day
  cumulative:  number;  // running total
  referrals:   number;  // new via referral that day
}

/* ── Referral funnel (Subscriber aggregate) ─────────────────────── */
export interface ReferralFunnelItem {
  label:   string;
  value:   number;
  pct:     number;   // % of total subscribers
  color:   string;
}

/* ── Viral k-factor (referralsCount / totalSubscribers by week) ─── */
export interface ViralKFactorPoint {
  week:    string;
  kFactor: number;
  invites: number;
}

/* ── Waitlist comparison (per-waitlist aggregates) ──────────────── */
export interface WaitlistComparisonItem {
  name:        string;
  subscribers: number;
  referrals:   number;
  confirmed:   number;
  viralScore:  number;
}

/* ── Confirmation rate over time ─────────────────────────────────── */
export interface ConfirmationRatePoint {
  date:            string;
  confirmed:       number;
  unconfirmed:     number;
  rate:            number;
}

/* ── Top referrers bar chart ─────────────────────────────────────── */
export interface TopReferrerBar {
  name:     string;
  direct:   number;
  chain:    number;
  waitlist: string;
}

/* ── Subscriber cohort retention heatmap (weekly cohorts) ────────── */
export interface CohortRow {
  cohort:  string;   // "Week of Jan 1"
  size:    number;
  weeks:   number[]; // retention % at each subsequent week
}

/* ── Plan distribution (Payment.planType × Payment.planMode) ─────── */
export interface PlanDistributionItem {
  name:  string;
  value: number;
  fill:  string;
}

/* ── Revenue trend (Payment aggregates) ─────────────────────────── */
export interface RevenueTrendPoint {
  month: string;
  mrr:   number;
  new:   number;
  churn: number;
}

/* ── Feedback activity (FeatureRequest + Vote aggregates) ─────────── */
export interface FeedbackActivityPoint {
  date:     string;
  requests: number;
  votes:    number;
}

/* ── Signup source breakdown (referredById null vs not) ──────────── */
export interface SignupSourceItem {
  source: string;
  value:  number;
  fill:   string;
}

/* ── Aggregate summary numbers ───────────────────────────────────── */
export interface AnalyticsSummary {
  totalSubscribers:    number;
  totalWaitlists:      number;
  totalReferrals:      number;
  avgViralScore:       number;
  confirmationRate:    number;
  totalRevenueMrr:     number;
  activeReferrers:     number;
  feedbackItems:       number;
  weekOverWeekGrowth:  number;
  bestKFactor:         number;
}