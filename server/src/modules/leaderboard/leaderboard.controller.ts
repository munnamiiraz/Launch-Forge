import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { leaderboardService }   from "./leaderboard.service";
import { LEADERBOARD_MESSAGES } from "./leaderboard.constants";
import { GetLeaderboardQuery }  from "./leaderboard.interface";

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

      // Query params already coerced + validated by validateRequest
      const query = req.query as unknown as GetLeaderboardQuery;

      const result = await leaderboardService.getLeaderboard({
        waitlistId: waitlistId as string,
        workspaceId: workspaceId as string,
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
};