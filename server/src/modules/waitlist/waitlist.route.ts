import { Router } from "express";
import { waitlistController, waitlistByIdController } from "./waitlist.controller";
import { validateRequest, validateQuery } from "../../middlewares/validateRequest";
import { validateParams } from "../../middlewares/validateParams";
import { checkAuth } from "../../middlewares/checkAuth";
import { multerUpload } from "../../config/multer.config";
import {
  createWaitlistSchema,
  getWaitlistsQuerySchema,
  updateWaitlistStatusSchema,
  archiveWaitlistSchema,
  workspaceIdParamSchema,
  waitlistByIdParamSchema,
} from "./waitlist.validation";
import { Role } from "../../constraint/index";

const router = Router();

/* Lookup by ID/slug (NOT workspace-scoped) */
// NOTE: This must come BEFORE "/:workspaceId/:id" or "by-id" will be treated as a workspaceId.
router
  .route("/by-id/:id")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN, Role.USER),
    waitlistByIdController.getWaitlistByIdOnly,
  );

/**
 * Mounted under /api/v1/waitlists in IndexRoutes
 */

/* Collection-level (scoped by Workspace) */
router
  .route("/:workspaceId")
  .post(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(workspaceIdParamSchema),
    // Optional logo upload (multipart/form-data). If not multipart, multer skips.
    multerUpload.single("logo"),
    validateRequest(createWaitlistSchema),
    waitlistController.createWaitlist,
  )
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(workspaceIdParamSchema),
    validateQuery(getWaitlistsQuerySchema),
    waitlistController.getWaitlists,
  );

/* Status + archive operations (scoped by Workspace + ID) */
router
  .route("/:workspaceId/:id/status")
  .patch(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(waitlistByIdParamSchema),
    validateRequest(updateWaitlistStatusSchema),
    waitlistByIdController.updateWaitlistStatus,
  );

router
  .route("/:workspaceId/:id/archive")
  .patch(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(waitlistByIdParamSchema),
    validateRequest(archiveWaitlistSchema),
    waitlistByIdController.setWaitlistArchived,
  );

/* Item-level (scoped by Workspace + ID) */
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

