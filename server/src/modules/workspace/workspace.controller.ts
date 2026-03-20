import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { workspaceService }   from "./workspace.service";
import { WORKSPACE_MESSAGES } from "./workspace.constant";
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

      const overview = await workspaceService.getDashboardOverview({
        requestingUserId,
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

      res.status(status.OK).json({
        success: true,
        message: WORKSPACE_MESSAGES.MEMBER_REMOVED,
      });
    } catch (error) {
      next(error);
    }
  },
};