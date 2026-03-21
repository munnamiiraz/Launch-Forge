/* ─────────────────────────────────────────────────────────────────
   All types + data generators for /admin/analytics
   Derived from: User, Workspace, Waitlist, Subscriber, FeedbackBoard,
   FeatureRequest, Vote, Comment, Roadmap, RoadmapItem, Changelog
   ──────────────────────────────────────────────────────────────── */

/* ── Platform engagement ─────────────────────────────────────────── */
export interface EngagementPoint {
  date:   string;
  dau:    number;   // daily active users (Session activity)
  wau:    number;   // weekly active users
  mau:    number;   // monthly active users
  newReg: number;   // new registrations
}

export interface EngagementStats {
  dauToday:   number;
  wauThisWeek: number;
  mauThisMonth: number;
  dauOverMau:  number;   // stickiness ratio %
  avgSessionsPerUser: number;
  avgSessionLengthMin: number;
}

/* ── Feature adoption ────────────────────────────────────────────── */
export interface FeatureAdoptionItem {
  feature:      string;
  adopted:      number;   // workspaces using this feature
  total:        number;   // total workspaces
  pct:          number;
  deltaWoW:     number;   // week-over-week change in %
  fill:         string;
}

/* ── Platform subscriber growth ──────────────────────────────────── */
export interface PlatformSubscriberPoint {
  month:         string;
  newSubscribers: number;
  cumulative:    number;
  referralSubs:  number;   // joined via referral link
  directSubs:    number;   // direct join
}

/* ── Waitlist health distribution ───────────────────────────────── */
export interface WaitlistHealthBucket {
  bucket:  string;   // "0–100", "100–500", etc.
  count:   number;   // number of waitlists in this bucket
  fill:    string;
}

export interface WaitlistHealthStats {
  total:       number;
  open:        number;
  closed:      number;
  avgSubs:     number;
  medianSubs:  number;
  p90Subs:     number;
  totalSubs:   number;
}

/* ── Referral network ────────────────────────────────────────────── */
export interface ReferralNetworkPoint {
  month:          string;
  totalReferrals: number;
  chainReferrals: number;   // 2+ hops
  referrers:      number;   // unique users who referred ≥1 person
  avgChainDepth:  number;
}

export interface ReferralStats {
  totalReferrals:    number;
  totalReferrers:    number;
  avgReferralsPerReferrer: number;
  topKFactor:        number;
  platformKFactor:   number;   // total referrals / total subscribers
  confirmedPct:      number;   // % of subscribers who confirmed email
}

/* ── Feedback health ────────────────────────────────────────────── */
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
  totalBoards:   number;
  totalRequests: number;
  totalVotes:    number;
  totalComments: number;
  avgVotesPerRequest: number;
  completedPct:  number;
  underReviewPct: number;
}

/* ── Roadmap progress ────────────────────────────────────────────── */
export interface RoadmapProgressItem {
  status:   string;
  count:    number;
  pct:      number;
  fill:     string;
}

export interface RoadmapStats {
  totalRoadmaps: number;
  totalItems:    number;
  completedPct:  number;
  inProgressPct: number;
  plannedPct:    number;
}

/* ── Changelog publishing ────────────────────────────────────────── */
export interface ChangelogPoint {
  month:     string;
  published: number;
  drafts:    number;
}

/* ── Workspace activity heatmap ──────────────────────────────────── */
export interface HeatmapCell {
  day:   string;    // "Mon"
  hour:  number;    // 0–23
  value: number;    // activity score 0–100
}

/* ═══════════════════════════════════════════════════════════════════
   DATA GENERATORS
   Replace each function with a real Prisma aggregation query
   ═══════════════════════════════════════════════════════════════════ */

