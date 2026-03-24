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

  /* ── GET /api/public/waitlist/:slug/position ────────────────────── */

  async getSubscriberPosition(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { slug } = req.params;
      const { email } = req.query;

      if (!email || typeof email !== "string") {
        res.status(status.BAD_REQUEST).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      const result = await publicWaitlistService.getSubscriberPosition({
        slug: slug as string,
        email: email as string,
      });

      if (!result) {
        res.status(status.NOT_FOUND).json({
          success: false,
          message: "Subscriber not found",
        });
        return;
      }

      res.status(status.OK).json({
        success: true,
        message: "Position found",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};