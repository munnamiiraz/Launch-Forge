/* ─────────────────────────────────────────────────────────────────
   All revenue-specific types for /admin/revenue
   ──────────────────────────────────────────────────────────────── */

export interface RevenueKpis {
  mrr:              number;
  arr:              number;
  mrrGrowthPct:     number;   // MoM %
  newMrrThisMonth:  number;
  churnedMrr:       number;
  expansionMrr:     number;   // upgrades
  netNewMrr:        number;   // new + expansion - churn
  ltv:              number;   // avg lifetime value
  arpu:             number;   // avg revenue per user (paid)
  payingUsers:      number;
  churnRatePct:     number;
  avgSubLengthMonths: number;
}

export interface MrrWaterfallPoint {
  month:     string;
  mrr:       number;
  newMrr:    number;
  expansion: number;
  churn:     number;
  net:       number;
}

export interface PlanRevenue {
  plan:         string;
  mode:         string;
  users:        number;
  mrr:          number;
  arr:          number;
  avgPrice:     number;
  churnPct:     number;
  fill:         string;
}

export interface RecentTransaction {
  id:          string;
  userId:      string;
  userName:    string;
  userEmail:   string;
  type:        "new" | "renewal" | "upgrade" | "downgrade" | "cancel" | "refund";
  plan:        string;
  amount:      number;
  currency:    string;
  status:      "paid" | "failed" | "refunded" | "pending";
  date:        string;
  stripeId:    string;
}

export interface CohortLtvRow {
  cohort:         string;   // "Jan 2025"
  startingUsers:  number;
  month1Mrr:      number;
  month3Mrr:      number;
  month6Mrr:      number;
  month12Mrr:     number;
  avgLtv:         number;
}

export interface ChurnDataPoint {
  month:        string;
  churned:      number;
  churnRate:    number;
  recovered:    number;
}

export interface RevenueByCountry {
  country:    string;
  flag:       string;
  users:      number;
  mrr:        number;
  pct:        number;
}

/* ── Data generators ─────────────────────────────────────────────── */

function monthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}
function fmtMonth(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}
function rng(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

export function getRevenueKpis(): RevenueKpis {
  return {
    mrr:                41_280,
    arr:                495_360,
    mrrGrowthPct:       12.4,
    newMrrThisMonth:    4_840,
    churnedMrr:         1_120,
    expansionMrr:       2_180,
    netNewMrr:          5_900,
    ltv:                284,
    arpu:               33.1,
    payingUsers:        1_247,
    churnRatePct:       2.7,
    avgSubLengthMonths: 8.6,
  };
}

export function getMrrWaterfall(): MrrWaterfallPoint[] {
  const pts: MrrWaterfallPoint[] = [];
  let mrr = 24_000;
  for (let i = 11; i >= 0; i--) {
    const newMrr    = rng(2_400, 5_200);
    const expansion = rng(800, 2_400);
    const churn     = rng(400, 1_400);
    const net       = newMrr + expansion - churn;
    mrr = Math.max(0, mrr + net);
    pts.push({ month: fmtMonth(monthsAgo(i)), mrr, newMrr, expansion, churn, net });
  }
  return pts;
}

export function getPlanRevenue(): PlanRevenue[] {
  return [
    { plan: "Pro",    mode: "Monthly", users: 612,  mrr: 11_628, arr: 139_536, avgPrice: 19, churnPct: 3.1, fill: "hsl(var(--chart-1))" },
    { plan: "Pro",    mode: "Yearly",  users: 329,  mrr: 4_935,  arr: 59_220,  avgPrice: 15, churnPct: 1.4, fill: "hsl(var(--chart-2))" },
    { plan: "Growth", mode: "Monthly", users: 218,  mrr: 10_682, arr: 128_184, avgPrice: 49, churnPct: 2.8, fill: "hsl(var(--chart-3))" },
    { plan: "Growth", mode: "Yearly",  users: 88,   mrr: 3_432,  arr: 41_184,  avgPrice: 39, churnPct: 0.9, fill: "hsl(var(--chart-4))" },
  ];
}

export function getRecentTransactions(): RecentTransaction[] {
  return [
    { id:"tx_01", userId:"u01", userName:"Sarah Kim",       userEmail:"sarah@acmecorp.io",    type:"renewal",  plan:"Growth Yearly",  amount:468,  currency:"USD", status:"paid",     date:"2025-03-19", stripeId:"pi_1Qx..." },
    { id:"tx_02", userId:"u18", userName:"Lucas Oliveira",  userEmail:"lucas@br.tech",        type:"upgrade",  plan:"Growth Yearly",  amount:468,  currency:"USD", status:"paid",     date:"2025-03-18", stripeId:"pi_1Qw..." },
    { id:"tx_03", userId:"u16", userName:"Amara Osei",      userEmail:"amara@ghana-dev.io",   type:"new",      plan:"Pro Monthly",    amount:19,   currency:"USD", status:"paid",     date:"2025-03-18", stripeId:"pi_1Qv..." },
    { id:"tx_04", userId:"u24", userName:"Tom Nguyen",      userEmail:"tom@vn.io",            type:"renewal",  plan:"Pro Yearly",     amount:180,  currency:"USD", status:"paid",     date:"2025-03-17", stripeId:"pi_1Qu..." },
    { id:"tx_05", userId:"u19", userName:"Nadia Hassan",    userEmail:"nadia@eg-ventures.io", type:"cancel",   plan:"Pro Monthly",    amount:0,    currency:"USD", status:"refunded", date:"2025-03-17", stripeId:"pi_1Qt..." },
    { id:"tx_06", userId:"u07", userName:"Anna Schmidt",    userEmail:"anna@corp.de",         type:"renewal",  plan:"Pro Monthly",    amount:19,   currency:"USD", status:"paid",     date:"2025-03-16", stripeId:"pi_1Qs..." },
    { id:"tx_07", userId:"u05", userName:"Sofia Reyes",     userEmail:"sofia@company.mx",     type:"upgrade",  plan:"Pro Yearly",     amount:180,  currency:"USD", status:"paid",     date:"2025-03-15", stripeId:"pi_1Qr..." },
    { id:"tx_08", userId:"u08", userName:"Ben Okafor",      userEmail:"ben@mail.ng",          type:"renewal",  plan:"Pro Monthly",    amount:19,   currency:"USD", status:"failed",   date:"2025-03-15", stripeId:"pi_1Qq..." },
    { id:"tx_09", userId:"u13", userName:"Yuki Tanaka",     userEmail:"yuki@jp.io",           type:"new",      plan:"Growth Monthly", amount:49,   currency:"USD", status:"paid",     date:"2025-03-14", stripeId:"pi_1Qp..." },
    { id:"tx_10", userId:"u20", userName:"Chen Wei",        userEmail:"chen@sg-tech.io",      type:"renewal",  plan:"Growth Monthly", amount:49,   currency:"USD", status:"paid",     date:"2025-03-14", stripeId:"pi_1Qo..." },
    { id:"tx_11", userId:"u03", userName:"Priya Mehta",     userEmail:"priya@startup.io",     type:"renewal",  plan:"Growth Monthly", amount:49,   currency:"USD", status:"paid",     date:"2025-03-13", stripeId:"pi_1Qn..." },
    { id:"tx_12", userId:"u11", userName:"Lena Andersen",   userEmail:"lena@nord.dk",         type:"renewal",  plan:"Pro Yearly",     amount:180,  currency:"USD", status:"paid",     date:"2025-03-12", stripeId:"pi_1Qm..." },
  ];
}

export function getChurnData(): ChurnDataPoint[] {
  const pts: ChurnDataPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const churned   = rng(12, 34);
    const recovered = rng(2, 8);
    pts.push({
      month:     fmtMonth(monthsAgo(i)),
      churned,
      churnRate: parseFloat((churned / 1200 * 100).toFixed(1)),
      recovered,
    });
  }
  return pts;
}

