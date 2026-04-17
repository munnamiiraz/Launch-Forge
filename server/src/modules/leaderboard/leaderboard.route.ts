import { Router } from "express";
import { leaderboardController }           from "./leaderboard.controller";
import { validateRequest, validateQuery }  from "../../middlewares/validateRequest";
import { checkAuth }                       from "../../middlewares/checkAuth";
import {
  getLeaderboardQuerySchema,
} from "./leaderboard.validation";
import { Role } from "../../constraint/index";
import { cacheMiddleware } from "../../middlewares/cache.middleware";

const router = Router({ mergeParams: true });

/**
 * Routes
 *
 * Private (workspace-scoped):
 *   GET /api/workspaces/:workspaceId/waitlists/:waitlistId/leaderboard/full
 *
 * Public (no auth):
 *   GET /api/leaderboard/:waitlistSlug
 *
 * Mount in app.ts:
 *   app.use("/api/workspaces/:workspaceId/waitlists/:waitlistId/leaderboard", leaderboardRouter);
 *   app.use("/api/leaderboard", leaderboardRouter);
 */

/* ── Private ─────────────────────────────────────────────────────── */
router
  .route("/full")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    // validateQuery(getLeaderboardQuerySchema),
    leaderboardController.getLeaderboard,
  );

/* ── Private by slug or ID (no /full suffix) ─────────────────────── */
router
  .route("/:waitlistSlug")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    leaderboardController.getLeaderboardMinimal,
  );

/* ── Private by slug (alternative path) ───────────────────────────── */
router
  .route("/by-slug/:waitlistSlug")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    leaderboardController.getLeaderboardBySlug,
  );

/* ── Public (at /leaderboard/:waitlistSlug from routes/index.ts) ─────── */
router
  .route("/public/:waitlistSlug")
  .get(
    // validateRequest(publicLeaderboardParamSchema),
    // validateQuery(getPublicLeaderboardQuerySchema),
    cacheMiddleware(30, "public_leaderboard"), // Cache for 30s
    leaderboardController.getPublicLeaderboard,
  );

export const leaderboardRouter = router;