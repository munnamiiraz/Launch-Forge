import { Router } from "express";
import { adminUsersController } from "./admin-user.controller";
import { validateRequest }      from "../../middlewares/validateRequest";
import { validateParams }       from "../../middlewares/validateParams";
import { checkAuth }            from "../../middlewares/checkAuth";
import {
  userIdParamSchema,
  getUsersQuerySchema,
  inviteUserSchema,
  bulkActionSchema,
} from "./admin-user.validation";
import { Role } from "../../constraint/index";

/**
 * Mount in app.ts:
 *
 *   import { adminUsersRouter } from "./modules/admin-users/route";
 *   app.use("/api/admin/users", adminUsersRouter);
 *
 * ─────────────────────────────────────────────────────────────────
 * All routes require ADMIN role.
 * ─────────────────────────────────────────────────────────────────
 *
 *  GET    /api/admin/users
 *    Paginated user list.
 *    ?search= ?status=ALL|ACTIVE|SUSPENDED|DELETED
 *    ?plan=ALL|FREE|PRO|GROWTH ?role=ALL|USER|ADMIN
 *    ?sortBy=name|createdAt|lastActiveAt|subscribers|waitlists
 *    ?sortOrder=asc|desc ?page=1 ?limit=10
 *
 *  GET    /api/admin/users/stats
 *    Stat strip: total/active/suspended/deleted/paid + plan counts.
 *    ⚠ Must be registered BEFORE /:userId to avoid "stats" being
 *      treated as a CUID param.
 *
 *  POST   /api/admin/users/invite
 *    Send invite email. Body: { email, role? }
 *    ⚠ Must be registered BEFORE /:userId.
 *
 *  POST   /api/admin/users/bulk/suspend
 *    Bulk suspend. Body: { userIds: string[] }
 *
 *  POST   /api/admin/users/bulk/delete
 *    Bulk soft-delete. Body: { userIds: string[] }
 *
 *  GET    /api/admin/users/:userId
 *    Full user detail for the drawer side-panel.
 *
 *  PATCH  /api/admin/users/:userId/suspend
 *    Suspend one user.
 *
 *  PATCH  /api/admin/users/:userId/reactivate
 *    Reactivate a suspended user.
 *
 *  PATCH  /api/admin/users/:userId/promote
 *    Promote user → ADMIN role.
 *
 *  PATCH  /api/admin/users/:userId/demote
 *    Demote admin → USER role.
 *
 *  DELETE /api/admin/users/:userId
 *    Soft-delete a user.
 */
const router = Router();

const admin = checkAuth(Role.ADMIN);

/* ── Static routes (must come BEFORE /:userId) ───────────────────── */
//TODO:
router
  .route("/")
  .get(admin, /*validateRequest(getUsersQuerySchema),*/ adminUsersController.getUsers);

router
  .route("/stats")
  .get(admin, adminUsersController.getUsersStats);

router
  .route("/invite")
  .post(admin, validateRequest(inviteUserSchema), adminUsersController.inviteUser);

router
  .route("/bulk/suspend")
  .post(admin, validateRequest(bulkActionSchema), adminUsersController.bulkSuspend);

router
  .route("/bulk/delete")
  .post(admin, validateRequest(bulkActionSchema), adminUsersController.bulkDelete);

/* ── Dynamic :userId routes ──────────────────────────────────────── */

router
  .route("/:userId")
  .get(admin, validateParams(userIdParamSchema), adminUsersController.getUserById)
  .delete(admin, validateParams(userIdParamSchema), adminUsersController.deleteUser);

router
  .route("/:userId/suspend")
  .patch(admin, validateParams(userIdParamSchema), adminUsersController.suspendUser);

router
  .route("/:userId/reactivate")
  .patch(admin, validateParams(userIdParamSchema), adminUsersController.reactivateUser);

router
  .route("/:userId/promote")
  .patch(admin, validateParams(userIdParamSchema), adminUsersController.promoteToAdmin);

router
  .route("/:userId/demote")
  .patch(admin, validateParams(userIdParamSchema), adminUsersController.demoteFromAdmin);

export const adminUsersRouter = router;