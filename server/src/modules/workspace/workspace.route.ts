import { Router } from "express";
import { workspaceController }   from "./workspace.controller";
import { validateRequest }       from "../../middlewares/validateRequest";
import { validateParams }        from "../../middlewares/validateParams";
import { checkAuth }             from "../../middlewares/checkAuth";
import {
  workspaceIdParamSchema,
  memberIdParamSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  getWorkspacesQuerySchema,
  getMembersQuerySchema,
  addMemberSchema,
} from "./workspace.validation";
import  { Role } from "../../constraint/index";

/**
 * Mount in app.ts:
 *
 *   import { workspaceRouter } from "./modules/workspace/route";
 *   app.use("/api/workspaces", workspaceRouter);
 *
 * Resulting routes:
 *
 *   POST   /api/workspaces                                → create workspace
 *   GET    /api/workspaces                                → list my workspaces
 *   GET    /api/workspaces/:workspaceId                   → get one workspace
 *   PATCH  /api/workspaces/:workspaceId                   → update workspace (owner only)
 *   DELETE /api/workspaces/:workspaceId                   → delete workspace (owner only)
 *   GET    /api/workspaces/:workspaceId/members           → list members
 *   POST   /api/workspaces/:workspaceId/members           → add member (owner only)
 *   DELETE /api/workspaces/:workspaceId/members/:memberId → remove member (owner only)
 */
const router = Router();

/* ── Workspace CRUD ──────────────────────────────────────────────── */

router
  .route("/")
  .post(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateRequest(createWorkspaceSchema),
    workspaceController.createWorkspace,
  )
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateRequest(getWorkspacesQuerySchema),
    workspaceController.getWorkspaces,
  );

router
  .route("/dashboard/overview")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    workspaceController.getDashboardOverview,
  );

router
  .route("/:workspaceId")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(workspaceIdParamSchema),
    workspaceController.getWorkspace,
  )
  .patch(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(workspaceIdParamSchema),
    validateRequest(updateWorkspaceSchema),
    workspaceController.updateWorkspace,
  )
  .delete(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(workspaceIdParamSchema),
    workspaceController.deleteWorkspace,
  );

/* ── Members ─────────────────────────────────────────────────────── */

router
  .route("/:workspaceId/members")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(workspaceIdParamSchema),
    validateRequest(getMembersQuerySchema),
    workspaceController.getMembers,
  )
  .post(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(workspaceIdParamSchema),
    validateRequest(addMemberSchema),
    workspaceController.addMember,
  );

router
  .route("/:workspaceId/members/:memberId")
  .delete(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(memberIdParamSchema),
    workspaceController.removeMember,
  );

export const workspaceRouter = router;