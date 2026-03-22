import { Router } from "express";
import { adminRevenueController } from "./admin-review.controller";
import { validateRequest }        from "../../middlewares/validateRequest";
import { checkAuth }              from "../../middlewares/checkAuth";
import { transactionsQuerySchema } from "./admin-review.validation";
import { Role } from "../../constraint/index";

/**
 * Mount in app.ts:
 *
 *   import { adminRevenueRouter } from "./modules/admin-revenue/route";
 *   app.use("/api/admin/revenue", adminRevenueRouter);
 *
 * ─────────────────────────────────────────────────────────────────
 * All routes require ADMIN role.
 * ─────────────────────────────────────────────────────────────────
 *
 *  GET /api/admin/revenue/kpis
 *    9-card KPI strip:
 *    MRR, ARR, New MRR, Churned MRR, Net New MRR, ARPU,
 *    Paying Users, Avg LTV, Avg Sub Length
 *    → RevenueKpis
 *
 *  GET /api/admin/revenue/waterfall
 *    12-month MRR waterfall area chart.
 *    cumulative MRR + new/expansion/churn/net per month.
 *    → MrrWaterfallPoint[]
 *
 *  GET /api/admin/revenue/plans
 *    Plan breakdown donut + churn-by-plan bar chart.
 *    Pro Mo / Pro Yr / Growth Mo / Growth Yr:
 *    users, MRR, ARR, avgPrice, churnPct
 *    → PlanRevenue[]
 *
 *  GET /api/admin/revenue/churn
 *    12-month churn analysis:
 *    churned users + churn rate + recovered per month
 *    → ChurnDataPoint[]
 *
 *  GET /api/admin/revenue/cohorts
 *    Cohort LTV heatmap — 6 monthly cohorts × M1/M3/M6/M12 MRR
 *    → CohortLtvRow[]
 *
 *  GET /api/admin/revenue/countries
 *    Revenue by country — users, MRR, % of total
 *    → RevenueByCountry[]
 *
 *  GET /api/admin/revenue/transactions
 *    Paginated + searchable + type-filtered transaction list.
 *    ?type=all|new|renewal|upgrade|downgrade|cancel|refund
 *    ?search= (name, email, plan, stripe ID)
 *    ?page=1 &limit=20
 *    → PaginatedTransactions { data, meta, totalRevenue }
 */
const router = Router();

const admin = checkAuth(Role.ADMIN);

router.get("/kpis",         admin, adminRevenueController.getKpis);
router.get("/waterfall",    admin, adminRevenueController.getMrrWaterfall);
router.get("/plans",        admin, adminRevenueController.getPlanRevenue);
router.get("/churn",        admin, adminRevenueController.getChurnAnalysis);
router.get("/cohorts",      admin, adminRevenueController.getCohortLtv);
router.get("/countries",    admin, adminRevenueController.getRevenueByCountry);
router.get(
  "/transactions",
  admin,
  // validateRequest(transactionsQuerySchema),
  adminRevenueController.getTransactions,
);

export const adminRevenueRouter = router;