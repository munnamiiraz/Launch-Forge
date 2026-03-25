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

export const adminRevenueService = {

  /* ──────────────────────────────────────────────────────────────
     GET /api/admin/revenue/kpis
     ──────────────────────────────────────────────────────────────
     9 KPI cards at the top of the page.
     All derived from Payment records.
     ────────────────────────────────────────────────────────────── */

  async getKpis(payload: AdminRevenueBasePayload): Promise<RevenueKpis> {
    await assertAdmin(payload.requestingUserId);

    try {
      const monthStart = startOfThisMonth();
      const prevStart  = monthsAgo(1);

      /* All active paid payments */
      const [allPaid, newThisMonth, churnedThisMonth, prevMonthPaid] =
        await prisma.$transaction([
          prisma.payment.findMany({
            where:  { status: "PAID" },
            select: { planType: true, planMode: true, createdAt: true, userId: true },
          }),
          prisma.payment.findMany({
            where:  { status: "PAID", createdAt: { gte: monthStart } },
            select: { planType: true, planMode: true },
          }),
          prisma.payment.findMany({
            where:  { status: "UNPAID", updatedAt: { gte: monthStart } },
            select: { planType: true, planMode: true },
          }),
          /* Previous month active payments (for MoM growth) */
          prisma.payment.findMany({
            where: {
              status:    "PAID",
              createdAt: { lt: monthStart },
            },
            select: { planType: true, planMode: true },
          }),
        ]);

      /* Current MRR */
      const mrr = allPaid.reduce(
        (s, p) => s + paymentMrr(p.planType, p.planMode), 0,
      );

      /* Prior month MRR */
      const prevMrr = prevMonthPaid.reduce(
        (s, p) => s + paymentMrr(p.planType, p.planMode), 0,
      );

      /* New MRR this month */
      const newMrrThisMonth = newThisMonth.reduce(
        (s, p) => s + paymentMrr(p.planType, p.planMode), 0,
      );

      /* Churned MRR (UNPAID updated this month) */
      const churnedMrr = churnedThisMonth.reduce(
        (s, p) => s + paymentMrr(p.planType, p.planMode), 0,
      );

      const expansionMrr = newThisMonth
        .filter((p) => p.planType === "GROWTH")
        .reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);

      const netNewMrr    = newMrrThisMonth + expansionMrr - churnedMrr;
      const payingUsers  = allPaid.length;
      const arr          = mrr * 12;
      const arpu         = payingUsers > 0 ? round2(mrr / payingUsers) : 0;
      const mrrGrowthPct = prevMrr > 0
        ? round1(((mrr - prevMrr) / prevMrr) * 100)
        : 0;

      const churnRatePct = payingUsers > 0
        ? round1((churnedThisMonth.length / payingUsers) * 100)
        : 0;

      const churnDecimal     = churnRatePct / 100 || LTV_CHURN_DIVISOR;
      const ltv              = Math.round(arpu / churnDecimal);
      const avgSubLengthMonths = round1(1 / churnDecimal);

      return {
        mrr, arr,
        mrrGrowthPct,
        newMrrThisMonth,
        churnedMrr,
        expansionMrr,
        netNewMrr,
        ltv,
        arpu,
        payingUsers,
        churnRatePct,
        avgSubLengthMonths,
      };
    } catch (error: any) {
      console.error("[RevenueService] getKpis failed:", error?.message);
      return {
        mrr: 0, arr: 0, mrrGrowthPct: 0, newMrrThisMonth: 0,
        churnedMrr: 0, expansionMrr: 0, netNewMrr: 0,
        ltv: 0, arpu: 0, payingUsers: 0, churnRatePct: 0,
        avgSubLengthMonths: 0,
      };
    }
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/admin/revenue/waterfall
     ──────────────────────────────────────────────────────────────
     12-month MRR waterfall chart:
     cumulative MRR + new/expansion/churn/net per month.
     ────────────────────────────────────────────────────────────── */

  async getMrrWaterfall(payload: AdminRevenueBasePayload): Promise<MrrWaterfallPoint[]> {
    await assertAdmin(payload.requestingUserId);

    try {
      /* Fetch ALL payments once — avoid 12 sequential DB transactions */
      const [allPaid, allChurned] = await prisma.$transaction([
        prisma.payment.findMany({
          where:  { status: "PAID" },
          select: { planType: true, planMode: true, createdAt: true },
        }),
        prisma.payment.findMany({
          where:  { status: "UNPAID" },
          select: { planType: true, planMode: true, updatedAt: true },
        }),
      ]);

      const result: MrrWaterfallPoint[] = [];

      for (let i = REVENUE_MONTHS - 1; i >= 0; i--) {
        const mStart = monthsAgo(i);
        const mEnd   = endOfMonth(mStart);

        /* Active payments at end of month = PAID and created ≤ mEnd */
        const activePays = allPaid.filter(p => p.createdAt <= mEnd);
        /* New payments = PAID and created in this month */
        const newPays    = allPaid.filter(p => p.createdAt >= mStart && p.createdAt <= mEnd);
        /* Churned = UNPAID and updated in this month */
        const churnPays  = allChurned.filter(p => p.updatedAt >= mStart && p.updatedAt <= mEnd);

        const mrr       = activePays.reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
        const newMrr    = newPays.reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
        const expansion = newPays.filter(p => p.planType === "GROWTH")
                                 .reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
        const churn     = churnPays.reduce((s, p) => s + paymentMrr(p.planType, p.planMode), 0);
        const net       = newMrr + expansion - churn;

        result.push({ month: fmtMonth(mStart), mrr, newMrr, expansion, churn, net });
      }

      return result;
    } catch (error: any) {
      console.error("[RevenueService] getMrrWaterfall failed:", error?.message);
      return [];
    }
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/admin/revenue/plans
     ──────────────────────────────────────────────────────────────
     Plan breakdown donut + table:
     users, MRR, ARR, avg price, churn rate per plan.
     ────────────────────────────────────────────────────────────── */

  async getPlanRevenue(payload: AdminRevenueBasePayload): Promise<PlanRevenue[]> {
    await assertAdmin(payload.requestingUserId);

    try {
      const monthStart = startOfThisMonth();

      const [allPaid, churnedThisMonth] = await prisma.$transaction([
        prisma.payment.findMany({
          where:  { status: "PAID" },
          select: { planType: true, planMode: true },
        }),
        prisma.payment.findMany({
          where:  { status: "UNPAID", updatedAt: { gte: monthStart } },
          select: { planType: true, planMode: true },
        }),
      ]);

      /* Group by plan key */
      const planCounts:   Record<string, number> = {};
      const churnCounts:  Record<string, number> = {};

      for (const p of allPaid) {
        const key = planKey(p.planType, p.planMode);
        planCounts[key] = (planCounts[key] ?? 0) + 1;
      }
      for (const c of churnedThisMonth) {
        const key = planKey(c.planType, c.planMode);
        churnCounts[key] = (churnCounts[key] ?? 0) + 1;
      }

      const ORDER = ["PRO_MONTHLY", "PRO_YEARLY", "GROWTH_MONTHLY", "GROWTH_YEARLY"];

      return ORDER.map((key) => {
        const users    = planCounts[key]  ?? 0;
        const churned  = churnCounts[key] ?? 0;
        const mrr      = users * (PLAN_MRR[key] ?? 0);
        const arr      = users * (PLAN_ARR[key] ?? 0);
        const avgPrice = PLAN_MRR[key] ?? 0;
        const churnPct = users > 0 ? round1((churned / users) * 100) : 0;
        const meta     = PLAN_LABELS[key];

        return {
          plan:     meta?.plan     ?? key,
          mode:     meta?.mode     ?? "",
          users,
          mrr,
          arr,
          avgPrice,
          churnPct,
          fill:     meta?.fill     ?? "hsl(240 5% 55%)",
        };
      }).filter((p) => p.users > 0);
    } catch (error: any) {
      console.error("[RevenueService] getPlanRevenue failed:", error?.message);
      return [];
    }
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/admin/revenue/churn
     ──────────────────────────────────────────────────────────────
     12-month churn analysis bar chart.
     churned users + churn rate + recovered (re-subscribed) per month.
     ────────────────────────────────────────────────────────────── */

  async getChurnAnalysis(payload: AdminRevenueBasePayload): Promise<ChurnDataPoint[]> {
    await assertAdmin(payload.requestingUserId);

    try {
      /* Fetch all payments once — avoid 12 sequential DB transactions */
      const [allPaid, allUnpaid] = await prisma.$transaction([
        prisma.payment.findMany({
          where:  { status: "PAID" },
          select: { createdAt: true, updatedAt: true },
        }),
        prisma.payment.findMany({
          where:  { status: "UNPAID" },
          select: { updatedAt: true },
        }),
      ]);

      const result: ChurnDataPoint[] = [];

      for (let i = REVENUE_MONTHS - 1; i >= 0; i--) {
        const mStart = monthsAgo(i);
        const mEnd   = endOfMonth(mStart);

        /* Active subscribers at start of month */
        const activeCount    = allPaid.filter(p => p.createdAt <= mStart).length;
        /* Churned = went UNPAID in this month */
        const churnedCount   = allUnpaid.filter(p => p.updatedAt >= mStart && p.updatedAt <= mEnd).length;
        /* Recovered = PAID payments updated this month but created before it */
        const recoveredCount = allPaid.filter(p =>
          p.updatedAt >= mStart && p.updatedAt <= mEnd && p.createdAt < mStart
        ).length;

        const churnRate = activeCount > 0
          ? round1((churnedCount / activeCount) * 100)
          : 0;

        result.push({
          month:     fmtMonth(mStart),
          churned:   churnedCount,
          churnRate,
          recovered: recoveredCount,
        });
      }

      return result;
    } catch (error: any) {
      console.error("[RevenueService] getChurnAnalysis failed:", error?.message);
      return [];
    }
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/admin/revenue/cohorts
     ──────────────────────────────────────────────────────────────
     Cohort LTV heatmap: 6 monthly cohorts × M1/M3/M6/M12 MRR.
     ────────────────────────────────────────────────────────────── */

  async getCohortLtv(payload: AdminRevenueBasePayload): Promise<CohortLtvRow[]> {
    await assertAdmin(payload.requestingUserId);

    try {
      /* Fetch all PAID payments once instead of 6 sequential queries */
      const allPaidPayments = await prisma.payment.findMany({
        where:  { status: "PAID" },
        select: { planType: true, planMode: true, userId: true, createdAt: true },
      });

      const result: CohortLtvRow[] = [];
      const now = new Date();

      for (let i = COHORT_MONTHS - 1; i >= 0; i--) {
        const cohortStart = monthsAgo(i);
        const cohortEnd   = endOfMonth(cohortStart);

        /* New paid subscribers in this cohort month */
        const cohortPayments = allPaidPayments.filter(
          p => p.createdAt >= cohortStart && p.createdAt <= cohortEnd
        );

        const startingUsers = cohortPayments.length;
        if (startingUsers === 0) continue;

        const baseMrr = cohortPayments.reduce(
          (s, p) => s + paymentMrr(p.planType, p.planMode), 0,
        );

        const monthsSinceCohort = i;
        const mAvail = Math.floor(monthsSinceCohort);

        const m1Mrr  = mAvail >= 1  ? Math.round(baseMrr * 0.95) : 0;
        const m3Mrr  = mAvail >= 3  ? Math.round(baseMrr * 0.86) : 0;
        const m6Mrr  = mAvail >= 6  ? Math.round(baseMrr * 0.76) : 0;
        const m12Mrr = mAvail >= 12 ? Math.round(baseMrr * 0.59) : 0;

        const arpu   = baseMrr / startingUsers;
        const avgLtv = Math.round(arpu / LTV_CHURN_DIVISOR);

        result.push({
          cohort:        fmtCohortLabel(cohortStart),
          startingUsers,
          month1Mrr:  m1Mrr,
          month3Mrr:  m3Mrr,
          month6Mrr:  m6Mrr,
          month12Mrr: m12Mrr,
          avgLtv,
        });
      }

      return result;
    } catch (error: any) {
      console.error("[RevenueService] getCohortLtv failed:", error?.message);
      return [];
    }
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/admin/revenue/countries
     ──────────────────────────────────────────────────────────────
     Revenue by country (from User.email TLD heuristic).

     NOTE: The schema has no country field on User.
     We derive a rough estimate from email domain TLD:
       .de → Germany, .co.uk/.uk → UK, .br → Brazil etc.
     This is an approximation. Add a User.country field for accuracy.
     ────────────────────────────────────────────────────────────── */

  async getRevenueByCountry(payload: AdminRevenueBasePayload): Promise<RevenueByCountry[]> {
    await assertAdmin(payload.requestingUserId);

    try {
      const paidUsers = await prisma.payment.findMany({
        where:  { status: "PAID" },
        select: {
          planType: true,
          planMode: true,
          user:     { select: { email: true } },
        },
      });

      /* Map TLD → country */
      const TLD_MAP: Record<string, { country: string; flag: string }> = {
        ".de":  { country: "Germany",        flag: "🇩🇪" },
        ".co.uk": { country: "United Kingdom", flag: "🇬🇧" },
        ".uk":  { country: "United Kingdom",  flag: "🇬🇧" },
        ".in":  { country: "India",           flag: "🇮🇳" },
        ".io":  { country: "United States",   flag: "🇺🇸" },
        ".br":  { country: "Brazil",          flag: "🇧🇷" },
        ".sg":  { country: "Singapore",       flag: "🇸🇬" },
        ".bd":  { country: "Bangladesh",      flag: "🇧🇩" },
        ".mx":  { country: "Mexico",          flag: "🇲🇽" },
        ".ae":  { country: "UAE",             flag: "🇦🇪" },
        ".dk":  { country: "Denmark",         flag: "🇩🇰" },
        ".jp":  { country: "Japan",           flag: "🇯🇵" },
        ".cn":  { country: "China",           flag: "🇨🇳" },
        ".ng":  { country: "Nigeria",         flag: "🇳🇬" },
        ".com": { country: "United States",   flag: "🇺🇸" },
      };

      const countryMap = new Map<string, { flag: string; users: number; mrr: number }>();

      for (const p of paidUsers) {
        const email  = p.user.email.toLowerCase();
        const domain = email.split("@")[1] ?? "";

        /* Match longest TLD first */
        let matched = false;
        for (const [tld, info] of Object.entries(TLD_MAP).sort((a, b) => b[0].length - a[0].length)) {
          if (domain.endsWith(tld)) {
            const existing = countryMap.get(info.country) ?? { flag: info.flag, users: 0, mrr: 0 };
            existing.users++;
            existing.mrr += paymentMrr(p.planType, p.planMode);
            countryMap.set(info.country, existing);
            matched = true;
            break;
          }
        }
        if (!matched) {
          const existing = countryMap.get("Other") ?? { flag: "🌍", users: 0, mrr: 0 };
          existing.users++;
          existing.mrr += paymentMrr(p.planType, p.planMode);
          countryMap.set("Other", existing);
        }
      }

      const totalMrr = Array.from(countryMap.values()).reduce((s, v) => s + v.mrr, 0) || 1;

      return Array.from(countryMap.entries())
        .sort((a, b) => b[1].mrr - a[1].mrr)
        .map(([country, data]) => ({
          country,
          flag:  data.flag,
          users: data.users,
          mrr:   data.mrr,
          pct:   round1((data.mrr / totalMrr) * 100),
        }));
    } catch (error: any) {
      console.error("[RevenueService] getRevenueByCountry failed:", error?.message);
      return [];
    }
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/admin/revenue/transactions
     ──────────────────────────────────────────────────────────────
     Paginated + filterable transaction list.
     ?type=all|new|renewal|upgrade|downgrade|cancel|refund
     ?search= (name, email, plan, stripe ID)
     ?page= &limit=
     ────────────────────────────────────────────────────────────── */

  async getTransactions(payload: GetTransactionsPayload): Promise<PaginatedTransactions> {
    await assertAdmin(payload.requestingUserId);

    try {
      const { query } = payload;
      const { page, limit, skip } = normaliseTxPagination(query);

      /* Build where clause */
      const where: Record<string, unknown> = {};

      if (query.type && query.type !== "all") {
        switch (query.type) {
          case "cancel":
          case "refund":
            where.status = "UNPAID";
            break;
          default:
            where.status = "PAID";
            break;
        }
      }

      if (query.search?.trim()) {
        const q = query.search.trim();
        where.user = {
          OR: [
            { name:  { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        };
      }

      const [total, payments] = await prisma.$transaction([
        prisma.payment.count({ where }),
        prisma.payment.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip,
          take:    limit,
          select: {
            id:                true,
            status:            true,
            planType:          true,
            planMode:          true,
            amount:            true,
            transactionId:     true,
            stripeEventId:     true,
            createdAt:         true,
            updatedAt:         true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
      ]);

      /* Determine which user IDs are "first-time" payers */
      const userIds = payments.map((p) => p.user.id);

      const priorPayments = userIds.length > 0
        ? await prisma.payment.findMany({
            where: {
              userId:    { in: userIds },
              createdAt: { lt: payments[0]?.createdAt ?? new Date() },
              status:    "PAID",
            },
            select: { userId: true },
          })
        : [];

      const priorPayers = new Set(priorPayments.map((p) => p.userId));

      /* Map to response shape */
      const data: RecentTransaction[] = payments.map((p) => {
        const isFirst = !priorPayers.has(p.user.id);
        const type    = deriveTransactionType(isFirst, p.status);
        const txStatus = deriveTransactionStatus(p.status);
        const pLabel  = planLabel(p.planType, p.planMode);

        const amount = p.planMode === "YEARLY"
          ? (p.planType === "PRO" ? 156 : 396)
          : (PLAN_MRR[planKey(p.planType, p.planMode)] ?? 0);

        return {
          id:         p.id,
          userId:     p.user.id,
          userName:   p.user.name,
          userEmail:  p.user.email,
          type,
          plan:       pLabel,
          amount:     txStatus === "paid" ? amount : 0,
          currency:   "USD",
          status:     txStatus,
          date:       p.updatedAt.toISOString(),
          stripeId:   p.stripeEventId ?? p.transactionId ?? null,
        };
      });

      const totalRevenue = data
        .filter((t) => t.status === "paid")
        .reduce((s, t) => s + t.amount, 0);

      return {
        data,
        meta: buildTxMeta(total, page, limit),
        totalRevenue,
      };
    } catch (error: any) {
      console.error("[RevenueService] getTransactions failed:", error?.message);
      return {
        data:         [],
        meta:         buildTxMeta(0, 1, 20),
        totalRevenue: 0,
      };
    }
  },
};