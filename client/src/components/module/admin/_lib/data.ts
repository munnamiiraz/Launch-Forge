import type {
  AdminKpis, AdminUser, RevenuePoint, UserGrowthPoint,
  SignupSourcePoint, PlanBreakdownItem, AdminActivity,
  SystemHealth, TopWaitlist,
} from "../_types";

/* ── Helpers ─────────────────────────────────────────────────────── */
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function monthsAgo(n: number) { const d = new Date(); d.setMonth(d.getMonth() - n); return d; }
function fmtMonth(d: Date) { return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }); }
function fmtDate(d: Date) { return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function rng(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }

/* ── KPIs ────────────────────────────────────────────────────────── */
export function getAdminKpis(): AdminKpis {
  return {
    totalUsers:              4_821,
    newUsersToday:           47,
    newUsersThisWeek:        312,
    activeUsers30d:          2_190,
    totalWorkspaces:         3_944,
    totalWaitlists:          8_762,
    totalSubscribers:        1_240_000,
    totalReferrals:          348_000,
    totalFeedbackItems:      12_450,
    totalVotes:              89_320,
    mrr:                     41_280,
    arr:                     495_360,
    paidUsers:               1_247,
    freeUsers:               3_574,
    proUsers:                941,
    growthUsers:             306,
    churnedThisMonth:        23,
    avgWaitlistsPerUser:     1.8,
    avgSubscribersPerWaitlist: 141,
  };
}

/* ── Revenue trend ───────────────────────────────────────────────── */
export function getRevenueTrend(): RevenuePoint[] {
  const pts: RevenuePoint[] = [];
  let mrr = 24_000;
  for (let i = 11; i >= 0; i--) {
    const newMrr   = rng(1_800, 4_400);
    const churn    = rng(200,   900);
    const upgrades = rng(300,   1_200);
    mrr = Math.max(0, mrr + newMrr - churn + upgrades);
    pts.push({ month: fmtMonth(monthsAgo(i)), mrr, newMrr, churn, upgrades });
  }
  return pts;
}

/* ── User growth ─────────────────────────────────────────────────── */
export function getUserGrowth(days = 30): UserGrowthPoint[] {
  const pts: UserGrowthPoint[] = [];
  let total = 3_800; let paid = 900;
  for (let i = days; i >= 0; i--) {
    const newU    = rng(8, 24);
    const newPaid = rng(0, 4);
    total += newU;
    paid  += newPaid;
    pts.push({ date: fmtDate(daysAgo(i)), total, paid, free: total - paid });
  }
  return pts;
}

/* ── Plan breakdown ──────────────────────────────────────────────── */
export function getPlanBreakdown(): PlanBreakdownItem[] {
  return [
    { name: "Free",           value: 3_574, mrr: 0,       fill: "hsl(var(--chart-5))" },
    { name: "Pro Monthly",    value: 612,   mrr: 11_628,  fill: "hsl(var(--chart-1))" },
    { name: "Pro Yearly",     value: 329,   mrr: 4_935,   fill: "hsl(var(--chart-2))" },
    { name: "Growth Monthly", value: 218,   mrr: 10_682,  fill: "hsl(var(--chart-3))" },
    { name: "Growth Yearly",  value: 88,    mrr: 3_432,   fill: "hsl(var(--chart-4))" },
  ];
}

/* ── Signup sources ──────────────────────────────────────────────── */
export function getSignupSources(): SignupSourcePoint[] {
  return [
    { source: "Organic search",    value: 1_840, fill: "hsl(var(--chart-1))" },
    { source: "Direct",            value: 1_120, fill: "hsl(var(--chart-2))" },
    { source: "Product Hunt",      value: 621,   fill: "hsl(var(--chart-3))" },
    { source: "Twitter/X",         value: 480,   fill: "hsl(var(--chart-4))" },
    { source: "Referral program",  value: 390,   fill: "hsl(var(--chart-5))" },
    { source: "Other",             value: 370,   fill: "hsl(240 4% 30%)"     },
  ];
}

/* ── Recent activity ─────────────────────────────────────────────── */
export function getRecentActivity(): AdminActivity[] {
  return [
    { id:"a1", type:"upgrade",   message:"Upgraded to Growth Yearly",   user:"Sarah K.",     email:"sarah@acmecorp.io",  time:"2m ago"  },
    { id:"a2", type:"signup",    message:"New user registered",          user:"Ryo Tanaka",   email:"ryo@example.com",   time:"5m ago"  },
    { id:"a3", type:"waitlist",  message:"Created waitlist — 'App v2'",  user:"Priya Mehta",  email:"priya@startup.io",  time:"11m ago" },
    { id:"a4", type:"cancel",    message:"Cancelled Pro subscription",   user:"James W.",     email:"james@dev.com",     time:"23m ago" },
    { id:"a5", type:"upgrade",   message:"Upgraded Free → Pro Monthly",  user:"Anna Schmidt", email:"anna@corp.de",      time:"34m ago" },
    { id:"a6", type:"signup",    message:"New user registered",          user:"Omar F.",      email:"omar@venture.ae",   time:"52m ago" },
    { id:"a7", type:"alert",     message:"Payment failed — retrying",    user:"Ben Okafor",   email:"ben@mail.ng",       time:"1h ago"  },
    { id:"a8", type:"downgrade", message:"Downgraded Growth → Pro",      user:"Clara M.",     email:"clara@de.com",      time:"2h ago"  },
  ];
}

/* ── System health ───────────────────────────────────────────────── */
export function getSystemHealth(): SystemHealth {
  return {
    api:       "operational",
    database:  "operational",
    stripe:    "operational",
    email:     "degraded",
    uptime:    99.94,
    p99Latency: 142,
  };
}

/* ── Top waitlists ───────────────────────────────────────────────── */
export function getTopWaitlists(): TopWaitlist[] {
  return [
    { id:"wl_1", name:"Product Alpha",     ownerName:"Sarah K.",   ownerEmail:"sarah@acmecorp.io", subscribers:12_430, referrals:3_120, viralScore:3.2, isOpen:true  },
    { id:"wl_2", name:"AI Writing Tool",   ownerName:"Priya M.",   ownerEmail:"priya@startup.io",  subscribers:9_810,  referrals:2_450, viralScore:2.9, isOpen:true  },
    { id:"wl_3", name:"Mobile App Launch", ownerName:"Ryo T.",     ownerEmail:"ryo@example.com",   subscribers:7_660,  referrals:1_980, viralScore:2.7, isOpen:false },
    { id:"wl_4", name:"SaaS Beta Access",  ownerName:"Anna S.",    ownerEmail:"anna@corp.de",      subscribers:5_320,  referrals:1_540, viralScore:2.4, isOpen:true  },
    { id:"wl_5", name:"Game Pre-launch",   ownerName:"Omar F.",    ownerEmail:"omar@venture.ae",   subscribers:4_100,  referrals:1_230, viralScore:2.1, isOpen:true  },
  ];
}

/* ── Recent users ────────────────────────────────────────────────── */
export function getRecentUsers(): AdminUser[] {
  const users: AdminUser[] = [
    { id:"u1", name:"Sarah Kim",      email:"sarah@acmecorp.io",  role:"USER",  status:"ACTIVE",    plan:"GROWTH", planMode:"YEARLY",   waitlists:4, subscribers:12430, createdAt:"2025-01-10", lastActiveAt:"2025-03-18", isDeleted:false },
    { id:"u2", name:"Marcus Torres",  email:"marcus@example.com", role:"USER",  status:"ACTIVE",    plan:"PRO",    planMode:"MONTHLY",  waitlists:2, subscribers:3200,  createdAt:"2025-01-22", lastActiveAt:"2025-03-17", isDeleted:false },
    { id:"u3", name:"Priya Mehta",    email:"priya@startup.io",   role:"USER",  status:"ACTIVE",    plan:"GROWTH", planMode:"MONTHLY",  waitlists:6, subscribers:9810,  createdAt:"2025-02-01", lastActiveAt:"2025-03-18", isDeleted:false },
    { id:"u4", name:"James Lee",      email:"james@dev.com",      role:"USER",  status:"SUSPENDED", plan:"FREE",   planMode:null,       waitlists:1, subscribers:180,   createdAt:"2025-02-14", lastActiveAt:"2025-03-10", isDeleted:false },
    { id:"u5", name:"Sofia Reyes",    email:"sofia@company.mx",   role:"USER",  status:"ACTIVE",    plan:"PRO",    planMode:"YEARLY",   waitlists:3, subscribers:5410,  createdAt:"2025-02-20", lastActiveAt:"2025-03-16", isDeleted:false },
    { id:"u6", name:"Ryo Tanaka",     email:"ryo@example.com",    role:"USER",  status:"ACTIVE",    plan:"FREE",   planMode:null,       waitlists:1, subscribers:7660,  createdAt:"2025-03-01", lastActiveAt:"2025-03-18", isDeleted:false },
    { id:"u7", name:"Anna Schmidt",   email:"anna@corp.de",       role:"USER",  status:"ACTIVE",    plan:"PRO",    planMode:"MONTHLY",  waitlists:2, subscribers:5320,  createdAt:"2025-03-05", lastActiveAt:"2025-03-15", isDeleted:false },
    { id:"u8", name:"Ben Okafor",     email:"ben@mail.ng",        role:"USER",  status:"ACTIVE",    plan:"PRO",    planMode:"MONTHLY",  waitlists:1, subscribers:890,   createdAt:"2025-03-10", lastActiveAt:"2025-03-12", isDeleted:false },
  ];
  return users;
}