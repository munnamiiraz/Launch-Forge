import { TimeRange } from "./owner-analytics.constants";

/* ─────────────────────────────────────────────────────────────────
   Shared query / payload types
   ──────────────────────────────────────────────────────────────── */

export interface AnalyticsQuery {
  range?: TimeRange;
  /** Optionally scope to a single waitlist */
  waitlistId?: string;
}

export interface AnalyticsPayload {
  workspaceId:      string;
  requestingUserId: string;
  query:            AnalyticsQuery;
}

/* ─────────────────────────────────────────────────────────────────
   1. KPI Summary
   ──────────────────────────────────────────────────────────────── */

export interface AnalyticsSummary {
  totalSubscribers:   number;
  totalWaitlists:     number;
  totalReferrals:     number;
  avgViralScore:      number;   // avg referralsCount / subscribers across waitlists
  confirmationRate:   number;   // % isConfirmed
  totalRevenueMrr:    number;   // sum of current Payment.amount for this workspace owner
  activeReferrers:    number;   // subscribers with referralsCount > 0
  feedbackItems:      number;   // total FeatureRequest count

  /* Delta vs prior period (same range, shifted back) */
  delta: {
    subscribers:    number;   // absolute change
    referrals:      number;
    weekOverWeekGrowth: number; // % growth
    feedbackItems:  number;
  };

  bestKFactor: number;        // highest single-waitlist viralScore
}

/* ─────────────────────────────────────────────────────────────────
   2. Subscriber growth time-series
   ──────────────────────────────────────────────────────────────── */

export interface SubscriberGrowthPoint {
  date:        string;   // "Jan 1"
  subscribers: number;   // new signups that day/week/month
  cumulative:  number;   // running total
  referrals:   number;   // new via referral (referredById IS NOT NULL)
}

/* ── Confirmation rate over time ─────────────────────────────────── */
export interface ConfirmationRatePoint {
  date:        string;
  confirmed:   number;
  unconfirmed: number;
  rate:        number;   // % confirmed
}

/* ─────────────────────────────────────────────────────────────────
   3. Referral funnel
   ──────────────────────────────────────────────────────────────── */

export interface ReferralFunnelItem {
  label: string;
  value: number;
  pct:   number;   // % of totalSubscribers
}

export interface SignupSourceItem {
  source: string;
  value:  number;
  fill:   string;
}

export interface ReferralFunnelResult {
  funnel:  ReferralFunnelItem[];
  sources: SignupSourceItem[];
}

/* ─────────────────────────────────────────────────────────────────
   4. Viral k-factor weekly
   ──────────────────────────────────────────────────────────────── */

export interface ViralKFactorPoint {
  week:    string;   // "W1", "W2" …
  kFactor: number;   // referrals generated that week / new subscribers that week
  invites: number;   // total referrals issued (new subscribers via ref that week)
}

/* ─────────────────────────────────────────────────────────────────
   5. Top referrers
   ──────────────────────────────────────────────────────────────── */

export interface TopReferrerBar {
  name:     string;
  direct:   number;   // subscriber.referralsCount
  chain:    number;   // downstream count (depth ≤ 4)
  waitlist: string;   // waitlist.name
}

/* ─────────────────────────────────────────────────────────────────
   6. Waitlist comparison
   ──────────────────────────────────────────────────────────────── */

export interface WaitlistComparisonItem {
  id:          string;
  name:        string;
  subscribers: number;
  referrals:   number;
  confirmed:   number;
  confirmRate: number;   // % confirmed
  viralScore:  number;
  isOpen:      boolean;
}

/* ─────────────────────────────────────────────────────────────────
   7. Cohort retention heatmap
   ──────────────────────────────────────────────────────────────── */

export interface CohortRow {
  cohort: string;    // "Jan W1"
  size:   number;    // subscribers who joined in that cohort window
  weeks:  number[];  // retention % at W0(100), W1, W2 … W6
                     // retention = % who are isConfirmed (proxy for engagement)
}

/* ─────────────────────────────────────────────────────────────────
   8. Revenue + plan distribution
   ──────────────────────────────────────────────────────────────── */

export interface RevenueTrendPoint {
  month: string;   // "Jan '25"
  mrr:   number;
  new:   number;   // new MRR that month
  churn: number;   // churned MRR (Payment status UNPAID)
}

export interface PlanDistributionItem {
  name:  string;   // "Free" | "Pro Monthly" | "Pro Yearly" | "Growth Monthly" | "Growth Yearly"
  value: number;
  fill:  string;
}

export interface RevenueResult {
  trend:        RevenueTrendPoint[];
  distribution: PlanDistributionItem[];
  currentMrr:   number;
  paidPct:      number;
}

/* ─────────────────────────────────────────────────────────────────
   9. Feedback activity
   ──────────────────────────────────────────────────────────────── */

export interface FeedbackActivityPoint {
  date:     string;
  requests: number;
  votes:    number;
}
