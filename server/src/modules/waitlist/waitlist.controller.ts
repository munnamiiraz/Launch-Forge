import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { waitlistService, waitlistByIdService } from "./waitlist.service";
import { WAITLIST_MESSAGES, WAITLIST_BY_ID_MESSAGES } from "./waitlist.constants";
import { GetWaitlistsQuery } from "./waitlist.interface";

export const waitlistController = {
  /* ── POST /api/v1/waitlists/:workspaceId ────────────────────────── */

  async createWaitlist(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workspaceId       = req.params.workspaceId as string;
      const requestingUserId  = req.user!.id;
      const uploadedLogoUrl   = (req as any).file?.path as string | undefined;
      const logoUrl           = uploadedLogoUrl ?? (req.body as any)?.logoUrl;
      
      const waitlist = await waitlistService.createWaitlist({
        workspaceId,
        requestingUserId,
        ...req.body,
        logoUrl,
      });

      res.status(status.CREATED).json({
        success: true,
        message: WAITLIST_MESSAGES.CREATED,
        data:    waitlist,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── GET /api/v1/waitlists/:workspaceId ─────────────────────────── */

  async getWaitlists(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workspaceId      = req.params.workspaceId as string;
      const requestingUserId = req.user!.id;

      // Query params were already coerced by validateQuery
      const query = req.query as unknown as GetWaitlistsQuery;

      const result = await waitlistService.getWaitlists({
        workspaceId,
        requestingUserId,
        query,
      });

      res.status(status.OK).json({
        success: true,
        message: WAITLIST_MESSAGES.FETCHED,
        data:    result.data,
        meta:    result.meta,
      });
    } catch (error) {
      next(error);
    }
  },
};

export const waitlistByIdController = {
  /* ── GET /api/v1/waitlists/:workspaceId/:id ─────────────────────── */

  async getWaitlistById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const waitlistId       = req.params.id as string;
      const workspaceId      = req.params.workspaceId as string;
      const requestingUserId = req.user!.id;

      const waitlist = await waitlistByIdService.getWaitlistById({
        waitlistId,
        workspaceId,
        requestingUserId,
      });

      res.status(status.OK).json({
        success: true,
        message: WAITLIST_BY_ID_MESSAGES.FETCHED,
        data:    waitlist,
      });
    } catch (error) {
      next(error);
    }
  },

  async getWaitlistByIdOnly(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const waitlistId       = req.params.id as string;
      const requestingUserId = req.user!.id;

      const waitlist = await waitlistByIdService.getWaitlistByIdOnly({
        waitlistId,
        requestingUserId,
      });

      res.status(status.OK).json({
        success: true,
        message: WAITLIST_BY_ID_MESSAGES.FETCHED,
        data:    waitlist,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── DELETE /api/v1/waitlists/:workspaceId/:id ──────────────────── */

  async deleteWaitlist(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const waitlistId       = req.params.id as string;
      const workspaceId      = req.params.workspaceId as string;
      const requestingUserId = req.user!.id;

      const ack = await waitlistByIdService.deleteWaitlist({
        waitlistId,
        workspaceId,
        requestingUserId,
      });

      res.status(status.OK).json({
        success: true,
        message: WAITLIST_BY_ID_MESSAGES.DELETED,
        data:    ack,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── PATCH /api/v1/waitlists/:workspaceId/:id/status ───────────── */

  async updateWaitlistStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const waitlistId       = req.params.id as string;
      const workspaceId      = req.params.workspaceId as string;
      const requestingUserId = req.user!.id;
      const { isOpen }       = req.body as { isOpen: boolean };

      const updated = await waitlistByIdService.updateWaitlistStatus({
        waitlistId,
        workspaceId,
        requestingUserId,
        isOpen,
      });

      res.status(status.OK).json({
        success: true,
        message: WAITLIST_BY_ID_MESSAGES.STATUS_UPDATED,
        data:    updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── PATCH /api/v1/waitlists/:workspaceId/:id/archive ──────────── */

  async setWaitlistArchived(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const waitlistId       = req.params.id as string;
      const workspaceId      = req.params.workspaceId as string;
      const requestingUserId = req.user!.id;
      const { archived }     = req.body as { archived: boolean };

      const updated = await waitlistByIdService.setWaitlistArchived({
        waitlistId,
        workspaceId,
        requestingUserId,
        archived,
      });

      res.status(status.OK).json({
        success: true,
        message: archived ? WAITLIST_BY_ID_MESSAGES.ARCHIVED : WAITLIST_BY_ID_MESSAGES.UNARCHIVED,
        data:    updated,
      });
    } catch (error) {
      next(error);
    }
  },
};
