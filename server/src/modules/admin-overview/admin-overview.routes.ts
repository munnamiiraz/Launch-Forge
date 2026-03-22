import { Router } from "express";
import { adminOverviewController } from "./admin-overview.controller";
import { validateRequest }         from "../../middlewares/validateRequest";
import { checkAuth }               from "../../middlewares/checkAuth";
import { growthQuerySchema }        from "./admin-overview.validation";
import { Role }                    from "../../constraint/index";

/**
 * Mount in app.ts:
 *
 *   import { adminOverviewRouter } from "./modules/admin-overview/route";
 *   app.use("/api/admin/overview", adminOverviewRouter);
 *
 * ─────────────────────────────────────────────────────────────────
 * All routes require ADMIN role.
 * The checkAuth middleware verifies the JWT and sets req.user.
 * The service layer additionally checks user.role === "ADMIN".
 * ─────────────────────────────────────────────────────────────────
 *
 *  GET /api/admin/overview/kpis
 *    → 9 KPI cards + page header strip
 *    → AdminKpis
 *
 *  GET /api/admin/overview/revenue
 *    → 12-month platform MRR trend
 *    → RevenuePoint[]
 *
 *  GET /api/admin/overview/growth?range=7d|30d|90d
 *    → Daily user growth (total + paid + free)
 *    → UserGrowthPoint[]
 *
 *  GET /api/admin/overview/plans
 *    → Plan distribution — user count + MRR per plan
 *    → PlanBreakdownItem[]
 *
 *  GET /api/admin/overview/sources
 *    → Signup source breakdown (direct vs referral vs estimated channels)
 *    → SignupSourcePoint[]
 *
 *  GET /api/admin/overview/activity
 *    → Last 20 platform events (signups, upgrades, cancels, waitlists)
 *    → AdminActivity[]
 *
 *  GET /api/admin/overview/health
 *    → DB / Stripe / Email / API status + uptime + p99 latency
 *    → SystemHealth
 *
 *  GET /api/admin/overview/top-waitlists
 *    → Top 10 waitlists by subscriber count, platform-wide
 *    → TopWaitlist[]
 *
 *  GET /api/admin/overview/recent-users
 *    → Last 10 registered users with plan + usage stats
 *    → AdminRecentUser[]
 */
const router = Router();

const admin = checkAuth(Role.ADMIN);

router.get("/kpis",          admin, adminOverviewController.getKpis);
router.get("/revenue",       admin, adminOverviewController.getRevenueTrend);
router.get("/growth",        admin, /*validateRequest(growthQuerySchema), */ adminOverviewController.getUserGrowth);
router.get("/plans",         admin, adminOverviewController.getPlanBreakdown);
router.get("/sources",       admin, adminOverviewController.getSignupSources);
router.get("/activity",      admin, adminOverviewController.getRecentActivity);
router.get("/health",        admin, adminOverviewController.getSystemHealth);
router.get("/top-waitlists", admin, adminOverviewController.getTopWaitlists);
router.get("/recent-users",  admin, adminOverviewController.getRecentUsers);

export const adminOverviewRouter = router;