import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { newsletterService } from "./newsletter.service";
import { NEWSLETTER_MESSAGES } from "./newsletter.constant";

export const newsletterController = {
  /* ── POST /api/v1/newsletter/subscribe ─────────────────────────── */
  async subscribe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, name } = req.body;
      const result = await newsletterService.subscribe({ email, name });

      res.status(status.OK).json({
        success: true,
        message: result.alreadySubscribed
          ? NEWSLETTER_MESSAGES.ALREADY_SUBSCRIBED
          : NEWSLETTER_MESSAGES.SUBSCRIBED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── POST /api/v1/newsletter/broadcast ─────────────────────────── */
  async broadcast(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { subject, body } = req.body;
      const result = await newsletterService.broadcastNewsletter(subject, body);

      res.status(status.ACCEPTED).json({
        success: true,
        message: "Newsletter broadcast started in the background",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

