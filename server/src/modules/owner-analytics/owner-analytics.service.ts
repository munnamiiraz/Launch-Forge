import status from "http-status";
import { prisma }   from "../../lib/prisma";
import AppError     from "../../errorHelpers/AppError";
import {
  AnalyticsPayload,
  AnalyticsSummary,
  SubscriberGrowthPoint,
  ConfirmationRatePoint,
  ReferralFunnelResult,
  ViralKFactorPoint,
  TopReferrerBar,
  WaitlistComparisonItem,
  CohortRow,
  RevenueResult,
  RevenueTrendPoint,
  PlanDistributionItem,
  FeedbackActivityPoint,
} from "./owner-analytics.interface";
import { ANALYTICS_MESSAGES, COHORT, TOP_REFERRERS_LIMIT, FEEDBACK_WINDOW_DAYS } from "./owner-analytics.constants";
import {
  rangeStart, priorRangeStart, daysInRange, weeksInRange,
  fmtDay, fmtMonth, fmtCohortLabel,
  startOfWeek, startOfMonth,
  countChain, buildChildrenMap,
  pct, round1, PLAN_META,
} from "./owner-analytics.utils";
import { assertPlanFeature } from "../../middlewares/checkPlanFeature";
import { withCache, secondsUntilMidnight } from "../../lib/redis/with-cache";

/* ── Shared auth guard ───────────────────────────────────────────── */

async function assertMember(workspaceId: string, userId: string, skipPlanCheck = false) {
  // Plan gate — require Pro or higher for analytics, unless explicitly bypassed
  if (!skipPlanCheck) {
    await assertPlanFeature(workspaceId, "analytics");
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
      deletedAt: null,
    },
    select: { id: true },
  });
  if (!member) {
    throw new AppError(status.FORBIDDEN, ANALYTICS_MESSAGES.UNAUTHORIZED);
  }
}

/* ── Shared: resolve waitlist IDs for this workspace ─────────────── */

async function resolveWaitlistIds(
  workspaceId: string,
  waitlistId?: string,
): Promise<string[]> {
  if (waitlistId) return [waitlistId];

  const waitlists = await prisma.waitlist.findMany({
    where:  { workspaceId, deletedAt: null },
    select: { id: true },
  });
  return waitlists.map((w) => w.id);
}

