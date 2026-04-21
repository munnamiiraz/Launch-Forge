import { Router } from "express";
import { adminAnalyticsController }  from "./admin-analytics.controller";
import { validateQuery }   from "../../middlewares/validateRequest";
import { checkAuth }                 from "../../middlewares/checkAuth";
import { engagementRangeSchema }     from "./admin-analytics.validation";
import { Role }                      from "../../constraint/index";

/**
 * Mount in app.ts:
 *
 *   import { adminAnalyticsRouter } from "./modules/admin-analytics/route";
 *   app.use("/api/admin/analytics", adminAnalyticsRouter);
 */
const router = Router();

const admin = checkAuth(Role.ADMIN);

/* ── Engagement ──────────────────────────────────────────────────── */
router.get("/engagement",          admin, adminAnalyticsController.getEngagementStats);
router.get(
  "/engagement/timeline",
  admin,
  validateQuery(engagementRangeSchema),
  adminAnalyticsController.getEngagementTimeline,
);

/* ── Feature adoption ────────────────────────────────────────────── */
router.get("/features",    admin, adminAnalyticsController.getFeatureAdoption);

/* ── Subscriber & waitlist health ────────────────────────────────── */
router.get("/subscribers", admin, adminAnalyticsController.getPlatformSubscribers);
router.get("/waitlists",   admin, adminAnalyticsController.getWaitlistHealth);

/* ── Referral network ────────────────────────────────────────────── */
router.get("/referrals",   admin, adminAnalyticsController.getReferralNetwork);

/* ── Feedback & roadmap ──────────────────────────────────────────── */
router.get("/feedback",    admin, adminAnalyticsController.getFeedbackHealth);
router.get("/roadmap",     admin, adminAnalyticsController.getRoadmapProgress);

/* ── Content & activity ──────────────────────────────────────────── */
router.get("/changelog",   admin, adminAnalyticsController.getChangelogTimeline);
router.get("/heatmap",     admin, adminAnalyticsController.getWorkspaceHeatmap);

/* ── Infrastructure Monitoring ───────────────────────────────────── */
router.get("/infrastructure", admin, adminAnalyticsController.getInfrastructureHealth);
router.post("/infrastructure/retry", admin, adminAnalyticsController.retryQueueJobs);

export const adminAnalyticsRouter = router;