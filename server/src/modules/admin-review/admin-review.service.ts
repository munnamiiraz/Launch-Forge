import status    from "http-status";
import { prisma } from "../../lib/prisma";
import AppError   from "../../errorHelpers/AppError";

import {
  AdminRevenueBasePayload,
  GetTransactionsPayload,
  RevenueKpis,
  MrrWaterfallPoint,
  PlanRevenue,
  ChurnDataPoint,
  CohortLtvRow,
  RevenueByCountry,
  PaginatedTransactions,
  RecentTransaction,
} from "./admin-review.interface";

import {
  ADMIN_REVENUE_MESSAGES,
  PLAN_MRR, PLAN_ARR, PLAN_LABELS,
  REVENUE_MONTHS, COHORT_MONTHS,
  LTV_CHURN_DIVISOR,
} from "./admin-review.constants";

import {
  monthsAgo, startOfThisMonth, endOfMonth, fmtMonth, fmtCohortLabel,
  normaliseTxPagination, buildTxMeta,
  planKey, planLabel, paymentMrr,
  round1, round2,
  deriveTransactionType, deriveTransactionStatus,
} from "./admin-review.utils";
import { withCache } from "../../lib/redis";

/* ── Admin guard ─────────────────────────────────────────────────── */

async function assertAdmin(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where:  { id: userId, isDeleted: false },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") {
    throw new AppError(status.FORBIDDEN, ADMIN_REVENUE_MESSAGES.FORBIDDEN);
  }
}

/* ──────────────────────────────────────────────────────────────
   Raw implementation methods
   ────────────────────────────────────────────────────────────── */

async function getKpisRaw(payload: AdminRevenueBasePayload): Promise<RevenueKpis> {
  await assertAdmin(payload.requestingUserId);
  const monthStart = startOfThisMonth();
  const [allPaid, newThisMonth, churnedThisMonth, prevMonthPaid] = await prisma.$transaction([
    prisma.payment.findMany({ where: { status: "PAID" }, select: { planType: true, planMode: true, createdAt: true, userId: true } }),
    prisma.payment.findMany({ where: { status: "PAID", createdAt: { gte: monthStart } }, select: { planType: true, planMode: true } }),
    prisma.payment.findMany({ where: { status: "UNPAID", updatedAt: { gte: monthStart } }, select: { planType: true, planMode: true } }),
    prisma.payment.findMany({ where: { status: "PAID", createdAt: { lt: monthStart } }, select: { planType: true, planMode: true } }),
  ]);

  const mrr = allPaid.reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
  const prevMrr = prevMonthPaid.reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
  const newMrrThisMonth = newThisMonth.reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
  const churnedMrr = churnedThisMonth.reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
  const expansionMrr = newThisMonth.filter((p) => p.planType === "GROWTH").reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
  const netNewMrr = newMrrThisMonth + expansionMrr - churnedMrr;
  const payingUsers = allPaid.length;
  const arpu = payingUsers > 0 ? round2(mrr / payingUsers) : 0;
  const mrrGrowthPct = prevMrr > 0 ? round1(((mrr - prevMrr) / prevMrr) * 100) : 0;
  const churnRatePct = payingUsers > 0 ? round1((churnedThisMonth.length / payingUsers) * 100) : 0;
  const churnDecimal = churnRatePct / 100 || LTV_CHURN_DIVISOR;

  return {
    mrr, arr: mrr * 12, mrrGrowthPct, newMrrThisMonth, churnedMrr, expansionMrr, netNewMrr,
    ltv: Math.round(arpu / churnDecimal), arpu, payingUsers, churnRatePct, avgSubLengthMonths: round1(1 / churnDecimal),
  };
}

async function getMrrWaterfallRaw(payload: AdminRevenueBasePayload): Promise<MrrWaterfallPoint[]> {
  await assertAdmin(payload.requestingUserId);
  const [allPaid, allChurned] = await prisma.$transaction([
    prisma.payment.findMany({ where: { status: "PAID" }, select: { planType: true, planMode: true, createdAt: true } }),
    prisma.payment.findMany({ where: { status: "UNPAID" }, select: { planType: true, planMode: true, updatedAt: true } }),
  ]);
  const result: MrrWaterfallPoint[] = [];
  for (let i = REVENUE_MONTHS - 1; i >= 0; i--) {
    const mStart = monthsAgo(i);
    const mEnd = endOfMonth(mStart);
    const activePays = allPaid.filter(p => p.createdAt <= mEnd);
    const newPays = allPaid.filter(p => p.createdAt >= mStart && p.createdAt <= mEnd);
    const churnPays = allChurned.filter(p => p.updatedAt >= mStart && p.updatedAt <= mEnd);
    const mrr = activePays.reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
    const newMrr = newPays.reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
    const expansion = newPays.filter(p => p.planType === "GROWTH").reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
    const churn = churnPays.reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
    result.push({ month: fmtMonth(mStart), mrr, newMrr, expansion, churn, net: newMrr + expansion - churn });
  }
  return result;
}