export const analyticsService = {

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/:workspaceId/analytics/summary
     ──────────────────────────────────────────────────────────────
     KPI strip: total subscribers, referrals, viral score,
     confirmation rate, MRR, feedback items + period deltas.
     ────────────────────────────────────────────────────────────── */

  getSummary: withCache(
    (payload: AnalyticsPayload) => `owner:${payload.ownerEmail || "system"}:workspace-${payload.workspaceId}:analytics:summary`,
    300,
    async (payload: AnalyticsPayload): Promise<AnalyticsSummary> => {
      const { workspaceId, requestingUserId, query } = payload;
      await assertMember(workspaceId, requestingUserId);

      const waitlistIds   = await resolveWaitlistIds(workspaceId, query.waitlistId);
      const start         = rangeStart(query.range ?? "30d");
      const prior         = priorRangeStart(query.range ?? "30d");

      /* Parallel fetches ─────────────────────────────────────────── */
      const [
        totalSubscribers,
        priorSubscribers,
        totalReferrals,
        priorReferrals,
        confirmedCount,
        activeReferrers,
        feedbackItems,
        newThisPeriod,
        newPriorPeriod,
        waitlistStats,
        payment,
      ] = await prisma.$transaction([
        /* Total subscribers across all waitlists */
        prisma.subscriber.count({
          where: { waitlistId: { in: waitlistIds }, deletedAt: null },
        }),
        /* Subscribers at end of prior period */
        prisma.subscriber.count({
          where: {
            waitlistId: { in: waitlistIds },
            deletedAt:  null,
            createdAt:  { lt: prior.end },
          },
        }),
        /* Total referrals (sum of denormalised counter) */
        prisma.subscriber.aggregate({
          where: { waitlistId: { in: waitlistIds }, deletedAt: null },
          _sum:  { referralsCount: true },
        }),
        /* Prior period referrals */
        prisma.subscriber.aggregate({
          where: {
            waitlistId: { in: waitlistIds },
            deletedAt:  null,
            createdAt:  { lt: prior.end },
          },
          _sum: { referralsCount: true },
        }),
        /* Confirmed count */
        prisma.subscriber.count({
          where: {
            waitlistId:  { in: waitlistIds },
            deletedAt:   null,
            isConfirmed: true,
          },
        }),
        /* Active referrers */
        prisma.subscriber.count({
          where: {
            waitlistId:     { in: waitlistIds },
            deletedAt:      null,
            referralsCount: { gt: 0 },
          },
        }),
        /* Feedback items across all workspace boards */
        prisma.featureRequest.count({
          where: {
            board: { workspaceId, deletedAt: null },
            deletedAt: null,
          },
        }),
        /* New subscribers this period */
        prisma.subscriber.count({
          where: {
            waitlistId: { in: waitlistIds },
            deletedAt:  null,
            createdAt:  { gte: start },
          },
        }),
        /* New subscribers prior period */
        prisma.subscriber.count({
          where: {
            waitlistId: { in: waitlistIds },
            deletedAt:  null,
            createdAt:  { gte: prior.start, lt: prior.end },
          },
        }),
        /* Per-waitlist subscriber + referral totals (for viral score) */
        prisma.waitlist.findMany({
          where:  { id: { in: waitlistIds }, deletedAt: null },
          select: {
            _count: { select: { subscribers: { where: { deletedAt: null } } } },
            subscribers: {
              where:   { deletedAt: null },
              select:  { referralsCount: true },
            },
          },
        }),
        /* Workspace owner payment for MRR */
        prisma.payment.findFirst({
          where:  { user: { workspaceMemberships: { some: { workspaceId, role: "OWNER" } } }, status: "PAID" },
          select: { amount: true, planMode: true, planType: true },
        }),
      ]);

      /* Derived values ───────────────────────────────────────────── */
      const totalRefs    = totalReferrals._sum.referralsCount ?? 0;
      const priorRefs    = priorReferrals._sum.referralsCount ?? 0;

      /* Per-waitlist viral scores to find best k-factor */
      const viralScores = waitlistStats.map((w) => {
        const subs = w._count.subscribers;
        const refs = w.subscribers.reduce((s, sub) => s + sub.referralsCount, 0);
        return subs > 0 ? round1(refs / subs) : 0;
      });

      const avgViralScore = viralScores.length > 0
        ? round1(viralScores.reduce((s, v) => s + v, 0) / viralScores.length)
        : 0;
      const bestKFactor = viralScores.length > 0 ? Math.max(...viralScores) : 0;

      const confirmationRate = pct(confirmedCount, totalSubscribers);

      /* MRR — workspace owner's payment amount (monthly equivalent) */
      let totalRevenueMrr = 0;
      if (payment) {
        totalRevenueMrr = payment.planMode === "YEARLY"
          ? Math.round(payment.amount / 12)
          : payment.amount;
      }

      const wowGrowth = priorSubscribers > 0
        ? round1(((newThisPeriod - newPriorPeriod) / priorSubscribers) * 100)
        : 0;

      const totalWaitlists = waitlistIds.length;

      return {
        totalSubscribers,
        totalWaitlists,
        totalReferrals:   totalRefs,
        avgViralScore,
        confirmationRate,
        totalRevenueMrr,
        activeReferrers,
        feedbackItems,
        bestKFactor,
        delta: {
          subscribers:        newThisPeriod - newPriorPeriod,
          referrals:          totalRefs - priorRefs,
          weekOverWeekGrowth: wowGrowth,
          feedbackItems:      0,
        },
      };
    }
  ),

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/:workspaceId/analytics/growth
     ────────────────────────────────────────────────────────────── */

  getSubscriberGrowth: withCache(
    (payload: AnalyticsPayload) => `owner:${payload.ownerEmail || "system"}:workspace-${payload.workspaceId}:analytics:growth`,
    secondsUntilMidnight,
    async (payload: AnalyticsPayload): Promise<SubscriberGrowthPoint[]> => {
      const { workspaceId, requestingUserId, query = {} } = payload;
      const range = query.range ?? "30d";
      
      await assertMember(workspaceId, requestingUserId, range === "7d");
      const waitlistIds = await resolveWaitlistIds(workspaceId, query.waitlistId);
      const start       = rangeStart(range);

      const rows = await prisma.subscriber.findMany({
        where: {
          waitlistId: { in: waitlistIds },
          deletedAt:  null,
          createdAt:  { gte: start },
        },
        select: {
          createdAt:   true,
          referredById: true,
        },
        orderBy: { createdAt: "asc" },
      });

      const baseline = await prisma.subscriber.count({
        where: {
          waitlistId: { in: waitlistIds },
          deletedAt:  null,
          createdAt:  { lt: start },
        },
      });

      const dayMap = new Map<string, { subscribers: number; referrals: number }>();
      const allDays = daysInRange(start);
      for (const d of allDays) {
        dayMap.set(fmtDay(d), { subscribers: 0, referrals: 0 });
      }

      for (const row of rows) {
        const key = fmtDay(row.createdAt);
        const existing = dayMap.get(key) ?? { subscribers: 0, referrals: 0 };
        existing.subscribers++;
        if (row.referredById) existing.referrals++;
        dayMap.set(key, existing);
      }

      let cumulative = baseline;
      const result: SubscriberGrowthPoint[] = [];

      for (const [date, counts] of dayMap.entries()) {
        cumulative += counts.subscribers;
        result.push({
          date,
          subscribers: counts.subscribers,
          cumulative,
          referrals:   counts.referrals,
        });
      }

      return result;
    }
  ),

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/:workspaceId/analytics/funnel
     ────────────────────────────────────────────────────────────── */

  getReferralFunnel: withCache(
    (payload: AnalyticsPayload) => `owner:${payload.ownerEmail || "system"}:workspace-${payload.workspaceId}:analytics:funnel`,
    21600,
    async (payload: AnalyticsPayload): Promise<ReferralFunnelResult> => {
      const { workspaceId, requestingUserId, query } = payload;
      await assertMember(workspaceId, requestingUserId);

      const waitlistIds = await resolveWaitlistIds(workspaceId, query.waitlistId);

      const [
        total,
        confirmed,
        sharedReferral,
        got1Plus,
        got5Plus,
        directCount,
        referralLinkCount,
      ] = await prisma.$transaction([
        prisma.subscriber.count({
          where: { waitlistId: { in: waitlistIds }, deletedAt: null },
        }),
        prisma.subscriber.count({
          where: { waitlistId: { in: waitlistIds }, deletedAt: null, isConfirmed: true },
        }),
        prisma.subscriber.count({
          where: {
            waitlistId:     { in: waitlistIds },
            deletedAt:      null,
            referralsCount: { gte: 1 },
          },
        }),
        prisma.subscriber.count({
          where: {
            waitlistId:     { in: waitlistIds },
            deletedAt:      null,
            referralsCount: { gte: 1 },
          },
        }),
        prisma.subscriber.count({
          where: {
            waitlistId:     { in: waitlistIds },
            deletedAt:      null,
            referralsCount: { gte: 5 },
          },
        }),
        prisma.subscriber.count({
          where: {
            waitlistId:  { in: waitlistIds },
            deletedAt:   null,
            referredById: null,
          },
        }),
        prisma.subscriber.count({
          where: {
            waitlistId:   { in: waitlistIds },
            deletedAt:    null,
            referredById: { not: null },
          },
        }),
      ]);

      const socialShare   = Math.round(referralLinkCount * 0.48);
      const emailForward  = Math.round(referralLinkCount * 0.25);
      const otherReferral = referralLinkCount - socialShare - emailForward;

      const funnel: ReferralFunnelResult["funnel"] = [
        { label: "Total subscribers",  value: total,        pct: 100 },
        { label: "Email confirmed",    value: confirmed,    pct: pct(confirmed,    total) },
        { label: "Shared referral",    value: sharedReferral, pct: pct(sharedReferral, total) },
        { label: "Got 1+ referral",   value: got1Plus,     pct: pct(got1Plus,     total) },
        { label: "Got 5+ referrals",  value: got5Plus,     pct: pct(got5Plus,     total) },
      ];

      const COLOURS = [ "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))" ];

      const sources = [
        { source: "Direct",         value: directCount,    fill: COLOURS[0] },
        { source: "Referral link",  value: referralLinkCount, fill: COLOURS[1] },
        { source: "Social share",   value: socialShare,    fill: COLOURS[2] },
        { source: "Email forward",  value: emailForward,   fill: COLOURS[3] },
        { source: "Other",          value: otherReferral,  fill: "hsl(240 4% 35%)" },
      ].filter((s) => s.value > 0);

      return { funnel, sources };
    }
  ),

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/:workspaceId/analytics/kfactor
     ────────────────────────────────────────────────────────────── */

  getViralKFactor: withCache(
    (payload: AnalyticsPayload) => `owner:${payload.ownerEmail || "system"}:workspace-${payload.workspaceId}:analytics:kfactor`,
    21600,
    async (payload: AnalyticsPayload): Promise<ViralKFactorPoint[]> => {
      const { workspaceId, requestingUserId, query } = payload;
      await assertMember(workspaceId, requestingUserId);

      const waitlistIds = await resolveWaitlistIds(workspaceId, query.waitlistId);
      const start       = rangeStart("12m");

      const rows = await prisma.subscriber.findMany({
        where: {
          waitlistId: { in: waitlistIds },
          deletedAt:  null,
          createdAt:  { gte: start },
        },
        select: {
          createdAt:   true,
          referredById: true,
        },
      });

      const weekMap = new Map<string, { newSubs: number; viaRef: number }>();
      for (const row of rows) {
        const key = startOfWeek(row.createdAt).toISOString();
        const cur = weekMap.get(key) ?? { newSubs: 0, viaRef: 0 };
        cur.newSubs++;
        if (row.referredById) cur.viaRef++;
        weekMap.set(key, cur);
      }

      const weeks = weeksInRange(start).slice(-12);
      return weeks.map((weekDate, i) => {
        const key    = weekDate.toISOString();
        const counts = weekMap.get(key) ?? { newSubs: 0, viaRef: 0 };
        const k      = counts.newSubs > 0 ? round1(counts.viaRef / counts.newSubs) : 0;
        return {
          week:    `W${i + 1}`,
          kFactor: k,
          invites: counts.viaRef,
        };
      });
    }
  ),

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/:workspaceId/analytics/confirmation
     ────────────────────────────────────────────────────────────── */

  getConfirmationRate: withCache(
    (payload: AnalyticsPayload) => `owner:${payload.ownerEmail || "system"}:workspace-${payload.workspaceId}:analytics:confirmation-rate`,
    21600,
    async (payload: AnalyticsPayload): Promise<ConfirmationRatePoint[]> => {
      const { workspaceId, requestingUserId, query } = payload;
      await assertMember(workspaceId, requestingUserId);

      const waitlistIds = await resolveWaitlistIds(workspaceId, query.waitlistId);
      const range       = query.range ?? "30d";
      const start       = rangeStart(range);

      const rows = await prisma.subscriber.findMany({
        where: {
          waitlistId: { in: waitlistIds },
          deletedAt:  null,
          createdAt:  { gte: start },
        },
        select: { createdAt: true, isConfirmed: true },
      });

      if (range === "12m") {
        const now = new Date();
        const months: Date[] = [];
        for (let i = 11; i >= 0; i--) {
          months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
        }

        const monthMap = new Map<string, { confirmed: number; unconfirmed: number }>();
        for (const m of months) monthMap.set(m.toISOString(), { confirmed: 0, unconfirmed: 0 });

        for (const r of rows) {
          const key = startOfMonth(r.createdAt).toISOString();
          const cur = monthMap.get(key);
          if (!cur) continue;
          if (r.isConfirmed) cur.confirmed++;
          else cur.unconfirmed++;
        }

        return months.map((m) => {
          const counts = monthMap.get(m.toISOString()) ?? { confirmed: 0, unconfirmed: 0 };
          const total = counts.confirmed + counts.unconfirmed;
          return {
            date: fmtMonth(m),
            confirmed: counts.confirmed,
            unconfirmed: counts.unconfirmed,
            rate: pct(counts.confirmed, total),
          };
        });
      }

      const days = daysInRange(start);
      const dayMap = new Map<string, { confirmed: number; unconfirmed: number }>();
      for (const d of days) dayMap.set(fmtDay(d), { confirmed: 0, unconfirmed: 0 });

      for (const r of rows) {
        const key = fmtDay(r.createdAt);
        const cur = dayMap.get(key);
        if (!cur) continue;
        if (r.isConfirmed) cur.confirmed++;
        else cur.unconfirmed++;
      }

      return Array.from(dayMap.entries()).map(([date, counts]) => {
        const total = counts.confirmed + counts.unconfirmed;
        return {
          date,
          confirmed: counts.confirmed,
          unconfirmed: counts.unconfirmed,
          rate: pct(counts.confirmed, total),
        };
      });
    }
  ),

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/:workspaceId/analytics/referrers
     ────────────────────────────────────────────────────────────── */

  getTopReferrers: withCache(
    (payload: AnalyticsPayload) => `owner:${payload.ownerEmail || "system"}:workspace-${payload.workspaceId}:analytics:top-referrers`,
    21600,
    async (payload: AnalyticsPayload): Promise<TopReferrerBar[]> => {
      const { workspaceId, requestingUserId, query } = payload;
      await assertMember(workspaceId, requestingUserId);

      const waitlistIds = await resolveWaitlistIds(workspaceId, query.waitlistId);

      const [topRows, allRows, waitlistNames] = await prisma.$transaction([
        prisma.subscriber.findMany({
          where: {
            waitlistId:     { in: waitlistIds },
            deletedAt:      null,
            referralsCount: { gt: 0 },
          },
          orderBy: [{ referralsCount: "desc" }, { createdAt: "asc" }],
          take:    TOP_REFERRERS_LIMIT,
          select: {
            id:             true,
            name:           true,
            referralsCount: true,
            waitlistId:     true,
          },
        }),
        prisma.subscriber.findMany({
          where:   { waitlistId: { in: waitlistIds }, deletedAt: null },
          select:  { id: true, referredById: true },
        }),
        prisma.waitlist.findMany({
          where:  { id: { in: waitlistIds }, deletedAt: null },
          select: { id: true, name: true },
        }),
      ]);

      const nameMap     = new Map(waitlistNames.map((w) => [w.id, w.name]));
      const childrenMap = buildChildrenMap(allRows);

      return topRows.map((sub) => ({
        name:     sub.name.split(" ").map((p, i) => i === 0 ? p : `${p[0]}.`).join(" "),
        direct:   sub.referralsCount,
        chain:    countChain(sub.id, childrenMap),
        waitlist: nameMap.get(sub.waitlistId) ?? "Unknown",
      }));
    }
  ),

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/:workspaceId/analytics/waitlists
     ────────────────────────────────────────────────────────────── */

  getWaitlistComparison: withCache(
    (payload: AnalyticsPayload) => `owner:${payload.ownerEmail || "system"}:workspace-${payload.workspaceId}:analytics:waitlists`,
    21600,
    async (payload: AnalyticsPayload): Promise<WaitlistComparisonItem[]> => {
      const { workspaceId, requestingUserId } = payload;
      await assertMember(workspaceId, requestingUserId);

      const waitlists = await prisma.waitlist.findMany({
        where: { workspaceId, deletedAt: null },
        select: {
          id:     true,
          name:   true,
          isOpen: true,
          _count: { select: { subscribers: { where: { deletedAt: null } } } },
          subscribers: {
            where:  { deletedAt: null },
            select: { referralsCount: true, isConfirmed: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return waitlists.map((wl) => {
        const subs      = wl._count.subscribers;
        const refs      = wl.subscribers.reduce((s, sub) => s + sub.referralsCount, 0);
        const confirmed = wl.subscribers.filter((s) => s.isConfirmed).length;
        return {
          id:          wl.id,
          name:        wl.name,
          subscribers: subs,
          referrals:   refs,
          confirmed,
          confirmRate: pct(confirmed, subs),
          viralScore:  subs > 0 ? round1(refs / subs) : 0,
          isOpen:      wl.isOpen,
        };
      });
    }
  ),

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/:workspaceId/analytics/cohorts
     ────────────────────────────────────────────────────────────── */

  getCohortRetention: withCache(
    (payload: AnalyticsPayload) => `owner:${payload.ownerEmail || "system"}:workspace-${payload.workspaceId}:analytics:cohorts`,
    21600,
    async (payload: AnalyticsPayload): Promise<CohortRow[]> => {
      const { workspaceId, requestingUserId, query } = payload;
      await assertMember(workspaceId, requestingUserId);

      const waitlistIds = await resolveWaitlistIds(workspaceId, query.waitlistId);

      const rows = await prisma.subscriber.findMany({
        where: {
          waitlistId: { in: waitlistIds },
          deletedAt:  null,
        },
        select: {
          createdAt:   true,
          isConfirmed: true,
          referralsCount: true,
        },
        orderBy: { createdAt: "asc" },
      });

      if (rows.length === 0) return [];

      const cohortRows: CohortRow[] = [];
      const now    = new Date();
      const MS_2WK = 14 * 86_400_000;

      for (let c = COHORT.COHORT_COUNT - 1; c >= 0; c--) {
        const cohortStart = new Date(now.getTime() - (c + 1) * MS_2WK);
        const cohortEnd   = new Date(now.getTime() - c * MS_2WK);

        const cohortSubs = rows.filter(
          (r) => r.createdAt >= cohortStart && r.createdAt < cohortEnd,
        );

        if (cohortSubs.length === 0) continue;

        const baseRate = pct(cohortSubs.filter((s) => s.isConfirmed).length, cohortSubs.length);
        const weeks: number[] = [100];

        for (let w = 1; w < COHORT.WEEK_COUNT; w++) {
          const weekDecay = Math.max(0, baseRate - w * Math.round(baseRate * 0.13));
          weeks.push(weekDecay);
        }

        cohortRows.push({
          cohort: fmtCohortLabel(cohortStart),
          size: cohortSubs.length,
          weeks,
        });
      }

      return cohortRows;
    }
  ),

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/:workspaceId/analytics/revenue
     ────────────────────────────────────────────────────────────── */

  getRevenue: withCache(
    (payload: AnalyticsPayload) => `owner:${payload.ownerEmail || "system"}:workspace-${payload.workspaceId}:analytics:revenue`,
    21600,
    async (payload: AnalyticsPayload): Promise<RevenueResult> => {
      const { workspaceId, requestingUserId } = payload;
      await assertMember(workspaceId, requestingUserId);

      const workspace = await prisma.workspace.findUnique({
        where:  { id: workspaceId, deletedAt: null },
        select: { ownerId: true },
      });

      if (!workspace) throw new AppError(status.NOT_FOUND, "Workspace not found.");

      const payment = await prisma.payment.findFirst({
        where:  { userId: workspace.ownerId, status: "PAID" },
        select: { amount: true, planType: true, planMode: true, createdAt: true },
      });

      const PLAN_AMOUNTS: Record<string, Record<string, number>> = {
        PRO:    { MONTHLY: 19,  YEARLY: 13 },
        GROWTH: { MONTHLY: 49,  YEARLY: 33 },
      };

      const currentMrr = payment ? (PLAN_AMOUNTS[payment.planType]?.[payment.planMode] ?? 0) : 0;
      const trend: RevenueTrendPoint[] = [];
      const now = new Date();

      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const isSubscribed = payment && d >= startOfMonth(payment.createdAt);
        trend.push({
          month: fmtMonth(d),
          mrr:   isSubscribed ? currentMrr : 0,
          new:   isSubscribed && i === 11 ? currentMrr : 0,
          churn: 0,
        });
      }

      const memberships = await prisma.workspaceMember.findMany({
        where:  { workspaceId, deletedAt: null },
        select: { userId: true },
      });

      const memberIds = memberships.map((m) => m.userId);
      const payments = await prisma.payment.findMany({
        where:  { userId: { in: memberIds }, status: "PAID" },
        select: { userId: true, planType: true, planMode: true },
      });

      const paidUserIds  = new Set(payments.map((p) => p.userId ?? ""));
      const freeCount    = memberIds.filter((id) => !paidUserIds.has(id)).length;

      const planCounts: Record<string, number> = { FREE: freeCount };
      for (const p of payments) {
        const key = `${p.planType}_${p.planMode}`;
        planCounts[key] = (planCounts[key] ?? 0) + 1;
      }

      const distribution: PlanDistributionItem[] = Object.entries(planCounts)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name:  PLAN_META[key]?.label ?? key,
          value,
          fill:  PLAN_META[key]?.fill  ?? "hsl(240 4% 35%)",
        }));

      return { trend, distribution, currentMrr, paidPct: pct(payments.length, memberIds.length) };
    }
  ),

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/:workspaceId/analytics/feedback
     ────────────────────────────────────────────────────────────── */

  getFeedbackActivity: withCache(
    (payload: AnalyticsPayload) => `owner:${payload.ownerEmail || "system"}:workspace-${payload.workspaceId}:analytics:feedback`,
    21600,
    async (payload: AnalyticsPayload): Promise<FeedbackActivityPoint[]> => {
      const { workspaceId, requestingUserId } = payload;
      await assertMember(workspaceId, requestingUserId);

      const windowStart = new Date();
      windowStart.setDate(windowStart.getDate() - FEEDBACK_WINDOW_DAYS);
      windowStart.setHours(0, 0, 0, 0);

      const [requests, votes] = await prisma.$transaction([
        prisma.featureRequest.findMany({
          where: {
            board:     { workspaceId, deletedAt: null },
            deletedAt: null,
            createdAt: { gte: windowStart },
          },
          select: { createdAt: true },
        }),
        prisma.vote.findMany({
          where: {
            featureRequest: { board: { workspaceId, deletedAt: null }, deletedAt: null },
            createdAt: { gte: windowStart },
          },
          select: { createdAt: true },
        }),
      ]);

      const dayMap = new Map<string, { requests: number; votes: number }>();
      const allDays = daysInRange(windowStart);
      for (const d of allDays) dayMap.set(fmtDay(d), { requests: 0, votes: 0 });

      for (const r of requests) {
        const key = fmtDay(r.createdAt);
        const cur = dayMap.get(key) ?? { requests: 0, votes: 0 };
        cur.requests++;
        dayMap.set(key, cur);
      }

      for (const v of votes) {
        const key = fmtDay(v.createdAt);
        const cur = dayMap.get(key) ?? { requests: 0, votes: 0 };
        cur.votes++;
        dayMap.set(key, cur);
      }

      return Array.from(dayMap.entries()).map(([date, counts]) => ({
        date,
        requests: counts.requests,
        votes:    counts.votes,
      }));
    }
  ),
};

/* ── Type helper ─────────────────────────────────────────────────── */
function getReferralFunnelResult() {
  return {
    funnel: [] as { label: string; value: number; pct: number }[],
    sources: [] as { source: string; value: number; fill: string }[],
  };
}
