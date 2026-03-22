import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { paymentService }   from "./payment.service";
import { PAYMENT_MESSAGES } from "./payment.constant";

export const paymentController = {

  /* ──────────────────────────────────────────────────────────────
     POST /api/payment/checkout
     ────────────────────────────────────────────────────────────── */

  async createCheckoutSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requestingUserId = req.user!.id;
      const { planType, planMode } = req.body;

      const result = await paymentService.createCheckoutSession({
        requestingUserId,
        planType,
        planMode,
      });

      res.status(status.CREATED).json({
        success: true,
        message: PAYMENT_MESSAGES.CHECKOUT_CREATED,
        data:    result,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ──────────────────────────────────────────────────────────────
     POST /api/payment/webhook
     IMPORTANT: This route must receive the RAW request body.
     In app.ts, mount this router BEFORE the global json() middleware,
     or use express.raw() on this route specifically.
     See route.ts for the exact setup.
     ────────────────────────────────────────────────────────────── */

  async handleWebhook(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const rawBody        = req.body as Buffer;
      const stripeSignature = req.headers["stripe-signature"] as string;

      if (!stripeSignature) {
        res.status(status.BAD_REQUEST).json({
          success: false,
          message: "Missing Stripe-Signature header.",
        });
        return;
      }

      const result = await paymentService.handleWebhook(rawBody, stripeSignature);

      /* Always respond 200 to Stripe — even for ignored events.
         Stripe retries on any non-2xx response. */
      res.status(status.OK).json({
        success: true,
        message: result.processed
          ? PAYMENT_MESSAGES.WEBHOOK_RECEIVED
          : PAYMENT_MESSAGES.WEBHOOK_IGNORED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/payment/status
     ────────────────────────────────────────────────────────────── */

  async getPaymentStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requestingUserId = req.user!.id;

      const result = await paymentService.getPaymentStatus({ requestingUserId });

      res.status(status.OK).json({
        success: true,
        message: PAYMENT_MESSAGES.STATUS_FETCHED,
        data:    result,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ──────────────────────────────────────────────────────────────
     POST /api/payment/portal
     ────────────────────────────────────────────────────────────── */

  async createPortalSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requestingUserId = req.user!.id;

      const result = await paymentService.createPortalSession({ requestingUserId });

      res.status(status.CREATED).json({
        success: true,
        message: PAYMENT_MESSAGES.PORTAL_CREATED,
        data:    result,
      });
    } catch (error) {
      next(error);
    }
  },
};