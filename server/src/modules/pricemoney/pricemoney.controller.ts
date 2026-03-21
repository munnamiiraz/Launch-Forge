import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { prizeService }   from "./pricemoney.service";
import { PRIZE_MESSAGES } from "./pricemoney.constant";

export const prizeController = {

  /* ──────────────────────────────────────────────────────────────
     POST /api/prizes
     ────────────────────────────────────────────────────────────── */

  async createPrize(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requestingUserId = req.user!.id;
      const {
        waitlistId, workspaceId, title, description,
        prizeType, value, currency, rankFrom, rankTo,
        imageUrl, expiresAt,
      } = req.body;

      const prize = await prizeService.createPrize({
        waitlistId, workspaceId, requestingUserId,
        title, description, prizeType, value, currency,
        rankFrom, rankTo, imageUrl, expiresAt,
      });

      res.status(status.CREATED).json({
        success: true,
        message: PRIZE_MESSAGES.CREATED,
        data:    prize,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ──────────────────────────────────────────────────────────────
     PATCH /api/prizes/:id
     ────────────────────────────────────────────────────────────── */

  async updatePrize(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const prizeId          = req.params.id;
      const requestingUserId = req.user!.id;
      const {
        workspaceId, waitlistId, title, description,
        prizeType, value, currency, rankFrom, rankTo,
        imageUrl, expiresAt, status: prizeStatus,
      } = req.body;

      const prize = await prizeService.updatePrize({
        prizeId: prizeId as string, waitlistId, workspaceId, requestingUserId,
        title, description, prizeType, value, currency,
        rankFrom, rankTo, imageUrl, expiresAt,
        status: prizeStatus,
      });

      res.status(status.OK).json({
        success: true,
        message: PRIZE_MESSAGES.UPDATED,
        data:    prize,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ──────────────────────────────────────────────────────────────
     DELETE /api/prizes/:id
     ────────────────────────────────────────────────────────────── */

  async deletePrize(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const prizeId          = req.params.id;
      const requestingUserId = req.user!.id;
      const { workspaceId, waitlistId } = req.body;

      const ack = await prizeService.deletePrize({
        prizeId: prizeId as string, waitlistId, workspaceId, requestingUserId,
      });

      res.status(status.OK).json({
        success: true,
        message: PRIZE_MESSAGES.DELETED,
        data:    ack,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/prizes/waitlist/:waitlistId  (authenticated)
     ────────────────────────────────────────────────────────────── */

  async getPrizes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const waitlistId       = req.params.waitlistId;
      const requestingUserId = req.user!.id;
      const workspaceId      = req.query.workspaceId as string;

      const prizes = await prizeService.getPrizes({
        waitlistId: waitlistId as string, workspaceId, requestingUserId,
      });

      res.status(status.OK).json({
        success: true,
        message: PRIZE_MESSAGES.FETCHED,
        data:    prizes,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/prizes/public/:waitlistId  (no auth)
     ────────────────────────────────────────────────────────────── */

  async getPublicPrizes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const waitlistId = req.params.waitlistId;

      const prizes = await prizeService.getPublicPrizes({ waitlistId: waitlistId as string });

      res.status(status.OK).json({
        success: true,
        message: PRIZE_MESSAGES.PUBLIC_FETCHED,
        data:    prizes,
      });
    } catch (error) {
      next(error);
    }
  },
};