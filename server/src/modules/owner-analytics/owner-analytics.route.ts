import { Router } from "express";
import { analyticsController } from "./owner-analytics.controller";
import { validateQuery }       from "../../middlewares/validateRequest";
import { validateParams }      from "../../middlewares/validateParams";
import { checkAuth }           from "../../middlewares/checkAuth";
import {
  analyticsParamSchema,
  analyticsQuerySchema,
} from "./owner-analytics.validation";
import { Role } from "../../constraint/index";

/**
 * Mount in app.ts:
 *
 *   import { analyticsRouter } from "./modules/analytics/route";
 *   app.use("/api/workspaces/:workspaceId/analytics", analyticsRouter);
 *
 * ─────────────────────────────────────────────────────────────────
 * All routes require auth (workspace member).
 * All support ?range=7d|30d|90d|12m and optional ?waitlistId=
 * ─────────────────────────────────────────────────────────────────
 *
 *  GET /api/workspaces/:workspaceId/analytics/summary
 *    KPI strip — totalSubscribers, totalReferrals, avgViralScore,
 *    confirmationRate, MRR, feedbackItems + period deltas
 *
 *  GET /api/workspaces/:workspaceId/analytics/growth
 *    Subscriber growth time-series (daily new + cumulative + referrals)
 *
 *  GET /api/workspaces/:workspaceId/analytics/funnel
 *    Referral funnel steps + signup source breakdown donut
 *
 *  GET /api/workspaces/:workspaceId/analytics/kfactor
 *    Weekly viral k-factor chart (last 12 weeks)
 *
 *  GET /api/workspaces/:workspaceId/analytics/referrers
 *    Top 10 referrers with direct + chain counts
 *
 *  GET /api/workspaces/:workspaceId/analytics/waitlists
 *    Per-waitlist comparison table
 *
 *  GET /api/workspaces/:workspaceId/analytics/cohorts
 *    Subscriber cohort retention heatmap (bi-weekly, 7 weeks)
 *
 *  GET /api/workspaces/:workspaceId/analytics/revenue
 *    MRR trend (12 months) + plan distribution donut
 *
 *  GET /api/workspaces/:workspaceId/analytics/feedback
 *    Daily feature requests + votes (last 30 days)
 */
const router = Router({ mergeParams: true });

const auth    = checkAuth(Role.OWNER, Role.ADMIN);
const params  = validateParams(analyticsParamSchema);
const qparams = validateQuery(analyticsQuerySchema);

router.get("/summary",   auth, params, /*qparams,*/ analyticsController.getSummary);
router.get("/growth",    auth, params, /*qparams,*/ analyticsController.getSubscriberGrowth);
router.get("/funnel",    auth, params, /*qparams,*/ analyticsController.getReferralFunnel);
router.get("/kfactor",   auth, params, /*qparams,*/ analyticsController.getViralKFactor);
router.get("/confirmation", auth, params, /*qparams,*/ analyticsController.getConfirmationRate);
router.get("/referrers", auth, params, /*qparams,*/ analyticsController.getTopReferrers);
router.get("/waitlists", auth, params, /*qparams,*/ analyticsController.getWaitlistComparison);
router.get("/cohorts",   auth, params, /*qparams,*/ analyticsController.getCohortRetention);
router.get("/revenue",   auth, params, /*qparams,*/ analyticsController.getRevenue);
router.get("/feedback",  auth, params, /*qparams,*/ analyticsController.getFeedbackActivity);

export const analyticsRouter = router;