async function getPlanRevenueRaw(payload: AdminRevenueBasePayload): Promise<PlanRevenue[]> {
  await assertAdmin(payload.requestingUserId);
  const monthStart = startOfThisMonth();
  const [allPaid, churnedThisMonth] = await prisma.$transaction([
    prisma.payment.findMany({ where: { status: "PAID" }, select: { planType: true, planMode: true } }),
    prisma.payment.findMany({ where: { status: "UNPAID", updatedAt: { gte: monthStart } }, select: { planType: true, planMode: true } }),
  ]);
  const planCounts: Record<string, number> = {};
  const churnCounts: Record<string, number> = {};
  for (const p of allPaid) { const key = planKey(p.planType, p.planMode); planCounts[key] = (planCounts[key] ?? 0) + 1; }
  for (const c of churnedThisMonth) { const key = planKey(c.planType, c.planMode); churnCounts[key] = (churnCounts[key] ?? 0) + 1; }
  const ORDER = ["PRO_MONTHLY", "PRO_YEARLY", "GROWTH_MONTHLY", "GROWTH_YEARLY"];
  return ORDER.map((key) => {
    const users = planCounts[key] ?? 0;
    const meta = PLAN_LABELS[key];
    return { plan: meta?.plan ?? key, mode: meta?.mode ?? "", users, mrr: users * (PLAN_MRR[key] ?? 0), arr: users * (PLAN_ARR[key] ?? 0), avgPrice: PLAN_MRR[key] ?? 0, churnPct: users > 0 ? round1(((churnCounts[key] ?? 0) / users) * 100) : 0, fill: meta?.fill ?? "hsl(240 5% 55%)" };
  }).filter((p) => p.users > 0);
}

async function getChurnAnalysisRaw(payload: AdminRevenueBasePayload): Promise<ChurnDataPoint[]> {
  await assertAdmin(payload.requestingUserId);
  const [allPaid, allUnpaid] = await prisma.$transaction([
    prisma.payment.findMany({ where: { status: "PAID" }, select: { createdAt: true, updatedAt: true } }),
    prisma.payment.findMany({ where: { status: "UNPAID" }, select: { updatedAt: true } }),
  ]);
  const result: ChurnDataPoint[] = [];
  for (let i = REVENUE_MONTHS - 1; i >= 0; i--) {
    const mStart = monthsAgo(i);
    const mEnd = endOfMonth(mStart);
    const activeCount = allPaid.filter(p => p.createdAt <= mStart).length;
    const churnedCount = allUnpaid.filter(p => p.updatedAt >= mStart && p.updatedAt <= mEnd).length;
    const recoveredCount = allPaid.filter(p => p.updatedAt >= mStart && p.updatedAt <= mEnd && p.createdAt < mStart).length;
    result.push({ month: fmtMonth(mStart), churned: churnedCount, churnRate: activeCount > 0 ? round1((churnedCount / activeCount) * 100) : 0, recovered: recoveredCount });
  }
  return result;
}

async function getCohortLtvRaw(payload: AdminRevenueBasePayload): Promise<CohortLtvRow[]> {
  await assertAdmin(payload.requestingUserId);
  const allPaidPayments = await prisma.payment.findMany({ where: { status: "PAID" }, select: { planType: true, planMode: true, userId: true, createdAt: true } });
  const result: CohortLtvRow[] = [];
  for (let i = COHORT_MONTHS - 1; i >= 0; i--) {
    const cohortStart = monthsAgo(i);
    const cohortEnd = endOfMonth(cohortStart);
    const cohortPayments = allPaidPayments.filter(p => p.createdAt >= cohortStart && p.createdAt <= cohortEnd);
    const startingUsers = cohortPayments.length;
    if (startingUsers === 0) continue;
    const baseMrr = cohortPayments.reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
    const mAvail = Math.floor(i);
    result.push({ cohort: fmtCohortLabel(cohortStart), startingUsers, month1Mrr: mAvail >= 1 ? Math.round(baseMrr * 0.95) : 0, month3Mrr: mAvail >= 3 ? Math.round(baseMrr * 0.86) : 0, month6Mrr: mAvail >= 6 ? Math.round(baseMrr * 0.76) : 0, month12Mrr: mAvail >= 12 ? Math.round(baseMrr * 0.59) : 0, avgLtv: Math.round((baseMrr / startingUsers) / LTV_CHURN_DIVISOR) });
  }
  return result;
}

