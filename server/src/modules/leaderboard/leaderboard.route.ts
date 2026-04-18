import { Router } from "express";
import { leaderboardController }           from "./leaderboard.controller";
import { checkAuth }                       from "../../middlewares/checkAuth";
import { Role } from "../../constraint/index";

const router = Router({ mergeParams: true });

/* ── Private ─────────────────────────────────────────────────────── */
router
  .route("/full")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
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
    leaderboardController.getPublicLeaderboard,
  );

export const leaderboardRouter = router;