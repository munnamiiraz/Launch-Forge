import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { prisma }   from "../../lib/prisma";
import { leaderboardService }   from "./leaderboard.service";
import { LEADERBOARD_MESSAGES } from "./leaderboard.constants";
import { GetLeaderboardQuery, GetPublicLeaderboardQuery } from "./leaderboard.interface";

async function resolveOwnerEmail(workspaceId: string, defaultEmail: string) {
  if (!workspaceId || workspaceId === "undefined") return defaultEmail;
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { owner: { select: { email: true } } }
  });
  return ws?.owner?.email || defaultEmail;
}

export const leaderboardController = {

  /* ── GET /api/workspaces/:workspaceId/waitlists/:id/leaderboard/full ─ */

  async getLeaderboard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const waitlistId       = req.params.id;
      const workspaceId      = req.params.workspaceId;
      const requestingUserId = req.user!.id;
      const ownerEmail       = await resolveOwnerEmail(workspaceId as string, req.user!.email);

      // Query params already coerced + validated by validateRequest
      const query = req.query as unknown as GetLeaderboardQuery;

      const result = await leaderboardService.getLeaderboard({
        waitlistId: waitlistId as string,
        workspaceId: workspaceId as string,
        requestingUserId,
        ownerEmail,
        query,
      });

      res.status(status.OK).json({
        success: true,
        message: LEADERBOARD_MESSAGES.FETCHED,
        data:    result.data,
        meta:    result.meta,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  },
  async getPublicLeaderboard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { waitlistSlug } = req.params;
      const query = req.query as unknown as GetPublicLeaderboardQuery;

      const result = await leaderboardService.getPublicLeaderboard({
        waitlistSlug: waitlistSlug as string,
        query,
      });

      res.status(status.OK).json({
        success: true,
        message: LEADERBOARD_MESSAGES.FETCHED,
        data:    result.data,
        meta:    result.meta,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  },
  async getLeaderboardBySlug(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { waitlistSlug } = req.params;
      const requestingUserId = req.user!.id;
      const query = req.query as unknown as GetLeaderboardQuery;

      const result = await leaderboardService.getLeaderboardBySlug({
        waitlistSlug: waitlistSlug as string,
        requestingUserId,
        query,
      });

      res.status(status.OK).json({
        success: true,
        message: LEADERBOARD_MESSAGES.FETCHED,
        data:    result.data,
        meta:    result.meta,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── GET /api/workspaces/:workspaceId/waitlists/:id/leaderboard/:waitlistSlug (minimal) ─ */

  async getLeaderboardMinimal(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const waitlistId       = req.params.id;
      const workspaceId      = req.params.workspaceId;
      const { waitlistSlug } = req.params;
      const requestingUserId = req.user!.id;
      const ownerEmail       = await resolveOwnerEmail(workspaceId as string, req.user!.email);
      const query = req.query as unknown as GetLeaderboardQuery;

      const result = await leaderboardService.getMinimalLeaderboard({
        waitlistSlug: waitlistSlug as string,
        requestingUserId,
        ownerEmail,
        query,
      });

      res.status(status.OK).json({
        success: true,
        message: LEADERBOARD_MESSAGES.FETCHED,
        data:    result.data,
        meta:    result.meta,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  },

};