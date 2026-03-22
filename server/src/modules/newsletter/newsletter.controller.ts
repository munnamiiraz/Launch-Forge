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
};

