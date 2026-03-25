import { Router } from "express";
import { adminAnalyticsController }  from "./admin-analytics.controller";
import { validateRequest, validateQuery }   from "../../middlewares/validateRequest";
import { checkAuth }                 from "../../middlewares/checkAuth";
import { engagementRangeSchema }     from "./admin-analytics.validation";
import { Role }                      from "../../constraint/index";

/**
 * Mount in app.ts:
 *
 *   import { adminAnalyticsRouter } from "./modules/admin-analytics/route";
 *   app.use("/api/admin/analytics", adminAnalyticsRouter);
 *
 * ─────────────────────────────────────────────────────────────────
 * All routes require ADMIN role.
 * Every route is a GET — analytics is read-only.
 * ─────────────────────────────────────────────────────────────────
 *
 *  GET /api/admin/analytics/engagement
 *    6-card KPI strip: DAU · WAU · MAU · stickiness · sessions/user
 *    → EngagementStats
 *
 *  GET /api/admin/analytics/engagement/timeline?range=30d|60d
 *    Daily DAU + rolling WAU + new registrations time-series.
 *    → EngagementPoint[]
 *
 *  GET /api/admin/analytics/features
 *    % of workspaces using each product feature (Waitlists,
 *    Referral tracking, Public leaderboard, Feedback, Roadmap,
 *    Prizes, Changelog) with WoW delta.
 *    → FeatureAdoptionItem[]
 *
 *  GET /api/admin/analytics/subscribers
 *    12-month platform subscriber growth (monthly new + cumulative +
 *    referral vs direct split).
 *    → { data: PlatformSubscriberPoint[], stats: PlatformSubscriberStats }
 *
 *  GET /api/admin/analytics/waitlists
 *    Waitlist size distribution histogram + health stats
 *    (avg, median, p90, open/closed count).
 *    → { data: WaitlistHealthBucket[], stats: WaitlistHealthStats }
 *
 *  GET /api/admin/analytics/referrals
 *    12-month referral network timeline + platform-wide referral
 *    stats (total refs, k-factor, confirmed %, top referrer).
 *    → { data: ReferralNetworkPoint[], stats: ReferralStats }
 *
 *  GET /api/admin/analytics/feedback
 *    Feedback status breakdown donut + 30-day daily activity
 *    (requests/votes/comments) + aggregate stats.
 *    → { statusBreakdown, timeline, stats }
 *
 *  GET /api/admin/analytics/roadmap
 *    Roadmap item status distribution (Planned/In Progress/Completed)
 *    + stats (totalRoadmaps, completedPct etc.)
 *    → { data: RoadmapProgressItem[], stats: RoadmapStats }
 *
 *  GET /api/admin/analytics/changelog
 *    12-month changelog publishing trend (published vs drafts per month).
 *    → ChangelogPoint[]
 *
 *  GET /api/admin/analytics/heatmap
 *    Workspace activity heatmap: 7 days × 24 hours grid.
 *    Normalised 0–100 activity score from Session.createdAt (last 90d).
 *    → HeatmapCell[]
 */
const router = Router();

const admin = checkAuth(Role.ADMIN);

/* ── Engagement ──────────────────────────────────────────────────── */
router.get("/engagement",          admin, adminAnalyticsController.getEngagementStats);
router.get(
  "/engagement/timeline",
  admin,
  validateRequest(engagementRangeSchema),
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

export const adminAnalyticsRouter = router;