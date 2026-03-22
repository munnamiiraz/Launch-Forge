import { GrowthRange } from "./admin-overview.constants";

/* ─────────────────────────────────────────────────────────────────
   Shared
   ──────────────────────────────────────────────────────────────── */

export interface AdminBasePayload {
  requestingUserId: string;
}

export interface GrowthQuery {
  range?: GrowthRange;
}

/* ─────────────────────────────────────────────────────────────────
   1. Platform KPIs
      Feeds: AdminKpiGrid (9 cards) + page header strip
   ──────────────────────────────────────────────────────────────── */

export interface AdminKpis {
  /* Users */
  totalUsers:         number;
  newUsersToday:      number;
  newUsersThisWeek:   number;
  activeUsers30d:     number;   // users with a Session in last 30 days

  /* Platform */
  totalWorkspaces:    number;
  totalWaitlists:     number;
  totalSubscribers:   number;
  totalReferrals:     number;   // sum of all subscriber.referralsCount

  /* Engagement */
  totalFeedbackItems: number;
  totalVotes:         number;

  /* Revenue */
  mrr:                number;   // sum of monthly-equivalent payment amounts
  arr:                number;   // mrr × 12

  /* Plan split */
  paidUsers:          number;
  freeUsers:          number;
  proUsers:           number;   // PRO_MONTHLY + PRO_YEARLY
  growthUsers:        number;   // GROWTH_MONTHLY + GROWTH_YEARLY
  churnedThisMonth:   number;   // payments that flipped to UNPAID this month

  /* Averages */
  avgWaitlistsPerUser:       number;
  avgSubscribersPerWaitlist: number;
}

/* ─────────────────────────────────────────────────────────────────
   2. Platform MRR trend (12 months)
      Feeds: AdminRevenueChart
   ──────────────────────────────────────────────────────────────── */

export interface RevenuePoint {
  month:    string;   // "Jan '25"
  mrr:      number;
  newMrr:   number;   // MRR from new subscribers that month
  churn:    number;   // MRR lost to cancellations
  upgrades: number;   // MRR gained from plan upgrades
}

/* ─────────────────────────────────────────────────────────────────
   3. User growth time-series
      Feeds: AdminUserGrowthChart (7d / 30d / 90d toggle)
   ──────────────────────────────────────────────────────────────── */

export interface UserGrowthPoint {
  date:  string;   // "Jan 5"
  total: number;   // cumulative registered users at this date
  paid:  number;   // cumulative paid users at this date
  free:  number;   // total - paid
}

/* ─────────────────────────────────────────────────────────────────
   4. Plan breakdown
      Feeds: AdminPlanChart (donut + table)
   ──────────────────────────────────────────────────────────────── */

export interface PlanBreakdownItem {
  name:  string;   // "Pro Monthly", "Free", etc.
  value: number;   // user count
  mrr:   number;   // monthly revenue from this segment
  fill:  string;   // chart colour token
}

/* ─────────────────────────────────────────────────────────────────
   5. Signup sources
      Feeds: AdminSignupSourcesChart (donut)
   ──────────────────────────────────────────────────────────────── */

export interface SignupSourcePoint {
  source: string;
  value:  number;
  fill:   string;
}

/* ─────────────────────────────────────────────────────────────────
   6. Recent activity feed
      Feeds: AdminActivityFeed (live event list)
   ──────────────────────────────────────────────────────────────── */

export type ActivityType =
  | "signup"
  | "upgrade"
  | "downgrade"
  | "cancel"
  | "waitlist"
  | "alert";

export interface AdminActivity {
  id:      string;
  type:    ActivityType;
  message: string;
  user:    string;    // masked name e.g. "Sarah K."
  email:   string;
  time:    string;    // relative: "2m ago"
}

/* ─────────────────────────────────────────────────────────────────
   7. System health
      Feeds: AdminSystemHealth
   ──────────────────────────────────────────────────────────────── */

export type ServiceStatus = "operational" | "degraded" | "down";

export interface SystemHealth {
  api:        ServiceStatus;
  database:   ServiceStatus;
  stripe:     ServiceStatus;
  email:      ServiceStatus;
  uptime:     number;   // % over last 30 days
  p99Latency: number;   // ms
}

/* ─────────────────────────────────────────────────────────────────
   8. Top waitlists
      Feeds: AdminTopWaitlists (ranked list)
   ──────────────────────────────────────────────────────────────── */

export interface TopWaitlist {
  id:          string;
  name:        string;
  ownerName:   string;
  ownerEmail:  string;
  subscribers: number;
  referrals:   number;
  viralScore:  number;
  isOpen:      boolean;
}

/* ─────────────────────────────────────────────────────────────────
   9. Recent users (mini user table)
      Feeds: AdminUsersTable (last 10 signups)
   ──────────────────────────────────────────────────────────────── */

export interface AdminRecentUser {
  id:           string;
  name:         string;
  email:        string;
  role:         "USER" | "ADMIN";
  status:       "ACTIVE" | "SUSPENDED" | "INACTIVE";
  plan:         "FREE" | "PRO" | "GROWTH";
  planMode:     "MONTHLY" | "YEARLY" | null;
  waitlists:    number;
  subscribers:  number;
  createdAt:    string;   // ISO
  lastActiveAt: string | null;
  isDeleted:    boolean;
}