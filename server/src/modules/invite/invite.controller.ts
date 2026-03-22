import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { inviteService }   from "./invite.service";
import { INVITE_MESSAGES } from "./invite.constant";

export const inviteController = {

  /* ── POST /api/invite ────────────────────────────────────────── */

  async createInvite(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { waitlistId, subscriberId } = req.body;

      const result = await inviteService.createInvite({
        waitlistId,
        createdBySubscriberId: subscriberId,
      });

      res.status(status.CREATED).json({
        success: true,
        message: INVITE_MESSAGES.CREATED,
        data:    result,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── GET /api/invite/:inviteCode ─────────────────────────────── */

  async getInvite(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { inviteCode } = req.params;

      const result = await inviteService.getInvite({ inviteCode: inviteCode as string });

      res.status(status.OK).json({
        success: true,
        message: INVITE_MESSAGES.FETCHED,
        data:    result,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── POST /api/invite/:inviteCode/join ───────────────────────── */

  async joinViaInvite(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { inviteCode }    = req.params;
      const { name, email }   = req.body;

      const result = await inviteService.joinViaInvite({
        inviteCode: inviteCode as string,
        name,
        email,
      });

      /*
       * 200 OK for idempotent re-joins (alreadyJoined: true),
       * 201 Created for fresh joins.
       * The response body always has alreadyJoined so the frontend
       * can branch without caring about the status code.
       */
      const httpStatus = result.alreadyJoined
        ? status.OK
        : status.CREATED;

      res.status(httpStatus).json({
        success: true,
        message: result.alreadyJoined
          ? INVITE_MESSAGES.ALREADY_JOINED
          : INVITE_MESSAGES.JOINED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};