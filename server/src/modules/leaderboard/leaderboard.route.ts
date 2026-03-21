import { Router } from "express";
import { leaderboardController } from "./leaderboard.controller";
import { validateRequest, validateQuery } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { getLeaderboardQuerySchema } from "./leaderboard.validation";
import { Role } from "../../constraint/index";

const router = Router({ mergeParams: true });

/**
 * All leaderboard routes require an authenticated workspace member.
 * The workspaceId is injected via the parent router:
 *
 *   app.use("/api/workspaces/:workspaceId/waitlists/:waitlistId/leaderboard", leaderboardRouter)
 *
 * Routes:
 *   GET /api/workspaces/:workspaceId/waitlists/:waitlistId/leaderboard/full
 */

router
  .route("/full")
  .get(
    checkAuth(Role.USER, Role.OWNER, Role.ADMIN),
    // validateQuery(getLeaderboardQuerySchema),
    leaderboardController.getLeaderboard,
  );

export const leaderboardRouter = router;
