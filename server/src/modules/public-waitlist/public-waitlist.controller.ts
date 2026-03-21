import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { publicWaitlistService } from "./public-waitlist.service";
import { PUBLIC_WAITLIST_MESSAGES } from "./public-waitlist.constants";

export const publicWaitlistController = {

  /* ── GET /api/public/waitlist/:slug ──────────────────────────── */

  async getPublicWaitlist(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { slug } = req.params;

      const pageData = await publicWaitlistService.getPublicWaitlist({ slug : slug as string });

      res.status(status.OK).json({
        success: true,
        message: PUBLIC_WAITLIST_MESSAGES.PAGE_FETCHED,
        data:    pageData,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── POST /api/public/waitlist/:slug/join ────────────────────── */

  async joinWaitlist(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { slug } = req.params;
      // name, email, referralCode come from the validated body
      const { name, email, referralCode } = req.body;

      const confirmation = await publicWaitlistService.joinWaitlist({
        slug: slug as string,
        name,
        email,
        referralCode,
      });

      const message = confirmation.alreadyJoined
        ? PUBLIC_WAITLIST_MESSAGES.ALREADY_JOINED
        : PUBLIC_WAITLIST_MESSAGES.JOINED;

      res.status(status.OK).json({
        success: true,
        message,
        data:    confirmation,
      });
    } catch (error) {
      next(error);
    }
  },
};