function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d;
}
function monthsAgo(n: number) {
  const d = new Date(); d.setMonth(d.getMonth() - n); return d;
}
function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtMonth(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}
function rng(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ── Engagement ──────────────────────────────────────────────────── */
export function getEngagementStats(): EngagementStats {
  return {
    dauToday:            847,
    wauThisWeek:       2_940,
    mauThisMonth:      3_812,
    dauOverMau:         22.2,   // stickiness
    avgSessionsPerUser:  3.4,
    avgSessionLengthMin: 8.7,
  };
}

export function getEngagementTimeline(days = 60): EngagementPoint[] {
  const pts: EngagementPoint[] = [];
  let mau = 3_200;
  for (let i = days; i >= 0; i--) {
    const d = daysAgo(i);
    const isWeekend = [0, 6].includes(d.getDay());
    const dau    = rng(isWeekend ? 480 : 700, isWeekend ? 760 : 980);
    const wau    = rng(2_400, 3_100);
    const newReg = rng(8, 28);
    mau = Math.max(2_800, mau + rng(-20, 60));
    pts.push({ date: fmtDate(d), dau, wau, mau, newReg });
  }
  return pts;
}

/* ── Feature adoption ────────────────────────────────────────────── */
export function getFeatureAdoption(): FeatureAdoptionItem[] {
  const total = 3_944;   // total workspaces
  return [
    { feature: "Waitlists",        adopted: 3_944, total, pct: 100,  deltaWoW:  0,   fill: "hsl(var(--chart-1))" },
    { feature: "Referral tracking",adopted: 3_820, total, pct: 96.9, deltaWoW: +0.3, fill: "hsl(var(--chart-2))" },
    { feature: "Public leaderboard",adopted:3_401, total, pct: 86.2, deltaWoW: +1.1, fill: "hsl(var(--chart-3))" },
    { feature: "Feedback board",   adopted: 2_180, total, pct: 55.3, deltaWoW: +2.4, fill: "hsl(var(--chart-4))" },
    { feature: "Roadmap",          adopted: 1_842, total, pct: 46.7, deltaWoW: +1.8, fill: "hsl(var(--chart-5))" },
    { feature: "Prizes",           adopted: 1_204, total, pct: 30.5, deltaWoW: +4.2, fill: "hsl(var(--chart-1))" },
    { feature: "Changelog",        adopted:   980, total, pct: 24.8, deltaWoW: +0.9, fill: "hsl(var(--chart-2))" },
    { feature: "Analytics",        adopted:   730, total, pct: 18.5, deltaWoW: +1.5, fill: "hsl(var(--chart-3))" },
    { feature: "API access",       adopted:   312, total, pct:  7.9, deltaWoW: +0.8, fill: "hsl(var(--chart-4))" },
    { feature: "Custom domain",    adopted:   186, total, pct:  4.7, deltaWoW: +0.4, fill: "hsl(var(--chart-5))" },
  ];
}

/* ── Platform subscriber growth ──────────────────────────────────── */
export function getPlatformSubscriberGrowth(): PlatformSubscriberPoint[] {
  const pts: PlatformSubscriberPoint[] = [];
  let cumulative = 840_000;
  for (let i = 11; i >= 0; i--) {
    const newSubs    = rng(28_000, 72_000);
    const referralSubs = Math.floor(newSubs * (0.28 + Math.random() * 0.14));
    cumulative += newSubs;
    pts.push({
      month:          fmtMonth(monthsAgo(i)),
      newSubscribers: newSubs,
      cumulative,
      referralSubs,
      directSubs:     newSubs - referralSubs,
    });
  }
  return pts;
}

/* ── Waitlist health ─────────────────────────────────────────────── */
export function getWaitlistHealthBuckets(): WaitlistHealthBucket[] {
  return [
    { bucket: "0–50",       count: 1_820, fill: "hsl(var(--chart-5))" },
    { bucket: "51–200",     count: 2_940, fill: "hsl(var(--chart-4))" },
    { bucket: "201–500",    count: 1_640, fill: "hsl(var(--chart-3))" },
    { bucket: "501–2k",     count:   980, fill: "hsl(var(--chart-2))" },
    { bucket: "2k–10k",     count:   280, fill: "hsl(var(--chart-1))" },
    { bucket: "10k+",       count:   102, fill: "hsl(260 80% 65%)"    },
  ];
}

export function getWaitlistHealthStats(): WaitlistHealthStats {
  return {
    total:       8_762,
    open:        6_481,
    closed:      2_281,
    avgSubs:     141,
    medianSubs:  87,
    p90Subs:     1_240,
    totalSubs:   1_240_000,
  };
}

/* ── Referral network ────────────────────────────────────────────── */
export function getReferralNetworkTimeline(): ReferralNetworkPoint[] {
  const pts: ReferralNetworkPoint[] = [];
  let cumRefs = 280_000;
  for (let i = 11; i >= 0; i--) {
    const total  = rng(22_000, 48_000);
    const chain  = Math.floor(total * (0.18 + Math.random() * 0.12));
    cumRefs += total;
    pts.push({
      month:          fmtMonth(monthsAgo(i)),
      totalReferrals: total,
      chainReferrals: chain,
      referrers:      rng(8_000, 18_000),
      avgChainDepth:  parseFloat((1.4 + Math.random() * 0.8).toFixed(2)),
    });
  }
  return pts;
}

export function getReferralStats(): ReferralStats {
  return {
    totalReferrals:          348_000,
    totalReferrers:          94_200,
    avgReferralsPerReferrer: 3.7,
    topKFactor:              3.2,
    platformKFactor:         0.28,
    confirmedPct:            71.4,
  };
}

/* ── Feedback health ─────────────────────────────────────────────── */
export function getFeedbackStatusBreakdown(): FeedbackStatusBreakdown[] {
  const total = 12_450;
  return [
    { status: "Under review", count: 4_980, pct: 40.0, fill: "hsl(var(--chart-5))" },
    { status: "Planned",      count: 2_862, pct: 23.0, fill: "hsl(var(--chart-1))" },
    { status: "In progress",  count: 1_868, pct: 15.0, fill: "hsl(var(--chart-3))" },
    { status: "Completed",    count: 1_992, pct: 16.0, fill: "hsl(var(--chart-2))" },
    { status: "Declined",     count:   748, pct:  6.0, fill: "hsl(var(--chart-4))" },
  ];
}

export function getFeedbackTimeline(): FeedbackCategoryPoint[] {
  const pts: FeedbackCategoryPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    pts.push({
      date:     fmtDate(daysAgo(i)),
      requests: rng(30, 120),
      votes:    rng(200, 900),
      comments: rng(20, 80),
    });
  }
  return pts;
}