async function getRevenueByCountryRaw(payload: AdminRevenueBasePayload): Promise<RevenueByCountry[]> {
  await assertAdmin(payload.requestingUserId);
  const paidUsers = await prisma.payment.findMany({ where: { status: "PAID" }, select: { planType: true, planMode: true, user: { select: { email: true } } } });
  const TLD_MAP: Record<string, { country: string; flag: string }> = { ".de": { country: "Germany", flag: "🇩🇪" }, ".co.uk": { country: "United Kingdom", flag: "🇬🇧" }, ".uk": { country: "United Kingdom", flag: "🇬🇧" }, ".in": { country: "India", flag: "🇮🇳" }, ".io": { country: "United States", flag: "🇺🇸" }, ".br": { country: "Brazil", flag: "🇧🇷" }, ".sg": { country: "Singapore", flag: "🇸🇬" }, ".bd": { country: "Bangladesh", flag: "🇧🇩" }, ".mx": { country: "Mexico", flag: "🇲🇽" }, ".ae": { country: "UAE", flag: "🇦🇪" }, ".dk": { country: "Denmark", flag: "🇩🇰" }, ".jp": { country: "Japan", flag: "🇯🇵" }, ".cn": { country: "China", flag: "🇨🇳" }, ".ng": { country: "Nigeria", flag: "🇳🇬" }, ".com": { country: "United States", flag: "🇺🇸" } };
  const countryMap = new Map<string, { flag: string; users: number; mrr: number }>();
  for (const p of paidUsers) {
    const domain = p.user.email.toLowerCase().split("@")[1] ?? "";
    let matched = false;
    for (const [tld, info] of Object.entries(TLD_MAP).sort((a,b)=>b[0].length-a[0].length)) {
      if (domain.endsWith(tld)) { const ex = countryMap.get(info.country) ?? { flag: info.flag, users: 0, mrr: 0 }; ex.users++; ex.mrr += paymentMrr(p.planType, p.planMode); countryMap.set(info.country, ex); matched=true; break; }
    }
    if (!matched) { const ex = countryMap.get("Other") ?? { flag: "🌍", users: 0, mrr: 0 }; ex.users++; ex.mrr += paymentMrr(p.planType, p.planMode); countryMap.set("Other", ex); }
  }
  const totalMrr = Array.from(countryMap.values()).reduce((s, v) => s + v.mrr, 0) || 1;
  return Array.from(countryMap.entries()).sort((a,b)=>b[1].mrr-a[1].mrr).map(([country, data]) => ({ country, flag: data.flag, users: data.users, mrr: data.mrr, pct: round1((data.mrr / totalMrr) * 100) }));
}

async function getTransactionsRaw(payload: GetTransactionsPayload): Promise<PaginatedTransactions> {
  await assertAdmin(payload.requestingUserId);
  const { query } = payload;
  const { page, limit, skip } = normaliseTxPagination(query);
  const where: Record<string, unknown> = {};
  if (query.type && query.type !== "all") { where.status = (query.type === "cancel" || query.type === "refund") ? "UNPAID" : "PAID"; }
  if (query.search?.trim()) { const q = query.search.trim(); where.user = { OR: [ { name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } } ] }; }
  const [total, payments] = await prisma.$transaction([ prisma.payment.count({ where }), prisma.payment.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take: limit, select: { id: true, status: true, planType: true, planMode: true, amount: true, transactionId: true, stripeEventId: true, createdAt: true, updatedAt: true, user: { select: { id: true, name: true, email: true } } } }) ]);
  const userIds = payments.map(p => p.user.id);
  const priorPayments = userIds.length > 0 ? await prisma.payment.findMany({ where: { userId: { in: userIds }, createdAt: { lt: payments[0]?.createdAt ?? new Date() }, status: "PAID" }, select: { userId: true } }) : [];
  const priorPayers = new Set(priorPayments.map(p => p.userId));
  const data: RecentTransaction[] = payments.map((p) => {
    const isFirst = !priorPayers.has(p.user.id);
    const amount = p.planMode === "YEARLY" ? (p.planType === "PRO" ? 156 : 396) : (PLAN_MRR[planKey(p.planType, p.planMode)] ?? 0);
    return { id: p.id, userId: p.user.id, userName: p.user.name, userEmail: p.user.email, type: deriveTransactionType(isFirst, p.status), plan: planLabel(p.planType, p.planMode), amount: p.status === "PAID" ? amount : 0, currency: "USD", status: deriveTransactionStatus(p.status), date: p.updatedAt.toISOString(), stripeId: p.stripeEventId ?? p.transactionId ?? null };
  });
  return { data, meta: buildTxMeta(total, page, limit), totalRevenue: data.filter(t => t.status === "paid").reduce((s, t) => s + t.amount, 0) };
}

/* ──────────────────────────────────────────────────────────────
   Exported Service with Redis Caching
   ────────────────────────────────────────────────────────────── */

export const adminRevenueService = {
  getKpis:                withCache("admin:revenue:metrics:kpis", 21600, getKpisRaw),
  getMrrWaterfall:        withCache("admin:revenue:metrics:waterfall", 21600, getMrrWaterfallRaw),
  getPlanRevenue:         withCache("admin:revenue:metrics:plans", 21600, getPlanRevenueRaw),
  getChurnAnalysis:       withCache("admin:revenue:metrics:churn", 21600, getChurnAnalysisRaw),
  getCohortLtv:           withCache("admin:revenue:metrics:cohorts", 21600, getCohortLtvRaw),
  getRevenueByCountry:    withCache("admin:revenue:metrics:countries", 21600, getRevenueByCountryRaw),
  getTransactions:        withCache("admin:revenue:transactions", 60, getTransactionsRaw),
};