import status from "http-status";
import Stripe from "stripe";
import { prisma }  from "../../lib/prisma";
import AppError    from "../../errorHelpers/AppError";
import {
  CreateCheckoutPayload,
  GetPaymentStatusPayload,
  HandleWebhookPayload,
  CreatePortalSessionPayload,
  CheckoutSessionResult,
  PortalSessionResult,
  PaymentStatusResult,
  WebhookHandledResult,
} from "./payment.interface";
import {
  PAYMENT_MESSAGES,
  STRIPE_PRICE_IDS,
  CHECKOUT_CONFIG,
  HANDLED_STRIPE_EVENTS,
  PAYMENT_TYPE_TO_WORKSPACE_PLAN,
} from "./payment.constant";
import {
  isHandledEvent,
  extractMetadata,
  centsToDollars,
  derivePlanAmount,
  isCheckoutSession,
  isInvoice,
  isSubscription,
  toPaymentStatus,
} from "./payment.utils";

/* ─────────────────────────────────────────────────────────────────
   Stripe SDK singleton
   Initialised once; re-used across all service methods.
   ──────────────────────────────────────────────────────────────── */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  // Keep in sync with the installed Stripe SDK type definitions
  apiVersion: "2026-02-25.clover",
});

export const paymentService = {

  /* ──────────────────────────────────────────────────────────────
     POST /api/payment/checkout
     Create a Stripe Checkout session and return the redirect URL.
     ────────────────────────────────────────────────────────────── */

  async createCheckoutSession(
    payload: CreateCheckoutPayload,
  ): Promise<CheckoutSessionResult> {
    const { requestingUserId, planType, planMode } = payload;

    /* 1. Fetch the user — we need their email for Stripe ─────────── */
    const user = await prisma.user.findUnique({
      where:  { id: requestingUserId, isDeleted: false },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new AppError(status.NOT_FOUND, PAYMENT_MESSAGES.USER_NOT_FOUND);
    }

    /* 2. Guard: block if user already has an active PAID subscription ─
     *    They should manage changes via the billing portal instead.     */
    const existingPayment = await prisma.payment.findUnique({
      where:  { userId: requestingUserId },
      select: { status: true },
    });

    if (existingPayment?.status === "PAID") {
      throw new AppError(status.CONFLICT, PAYMENT_MESSAGES.ALREADY_PAID);
    }

    /* 3. Resolve the Stripe Price ID ─────────────────────────────── */
    const priceId = STRIPE_PRICE_IDS[planType][planMode];

    /* 4. Create the Stripe Checkout session ──────────────────────── */
    let session: Stripe.Checkout.Session;

    try {
      session = await stripe.checkout.sessions.create({
        mode:              "subscription",
        customer_email:    user.email,
        line_items: [
          {
            price:    priceId,
            quantity: 1,
          },
        ],
        /*
         * Embed userId, planType, planMode in metadata so the webhook
         * handler can fully reconstruct the context without a DB lookup
         * on the email (which could collide if the user changes email).
         */
        metadata: {
          userId:   user.id,
          planType,
          planMode,
        },
        subscription_data: {
          metadata: {
            userId:   user.id,
            planType,
            planMode,
          },
        },
        success_url: CHECKOUT_CONFIG.SUCCESS_URL,
        cancel_url:  CHECKOUT_CONFIG.CANCEL_URL,
        allow_promotion_codes: true,
      });
    } catch (err) {
      throw new AppError(status.BAD_GATEWAY, PAYMENT_MESSAGES.STRIPE_ERROR);
    }

    return {
      checkoutUrl: session.url ?? "",
      sessionId:   session.id,
    };
  },

  /* ──────────────────────────────────────────────────────────────
     POST /api/payment/webhook
     Verify the Stripe signature, then handle the event.
     Called with the raw request body — signature verification
     requires the raw bytes, NOT the parsed JSON.
     ────────────────────────────────────────────────────────────── */

  async handleWebhook(
    rawBody:          Buffer,
    stripeSignature:  string,
  ): Promise<WebhookHandledResult> {
    /* 1. Verify the Stripe signature — throws if invalid ─────────── */
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET ?? "",
      );
    } catch {
      throw new AppError(status.BAD_REQUEST, "Webhook signature verification failed.");
    }

    /* 2. Idempotency guard — skip already-processed events ─────────
     *    stripeEventId is @@unique in the Payment model.              */
    const alreadyProcessed = await prisma.payment.findFirst({
      where:  { stripeEventId: event.id },
      select: { id: true },
    });

    if (alreadyProcessed) {
      return { processed: false, eventType: event.type };
    }

    /* 3. Route to the correct handler ───────────────────────────── */
    if (!isHandledEvent(event.type)) {
      return { processed: false, eventType: event.type };
    }

    const obj = event.data.object;

    switch (event.type) {

      /* ── Checkout completed — user paid for the first time ─────── */
      case "checkout.session.completed": {
        if (!isCheckoutSession(obj)) break;
        if (obj.payment_status !== "paid") break;

        const meta = extractMetadata(obj.metadata);
        if (!meta) break;

        const amount = obj.amount_total
          ? centsToDollars(obj.amount_total)
          : derivePlanAmount(meta.planType, meta.planMode);

        /*
         * Upsert — handles both new subscribers and returning users
         * who lapsed and are re-subscribing. transactionId uses the
         * subscription ID if available, otherwise the session ID.
         */
        await prisma.$transaction(async (tx) => {
          await tx.payment.upsert({
            where:  { userId: meta.userId },
            create: {
              userId:            meta.userId,
              amount,
              transactionId:     obj.subscription ?? obj.id,
              stripeEventId:     event.id,
              status:            "PAID",
              planType:          meta.planType,
              planMode:          meta.planMode,
              paymentGatewayData: obj as object,
            },
            update: {
              amount,
              transactionId:     obj.subscription ?? obj.id,
              stripeEventId:     event.id,
              status:            "PAID",
              planType:          meta.planType,
              planMode:          meta.planMode,
              paymentGatewayData: obj as object,
            },
          });

          /* Upgrade the workspace plan for this user */
          await tx.workspace.updateMany({
            where: { ownerId: meta.userId, deletedAt: null },
            data:  { plan: PAYMENT_TYPE_TO_WORKSPACE_PLAN[meta.planType] },
          });
        });

        break;
      }

      /* ── Invoice paid — recurring renewal ──────────────────────── */
      case "invoice.payment_succeeded": {
        if (!isInvoice(obj)) break;
        if (obj.status !== "paid")  break;

        const meta = extractMetadata(obj.metadata);
        if (!meta) break;

        await prisma.payment.updateMany({
          where: { userId: meta.userId },
          data: {
            status:            "PAID",
            amount:            centsToDollars(obj.amount_paid),
            stripeEventId:     event.id,
            paymentGatewayData: obj as object,
          },
        });

        break;
      }

      /* ── Invoice failed — mark as UNPAID, restrict features ────── */
      case "invoice.payment_failed": {
        if (!isInvoice(obj)) break;

        const meta = extractMetadata(obj.metadata);
        if (!meta) break;

        await prisma.$transaction(async (tx) => {
          await tx.payment.updateMany({
            where: { userId: meta.userId },
            data:  {
              status:            "UNPAID",
              stripeEventId:     event.id,
              paymentGatewayData: obj as object,
            },
          });

          /* Downgrade workspace back to FREE on payment failure */
          await tx.workspace.updateMany({
            where: { ownerId: meta.userId, deletedAt: null },
            data:  { plan: "FREE" },
          });
        });

        break;
      }

      /* ── Subscription cancelled / deleted ──────────────────────── */
      case "customer.subscription.deleted": {
        if (!isSubscription(obj)) break;

        const meta = extractMetadata(obj.metadata);
        if (!meta) break;

        await prisma.$transaction(async (tx) => {
          await tx.payment.updateMany({
            where: { userId: meta.userId },
            data:  {
              status:            "UNPAID",
              stripeEventId:     event.id,
              paymentGatewayData: obj as object,
            },
          });

          await tx.workspace.updateMany({
            where: { ownerId: meta.userId, deletedAt: null },
            data:  { plan: "FREE" },
          });
        });

        break;
      }

      /* ── Subscription updated (plan change mid-cycle) ───────────── */
      case "customer.subscription.updated": {
        if (!isSubscription(obj)) break;

        const meta = extractMetadata(obj.metadata);
        if (!meta) break;

        const newStatus = toPaymentStatus(obj.status);

        await prisma.$transaction(async (tx) => {
          await tx.payment.updateMany({
            where: { userId: meta.userId },
            data:  {
              status:            newStatus,
              planType:          meta.planType,
              planMode:          meta.planMode,
              stripeEventId:     event.id,
              paymentGatewayData: obj as object,
            },
          });

          const workspacePlan =
            newStatus === "PAID"
              ? PAYMENT_TYPE_TO_WORKSPACE_PLAN[meta.planType]
              : ("FREE" as const);

          await tx.workspace.updateMany({
            where: { ownerId: meta.userId, deletedAt: null },
            data:  { plan: workspacePlan },
          });
        });

        break;
      }
    }

    return { processed: true, eventType: event.type };
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/payment/status
     Return the caller's current payment record and resolved plan.
     ────────────────────────────────────────────────────────────── */

  async getPaymentStatus(
    payload: GetPaymentStatusPayload,
  ): Promise<PaymentStatusResult> {
    const { requestingUserId } = payload;

    const payment = await prisma.payment.findUnique({
      where: { userId: requestingUserId },
      select: {
        id:            true,
        status:        true,
        planType:      true,
        planMode:      true,
        amount:        true,
        transactionId: true,
        createdAt:     true,
        updatedAt:     true,
      },
    });

    const hasPaid = payment?.status === "PAID";

    let activePlan: PaymentStatusResult["activePlan"] = "FREE";
    if (hasPaid) {
      activePlan = payment!.planType === "PRO" ? "PRO" : "GROWTH";
    }

    return {
      hasPaid,
      payment: payment ?? null,
      activePlan,
    };
  },

  /* ──────────────────────────────────────────────────────────────
     POST /api/payment/portal
     Create a Stripe Customer Portal session so the user can manage
     their subscription (cancel, update card, switch plan) themselves.
     ────────────────────────────────────────────────────────────── */

  async createPortalSession(
    payload: CreatePortalSessionPayload,
  ): Promise<PortalSessionResult> {
    const { requestingUserId } = payload;

    /* 1. Find the payment record to get the Stripe customer ID ───── */
    const payment = await prisma.payment.findUnique({
      where:  { userId: requestingUserId },
      select: { transactionId: true, paymentGatewayData: true },
    });

    if (!payment) {
      throw new AppError(status.NOT_FOUND, "No active subscription found.");
    }

    /*
     * The Stripe customer ID is stored in paymentGatewayData.customer.
     * We stored the full Checkout Session object there on creation.
     */
    const gatewayData = payment.paymentGatewayData as Record<string, unknown>;
    const customerId  = gatewayData?.customer as string | undefined;

    if (!customerId) {
      throw new AppError(status.UNPROCESSABLE_ENTITY, "Stripe customer ID not found.");
    }

    /* 2. Create the portal session ───────────────────────────────── */
    let portalSession: Stripe.BillingPortal.Session;

    try {
      portalSession = await stripe.billingPortal.sessions.create({
        customer:   customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/billing`,
      });
    } catch {
      throw new AppError(status.BAD_GATEWAY, PAYMENT_MESSAGES.STRIPE_ERROR);
    }

    return { portalUrl: portalSession.url };
  },
};
