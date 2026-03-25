/* ─────────────────────────────────────────────────────────────────
   Platform-level stats — derived from all models in aggregate
   ──────────────────────────────────────────────────────────────── */

export interface AdminKpis {
  totalUsers:         number;
  newUsersToday:      number;
  newUsersThisWeek:   number;
  activeUsers30d:     number;
  totalWorkspaces:    number;
  totalWaitlists:     number;
  totalSubscribers:   number;
  totalReferrals:     number;
  totalFeedbackItems: number;
  totalVotes:         number;
  mrr:                number;
  arr:                number;
  paidUsers:          number;
  freeUsers:          number;
  proUsers:           number;
  growthUsers:        number;
  churnedThisMonth:   number;
  avgWaitlistsPerUser: number;
  avgSubscribersPerWaitlist: number;
}

/* ── User record (Admin view) ────────────────────────────────────── */
export interface AdminUser {
  id:           string;
  name:         string;
  email:        string;
  image:        string | null;
  role:         "USER" | "ADMIN" | "OWNER";
  status:       "ACTIVE" | "SUSPENDED" | "DELETED" | "INACTIVE";
  plan:         "FREE" | "PRO" | "GROWTH";
  planMode:     "MONTHLY" | "YEARLY" | null;
  waitlists:    number;
  subscribers:  number;
  createdAt:    string;
  lastActiveAt: string | null;
  isDeleted:    boolean;
}

/* ── Revenue data ────────────────────────────────────────────────── */
export interface RevenuePoint {
  month:   string;
  mrr:     number;
  newMrr:  number;
  churn:   number;
  upgrades: number;
}

/* ── User growth ─────────────────────────────────────────────────── */
export interface UserGrowthPoint {
  date:    string;
  total:   number;
  paid:    number;
  free:    number;
}

/* ── Signup source ───────────────────────────────────────────────── */
export interface SignupSourcePoint {
  source: string;
  value:  number;
  fill:   string;
}

/* ── Plan breakdown ──────────────────────────────────────────────── */
export interface PlanBreakdownItem {
  name:    string;
  value:   number;
  mrr:     number;
  fill:    string;
}

/* ── Recent activity (system log) ───────────────────────────────── */
export interface AdminActivity {
  id:        string;
  type:      "signup" | "upgrade" | "downgrade" | "cancel" | "waitlist" | "alert";
  message:   string;
  user:      string;
  email:     string;
  time:      string;
}

/* ── System health ───────────────────────────────────────────────── */
export interface SystemHealth {
  api:       "operational" | "degraded" | "down";
  database:  "operational" | "degraded" | "down";
  stripe:    "operational" | "degraded" | "down";
  email:     "operational" | "degraded" | "down";
  uptime:    number;    // %
  p99Latency: number;  // ms
}

/* ── Top waitlists across all workspaces ─────────────────────────── */
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