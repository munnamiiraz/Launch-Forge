import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { prisma } from "../../lib/prisma";
import { workspaceService }   from "./workspace.service";
import { WORKSPACE_MESSAGES } from "./workspace.constant";
import { auditLogger }      from "../../lib/auditLogger";
import {
  GetWorkspacesQuery,
  GetMembersQuery,
} from "./workspace.interface";

export const workspaceController = {

  /* ── POST /api/workspaces ────────────────────────────────────── */

  async createWorkspace(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requestingUserId = req.user!.id;
      const { name, slug, logo } = req.body;

      const workspace = await workspaceService.createWorkspace({
        requestingUserId,
        name,
        slug,
        logo,
      });

      await auditLogger.log(req, "WORKSPACE_CREATED", "Workspace", workspace.id, { name, slug });

      res.status(status.CREATED).json({
        success: true,
        message: WORKSPACE_MESSAGES.CREATED,
        data:    workspace,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── GET /api/workspaces ─────────────────────────────────────── */

  async getWorkspaces(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requestingUserId = req.user!.id;
      const query            = req.query as unknown as GetWorkspacesQuery;

      const result = await workspaceService.getWorkspaces({
        requestingUserId,
        query,
      });

      res.status(status.OK).json({
        success: true,
        message: WORKSPACE_MESSAGES.LIST_FETCHED,
        data:    result.data,
        meta:    result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── GET /api/workspaces/dashboard/overview ──────────────────── */

  async getDashboardOverview(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requestingUserId = req.user!.id;
      const { workspaceId, includeArchived } = req.query as {
        workspaceId?: string;
        includeArchived?: string;
      };

      // Resolve owner email for Redis partitioning
      let ownerEmail = req.user!.email;
      if (workspaceId && workspaceId !== "undefined") {
        const ws = await prisma.workspace.findUnique({
          where: { id: workspaceId },
          select: { owner: { select: { email: true } } }
        });
        if (ws?.owner?.email) ownerEmail = ws.owner.email;
      }

      const overview = await workspaceService.getDashboardOverview({
        requestingUserId,
        ownerEmail,
        workspaceId: workspaceId as string,
        includeArchived: includeArchived === "true",
      });

      res.status(status.OK).json({
        success: true,
        message: "Dashboard overview fetched successfully.",
        data:    overview,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── GET /api/workspaces/:workspaceId ────────────────────────── */

  async getWorkspace(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workspaceId      = req.params.workspaceId;
      const requestingUserId = req.user!.id;

      const workspace = await workspaceService.getWorkspace({
        workspaceId: workspaceId as string,
        requestingUserId: requestingUserId as string,
      });

      res.status(status.OK).json({
        success: true,
        message: WORKSPACE_MESSAGES.FETCHED,
        data:    workspace,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── PATCH /api/workspaces/:workspaceId ──────────────────────── */

  async updateWorkspace(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workspaceId      = req.params.workspaceId;
      const requestingUserId = req.user!.id;
      const { name, slug, logo } = req.body;

      const workspace = await workspaceService.updateWorkspace({
        workspaceId: workspaceId as string,
        requestingUserId: requestingUserId as string,
        name,
        slug,
        logo,
      });

      await auditLogger.log(req, "WORKSPACE_UPDATED", "Workspace", workspace.id, { name, slug });

      res.status(status.OK).json({
        success: true,
        message: WORKSPACE_MESSAGES.UPDATED,
        data:    workspace,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── DELETE /api/workspaces/:workspaceId ─────────────────────── */

  async deleteWorkspace(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workspaceId      = req.params.workspaceId;
      const requestingUserId = req.user!.id;

      await workspaceService.deleteWorkspace({
        workspaceId: workspaceId as string,
        requestingUserId: requestingUserId as string,
      });
      
      await auditLogger.log(req, "WORKSPACE_DELETED", "Workspace", workspaceId as string);

      res.status(status.OK).json({
        success: true,
        message: WORKSPACE_MESSAGES.DELETED,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── GET /api/workspaces/:workspaceId/members ────────────────── */

  async getMembers(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workspaceId      = req.params.workspaceId;
      const requestingUserId = req.user!.id;
      const query            = req.query as unknown as GetMembersQuery;

      const result = await workspaceService.getMembers({
        workspaceId: workspaceId as string,
        requestingUserId: requestingUserId as string,
        query,
      });

      res.status(status.OK).json({
        success: true,
        message: WORKSPACE_MESSAGES.MEMBERS_FETCHED,
        data:    result.data,
        meta:    result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── POST /api/workspaces/:workspaceId/members ───────────────── */

  async addMember(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workspaceId      = req.params.workspaceId;
      const requestingUserId = req.user!.id;
      const { email }        = req.body;

      const member = await workspaceService.addMember({
        workspaceId: workspaceId as string,
        requestingUserId: requestingUserId as string,
        email,
      });

      await auditLogger.log(req, "WORKSPACE_MEMBER_ADDED", "Workspace", workspaceId as string, { memberEmail: email });

      res.status(status.CREATED).json({
        success: true,
        message: WORKSPACE_MESSAGES.MEMBER_ADDED,
        data:    member,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── DELETE /api/workspaces/:workspaceId/members/:memberId ───── */

  async removeMember(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workspaceId      = req.params.workspaceId;
      const memberId         = req.params.memberId;
      const requestingUserId = req.user!.id;

      await workspaceService.removeMember({
        workspaceId: workspaceId as string,
        requestingUserId: requestingUserId as string,
        memberId: memberId as string,
      });

      await auditLogger.log(req, "WORKSPACE_MEMBER_REMOVED", "Workspace", workspaceId as string, { memberId });

      res.status(status.OK).json({
        success: true,
        message: WORKSPACE_MESSAGES.MEMBER_REMOVED,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── GET /api/workspaces/check-slug/:slug ───────────────────── */

  async checkSlugAvailability(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { slug } = req.params;

      const result = await workspaceService.checkSlugAvailability({ slug: slug as string });

      res.status(status.OK).json({
        success: true,
        message: result.available ? "Slug is available." : "Slug is already taken.",
        data:    result,
      });
    } catch (error) {
      next(error);
    }
  },
};