export function getFeedbackStats(): FeedbackStats {
  return {
    totalBoards:         2_180,
    totalRequests:      12_450,
    totalVotes:         89_320,
    totalComments:      24_610,
    avgVotesPerRequest:  7.2,
    completedPct:       16.0,
    underReviewPct:     40.0,
  };
}

/* ── Roadmap ─────────────────────────────────────────────────────── */
export function getRoadmapProgress(): RoadmapProgressItem[] {
  return [
    { status: "Planned",     count: 14_820, pct: 58.2, fill: "hsl(var(--chart-5))" },
    { status: "In Progress", count:  6_240, pct: 24.5, fill: "hsl(var(--chart-3))" },
    { status: "Completed",   count:  4_400, pct: 17.3, fill: "hsl(var(--chart-2))" },
  ];
}

export function getRoadmapStats(): RoadmapStats {
  return {
    totalRoadmaps: 1_842,
    totalItems:   25_460,
    completedPct:  17.3,
    inProgressPct: 24.5,
    plannedPct:    58.2,
  };
}

/* ── Changelog ───────────────────────────────────────────────────── */
export function getChangelogTimeline(): ChangelogPoint[] {
  const pts: ChangelogPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    pts.push({
      month:     fmtMonth(monthsAgo(i)),
      published: rng(40, 180),
      drafts:    rng(10, 60),
    });
  }
  return pts;
}

/* ── Workspace activity heatmap (day × hour) ─────────────────────── */
export function getWorkspaceHeatmap(): HeatmapCell[] {
  const days  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cells: HeatmapCell[] = [];
  for (const day of days) {
    const isWeekend = day === "Sat" || day === "Sun";
    for (let hour = 0; hour < 24; hour++) {
      const isPeak = hour >= 9 && hour <= 18 && !isWeekend;
      const isEvening = hour >= 19 && hour <= 22;
      const base  = isPeak ? rng(55, 95) : isEvening ? rng(30, 65) : rng(2, 25);
      cells.push({ day, hour, value: isWeekend ? Math.floor(base * 0.45) : base });
    }
  }
  return cells;
}