import { Router } from "express";
import { analyticsController } from "./owner-analytics.controller";
import { validateQuery }       from "../../middlewares/validateRequest";
import { validateParams }      from "../../middlewares/validateParams";
import { checkAuth }           from "../../middlewares/checkAuth";
import { checkPlanFeature }    from "../../middlewares/checkPlanFeature";
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
 * All routes require auth (workspace member) + Pro plan or higher.
 * All support ?range=7d|30d|90d|12m and optional ?waitlistId=
 * ─────────────────────────────────────────────────────────────────
 */
const router = Router({ mergeParams: true });

const auth    = checkAuth(Role.OWNER, Role.ADMIN);
const params  = validateParams(analyticsParamSchema);
const planGate = checkPlanFeature("analytics");

router.get("/summary",      auth, params, planGate, analyticsController.getSummary);
router.get("/growth",       auth, params, planGate, analyticsController.getSubscriberGrowth);
router.get("/funnel",       auth, params, planGate, analyticsController.getReferralFunnel);
router.get("/kfactor",      auth, params, planGate, analyticsController.getViralKFactor);
router.get("/confirmation", auth, params, planGate, analyticsController.getConfirmationRate);
router.get("/referrers",    auth, params, planGate, analyticsController.getTopReferrers);
router.get("/waitlists",    auth, params, planGate, analyticsController.getWaitlistComparison);
router.get("/cohorts",      auth, params, planGate, analyticsController.getCohortRetention);
router.get("/revenue",      auth, params, planGate, analyticsController.getRevenue);
router.get("/feedback",     auth, params, planGate, analyticsController.getFeedbackActivity);

export const analyticsRouter = router;

