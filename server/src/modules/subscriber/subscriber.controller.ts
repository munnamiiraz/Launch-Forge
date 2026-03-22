import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { subscriberService } from "./subscriber.service";
import { SUBSCRIBER_MESSAGES } from "./subscriber.constants";
import { GetSubscribersQuery, GetLeaderboardQuery } from "./subscriber.interface";

export const subscriberController = {

  /* ── GET /api/waitlists/:id/subscribers ──────────────────────── */

  async getSubscribers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const waitlistId       = req.params.id;
      const workspaceId      = req.params.workspaceId;
      const requestingUserId = req.user!.id;

      // Query params coerced and validated by validateRequest
      const query = req.query as unknown as GetSubscribersQuery;

      const result = await subscriberService.getSubscribers({
        waitlistId: waitlistId as string,
        workspaceId: workspaceId as string,
        requestingUserId: requestingUserId as string,
        query,
      });

      res.status(status.OK).json({
        success: true,
        message: SUBSCRIBER_MESSAGES.FETCHED,
        data:    result.data,
        meta:    result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── GET /api/waitlists/:id/leaderboard ──────────────────────── */

  async getLeaderboard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const waitlistId       = req.params.id;
      const workspaceId      = req.params.workspaceId;
      const requestingUserId = req.user!.id;

      const query = req.query as unknown as GetLeaderboardQuery;

      const result = await subscriberService.getLeaderboard({
        waitlistId: waitlistId as string,
        workspaceId: workspaceId as string,
        requestingUserId: requestingUserId as string,
        query,
      });

      res.status(status.OK).json({
        success: true,
        message: SUBSCRIBER_MESSAGES.LEADERBOARD,
        data:    result.data,
        meta: {
          totalReferrals:   result.totalReferrals,
          totalSubscribers: result.totalSubscribers,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};