export function getCohortLtv(): CohortLtvRow[] {
  return [
    { cohort:"Jan '25", startingUsers:89,  month1Mrr:1_691, month3Mrr:1_424, month6Mrr:1_180, month12Mrr:980,  avgLtv:224 },
    { cohort:"Feb '25", startingUsers:104, month1Mrr:2_028, month3Mrr:1_742, month6Mrr:1_410, month12Mrr:0,    avgLtv:198 },
    { cohort:"Mar '25", startingUsers:121, month1Mrr:2_299, month3Mrr:1_980, month6Mrr:0,     month12Mrr:0,    avgLtv:176 },
    { cohort:"Apr '25", startingUsers:98,  month1Mrr:1_862, month3Mrr:1_540, month6Mrr:0,     month12Mrr:0,    avgLtv:164 },
    { cohort:"May '25", startingUsers:143, month1Mrr:2_717, month3Mrr:0,     month6Mrr:0,     month12Mrr:0,    avgLtv:189 },
    { cohort:"Jun '25", startingUsers:162, month1Mrr:3_078, month3Mrr:0,     month6Mrr:0,     month12Mrr:0,    avgLtv:190 },
  ];
}

export function getRevenueByCountry(): RevenueByCountry[] {
  return [
    { country:"United States", flag:"🇺🇸", users:412, mrr:14_820, pct:35.9 },
    { country:"Germany",       flag:"🇩🇪", users:198, mrr:6_480,  pct:15.7 },
    { country:"United Kingdom",flag:"🇬🇧", users:156, mrr:5_360,  pct:13.0 },
    { country:"India",         flag:"🇮🇳", users:134, mrr:3_920,  pct: 9.5 },
    { country:"Brazil",        flag:"🇧🇷", users:98,  mrr:2_940,  pct: 7.1 },
    { country:"Singapore",     flag:"🇸🇬", users:76,  mrr:2_480,  pct: 6.0 },
    { country:"Bangladesh",    flag:"🇧🇩", users:62,  mrr:1_860,  pct: 4.5 },
    { country:"Other",         flag:"🌍",  users:111, mrr:3_420,  pct: 8.3 },
  ];
}