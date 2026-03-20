import { Router } from "express";
import { waitlistController, waitlistByIdController } from "./waitlist.controller";
import { 
  validateRequest, 
  validateQuery 
} from "../../middlewares/validateRequest";
import { validateParams } from "../../middlewares/validateParams";
import { checkAuth } from "../../middlewares/checkAuth";
import { 
  createWaitlistSchema, 
  getWaitlistsQuerySchema,
  workspaceIdParamSchema,
  waitlistByIdParamSchema 
} from "./waitlist.validation";
import { Role } from "../../constraint/index";

const router = Router();

/**
 * Mounted under /api/v1/waitlists in IndexRoutes
 */

/* ── Collection-level (scoped by Workspace) ───────────────────────── */
router
  .route("/:workspaceId")
  .post(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(workspaceIdParamSchema),
    validateRequest(createWaitlistSchema),
    waitlistController.createWaitlist,
  )
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(workspaceIdParamSchema),
    // validateQuery(getWaitlistsQuerySchema),
    waitlistController.getWaitlists,
  );

/* ── Item-level (scoped by Workspace + ID) ────────────────────────── */
router
  .route("/:workspaceId/:id")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(waitlistByIdParamSchema),
    waitlistByIdController.getWaitlistById,
  )
  .delete(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(waitlistByIdParamSchema),
    waitlistByIdController.deleteWaitlist,
  );

export const waitlistRouter = router;
export const waitlistByIdRouter = router; // Keep for compatibility but redundant