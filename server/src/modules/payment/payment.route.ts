import express, { Router } from "express";
import { paymentController }  from "./payment.controller";
import { validateRequest }    from "../../middlewares/validateRequest";
import { checkAuth }          from "../../middlewares/checkAuth";
import { createCheckoutSchema, confirmCheckoutSchema } from "./payment.validation";
import { Role } from "../../constraint/index";

/**
 * ─────────────────────────────────────────────────────────────────
 * CRITICAL: Raw body requirement for the webhook route
 * ─────────────────────────────────────────────────────────────────
 *
 * Stripe signature verification requires the raw, unparsed request
 * body. The global express.json() middleware replaces req.body with
 * a parsed object and loses the raw bytes.
 *
 * Mount this router BEFORE the global express.json() middleware
 * in app.ts — the webhook route uses express.raw() locally so only
 * that one route receives the raw buffer.
 *
 * In app.ts:
 *
 *   import { paymentRouter } from "./modules/payment/route";
 *
 *   // ← BEFORE app.use(express.json())
 *   app.use("/api/payment", paymentRouter);
 *
 *   // ← AFTER
 *   app.use(express.json());
 *
 * Resulting routes:
 *   POST  /api/payment/checkout   → create Stripe Checkout session (auth)
 *   POST  /api/payment/webhook    → Stripe webhook handler          (no auth — Stripe signature)
 *   GET   /api/payment/status     → get current payment status      (auth)
 *   POST  /api/payment/portal     → create Stripe billing portal    (auth)
 */
const router = Router();

/* POST /api/payment/checkout */
router
  .route("/checkout")
  .post(
    checkAuth(Role.OWNER, Role.ADMIN),
    express.json(),                       // parse JSON just for this route
    validateRequest(createCheckoutSchema),
    paymentController.createCheckoutSession,
  );

/* POST /api/payment/confirm */
router
  .route("/confirm")
  .post(
    checkAuth(Role.OWNER, Role.ADMIN),
    express.json(),
    validateRequest(confirmCheckoutSchema),
    paymentController.confirmCheckoutSession,
  );

/*
 * POST /api/payment/webhook
 * express.raw() captures the raw Buffer — Stripe SDK needs it for HMAC verification.
 * Do NOT put express.json() on this route.
 */
router
  .route("/webhook")
  .post(
    express.raw({ type: "application/json" }),
    paymentController.handleWebhook,
  );

/* GET /api/payment/status */
router
  .route("/status")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    paymentController.getPaymentStatus,
  );

/* GET /api/payment/invoices */
router
  .route("/invoices")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    paymentController.getInvoices,
  );

/* POST /api/payment/portal */
router
  .route("/portal")
  .post(
    checkAuth(Role.OWNER, Role.ADMIN),
    express.json(),
    paymentController.createPortalSession,
  );

export const paymentRouter = router;
