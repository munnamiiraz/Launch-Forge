import status from "http-status";
import Stripe from "stripe";
import { prisma }  from "../../lib/prisma";
import AppError    from "../../errorHelpers/AppError";
import {
  CreateCheckoutPayload,
  GetPaymentStatusPayload,
  HandleWebhookPayload,
  CreatePortalSessionPayload,
  ConfirmCheckoutPayload,
  CheckoutSessionResult,
  PortalSessionResult,
  PaymentStatusResult,
  WebhookHandledResult,
  ActiveSubscriptionInfo,
  GetPaymentUsageResult,
  UsageItem,
} from "./payment.interface";
import {
  PAYMENT_MESSAGES,
  STRIPE_PRICE_IDS,
  CHECKOUT_CONFIG,
  HANDLED_STRIPE_EVENTS,
  PAYMENT_TYPE_TO_WORKSPACE_PLAN,
  PLAN_LIMITS,
  UsagePlan,
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

    /* 2. Check if user already has an active subscription ─────────── */
    const existingPayment = await prisma.payment.findUnique({
      where:  { userId: requestingUserId },
      select: { status: true, transactionId: true, paymentGatewayData: true },
    });

    /* ── Plan switch: user already has a PAID subscription ────────── */
    if (existingPayment?.status === "PAID" && existingPayment.transactionId?.startsWith("sub_")) {
      const newPriceId = STRIPE_PRICE_IDS[planType][planMode];
      const subscriptionId = existingPayment.transactionId;

      try {
        /* Fetch the current subscription to get the item ID */
        const currentSub = await stripe.subscriptions.retrieve(subscriptionId) as any;
        const subscriptionItemId = currentSub.items?.data?.[0]?.id;

        if (!subscriptionItemId) {
          throw new AppError(status.UNPROCESSABLE_ENTITY, "Could not find subscription item to update.");
        }

        /* Update the subscription to the new plan.
         * always_invoice → immediately creates an invoice for the price
         * difference and charges the card on file right away.  */
        await stripe.subscriptions.update(subscriptionId, {
          items: [{
            id:    subscriptionItemId,
            price: newPriceId,
          }],
          proration_behavior: "always_invoice",
          payment_behavior:   "pending_if_incomplete",
        });

        /* Update the local payment record */
        await prisma.payment.update({
          where: { userId: requestingUserId },
          data: {
            planType,
            planMode,
            amount: planType === "GROWTH"
              ? (planMode === "YEARLY" ? 39 * 12 : 49)
              : (planMode === "YEARLY" ? 15 * 12 : 19),
          },
        });

        /* Update the workspace plan */
        await prisma.workspace.updateMany({
          where: { ownerId: requestingUserId, deletedAt: null },
          data:  { plan: planType },
        });

        /*
         * Return the billing page URL instead of a checkout URL.
         * The frontend will detect this and reload the page.
         */
        return {
          checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/billing?success=true&switched=true`,
          sessionId:   subscriptionId,
        };
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        console.error("[payment] plan switch error:", err?.message ?? err);
        throw new AppError(status.BAD_GATEWAY, "Failed to switch plan. Please try again or contact support.");
      }
    }

    /* 3. Resolve the Stripe Price ID ─────────────────────────────── */
    const priceId = STRIPE_PRICE_IDS[planType][planMode];

    /* 4. Create the Stripe Checkout session ──────────────────────── */
    let session: Stripe.Checkout.Session;

    try {
      session = await stripe.checkout.sessions.create({
        mode:              "subscription",
        payment_method_types: ["card"],   // ← Only accept card payments
        customer_email:    user.email,
        line_items: [
          {
            price:    priceId,
            quantity: 1,
          },
        ],
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

  /*
     POST /api/payment/confirm
     Confirm a Stripe Checkout Session after the user returns to the app.

     This is a dev-friendly fallback when webhooks are not configured yet.
     Keep the webhook as the source of truth in production.
  */
  async confirmCheckoutSession(payload: ConfirmCheckoutPayload): Promise<{
    updated: boolean;
    status: "PAID" | "UNPAID";
  }> {
    const { requestingUserId, sessionId } = payload;

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      });
    } catch {
      throw new AppError(status.BAD_REQUEST, "Invalid checkout session id.");
    }

    const meta = extractMetadata((session.metadata ?? {}) as Record<string, string>);
    if (!meta) {
      throw new AppError(status.UNPROCESSABLE_ENTITY, "Missing checkout metadata.");
    }

    if (meta.userId !== requestingUserId) {
      throw new AppError(status.FORBIDDEN, "Checkout session does not belong to this user.");
    }

    // Not paid yet (or user cancelled), don't upgrade.
    if (session.payment_status !== "paid") {
      return { updated: false, status: "UNPAID" };
    }

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id ?? null;

    const amount = session.amount_total
      ? centsToDollars(session.amount_total)
      : derivePlanAmount(meta.planType, meta.planMode);

    await prisma.$transaction(async (tx) => {
      await tx.payment.upsert({
        where: { userId: meta.userId },
        create: {
          userId:            meta.userId,
          amount,
          transactionId:     subscriptionId ?? session.id,
          stripeEventId:     null,
          status:            "PAID",
          planType:          meta.planType,
          planMode:          meta.planMode,
          paymentGatewayData: session as unknown as object,
        },
        update: {
          amount,
          transactionId:     subscriptionId ?? session.id,
          stripeEventId:     null,
          status:            "PAID",
          planType:          meta.planType,
          planMode:          meta.planMode,
          paymentGatewayData: session as unknown as object,
        },
      });

      await tx.workspace.updateMany({
        where: { ownerId: meta.userId, deletedAt: null },
        data:  { plan: PAYMENT_TYPE_TO_WORKSPACE_PLAN[meta.planType] },
      });
    });

    return { updated: true, status: "PAID" };
  },

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

          /* Downgrade all workspaces back to FREE */
          await tx.workspace.updateMany({
            where: { ownerId: meta.userId, deletedAt: null },
            data:  { plan: "FREE" },
          });

          /* ── Soft-downgrade: enforce FREE plan limits ─────────────
           *  FREE plan: 1 waitlist, 1 team member (owner only).
           *  We never delete data — just close/restrict access.
           * ─────────────────────────────────────────────────────── */

          /* 1. Auto-close excess waitlists.
           *    Keep the most recent waitlist open, close all others. */
          const userWorkspaces = await tx.workspace.findMany({
            where: { ownerId: meta.userId, deletedAt: null },
            select: { id: true },
          });

          for (const ws of userWorkspaces) {
            const openWaitlists = await tx.waitlist.findMany({
              where: { workspaceId: ws.id, deletedAt: null, isOpen: true },
              orderBy: { createdAt: "desc" },
              select: { id: true },
            });

            // Keep the first (most recent), close the rest
            if (openWaitlists.length > 1) {
              const idsToClose = openWaitlists.slice(1).map((w) => w.id);
              await tx.waitlist.updateMany({
                where: { id: { in: idsToClose } },
                data:  { isOpen: false },
              });
            }

            /* 2. Soft-remove non-owner team members.
             *    We don't delete them — we soft-delete their membership
             *    so they can be re-invited later if the user re-subscribes. */
            await tx.workspaceMember.updateMany({
              where: {
                workspaceId: ws.id,
                deletedAt:   null,
                role:        { not: "OWNER" },
              },
              data: { deletedAt: new Date() },
            });
          }
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
        paymentGatewayData: true,
      },
    });

    const hasPaid = payment?.status === "PAID";

    let activePlan: PaymentStatusResult["activePlan"] = "FREE";
    if (hasPaid) {
      activePlan = payment!.planType === "PRO" ? "PRO" : "GROWTH";
    }

    /*
     * Build the detailed ActiveSubscriptionInfo if use is paid.
     * We extract dates from Stripe metadata if available.
     */
    let subscription: ActiveSubscriptionInfo | null = null;
    if (payment && hasPaid) {
      const data = payment.paymentGatewayData as any;
      
      // If paymentGatewayData is a Stripe Subscription object or has it
      const subObj = data?.object === "subscription" ? data : data?.subscription;

      // Map Stripe subscription statuses to the UI/status union expected by the client.
      // NOTE: This is different from PaymentStatus (PAID/UNPAID).
      const uiStatus: ActiveSubscriptionInfo["status"] = (() => {
        const s = String(subObj?.status ?? "active");
        if (s === "active") return "active";
        if (s === "trialing") return "trialing";
        if (s === "past_due") return "past_due";
        if (s === "canceled" || s === "cancelled") return "cancelled";
        return "none";
      })();
      
      subscription = {
        planTier:      payment.planType,
        billingMode:   payment.planMode,
        status:        uiStatus,
        amount:        payment.amount,
        currency:      "USD",
        nextBillingAt: subObj?.current_period_end 
          ? new Date(subObj.current_period_end * 1000).toISOString()
          : null,
        cancelAt:      subObj?.cancel_at
          ? new Date(subObj.cancel_at * 1000).toISOString()
          : null,
        trialEndsAt:   subObj?.trial_end
          ? new Date(subObj.trial_end * 1000).toISOString()
          : null,
        transactionId: payment.transactionId,
        startedAt:     payment.createdAt.toISOString(),
      };
    }

    return {
      hasPaid,
      payment: payment ?? null,
      activePlan,
      subscription,
    };
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/payment/invoices
     Fetch real invoice history from Stripe.
     ────────────────────────────────────────────────────────────── */

  async getInvoices(payload: { requestingUserId: string }): Promise<any[]> {
    const { requestingUserId } = payload;

    const payment = await prisma.payment.findUnique({
      where:  { userId: requestingUserId },
      select: { paymentGatewayData: true },
    });

    if (!payment) return [];

    const data = payment.paymentGatewayData as any;
    const customerId = data?.customer;

    if (!customerId) return [];

    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 10,
      });

      return invoices.data.map((inv) => ({
        id:          inv.id,
        date:        new Date(inv.created * 1000).toISOString(),
        amount:      centsToDollars(inv.amount_paid),
        currency:    inv.currency.toUpperCase(),
        status:      inv.status,
        description: inv.lines.data[0]?.description ?? "LaunchForge Subscription",
        pdfUrl:      inv.invoice_pdf,
      }));
    } catch {
      return [];
    }
  },

  /* ──────────────────────────────────────────────────────────────
     POST /api/payment/portal
     Create a Stripe Customer Portal session so the user can manage
     their subscription (update card, view invoices, switch plan).

     ⚠ NO REFUND POLICY:
       Cancellation in the portal is configured as "cancel at end of
       billing period" (Stripe Dashboard → Settings → Customer Portal).
       The user keeps access until the period ends. No prorated refund.
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

  /* ──────────────────────────────────────────────────────────────
     POST /api/payment/cancel
     Cancel the subscription at the end of the current billing period.
     NO refund — the user keeps access until the period ends.
     Once the period ends, Stripe fires `customer.subscription.deleted`
     which triggers the soft-downgrade logic above.
     ────────────────────────────────────────────────────────────── */

  async cancelSubscription(
    payload: { requestingUserId: string },
  ): Promise<{ cancelledAt: string; accessUntil: string }> {
    const { requestingUserId } = payload;

    const payment = await prisma.payment.findUnique({
      where:  { userId: requestingUserId },
      select: { transactionId: true, paymentGatewayData: true, status: true },
    });

    if (!payment || payment.status !== "PAID") {
      throw new AppError(status.NOT_FOUND, "No active subscription to cancel.");
    }

    const gatewayData = payment.paymentGatewayData as Record<string, unknown>;
    const subscriptionId = payment.transactionId;

    if (!subscriptionId || !subscriptionId.startsWith("sub_")) {
      throw new AppError(status.UNPROCESSABLE_ENTITY, "No Stripe subscription found.");
    }

    try {
      /*
       * cancel_at_period_end = true  →  user keeps access until billing cycle ends
       * No immediate charge reversal  →  NO REFUND
       * Stripe will fire `customer.subscription.deleted` when the period ends
       */
      const updatedSub = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      }) as any;

      const periodEnd = updatedSub.current_period_end ?? updatedSub?.data?.current_period_end;
      const accessUntil = periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // fallback: 30 days

      return {
        cancelledAt: new Date().toISOString(),
        accessUntil,
      };
    } catch {
      throw new AppError(status.BAD_GATEWAY, PAYMENT_MESSAGES.STRIPE_ERROR);
    }
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/payment/usage
     Calculate current usage (waitlists, subs, team) across user's
     workspaces and compare against current plan limits.
     ────────────────────────────────────────────────────────────── */

  /* ──────────────────────────────────────────────────────────────
     POST /api/payment/sync
     Pull the user's live Stripe subscription status and write it
     to the DB. Use this when webhooks are delayed or misconfigured,
     or when a user paid but the plan shows as FREE.
     ────────────────────────────────────────────────────────────── */

  async syncSubscription(payload: { requestingUserId: string }): Promise<{
    synced: boolean;
    plan: "FREE" | "PRO" | "GROWTH";
    message: string;
  }> {
    const { requestingUserId } = payload;

    const user = await prisma.user.findUnique({
      where: { id: requestingUserId },
      select: { id: true, email: true },
    });
    if (!user) throw new AppError(status.NOT_FOUND, "User not found.");

    // 1. Check existing payment record for a subscription ID
    const existing = await prisma.payment.findUnique({
      where: { userId: requestingUserId },
      select: { transactionId: true, status: true, planType: true },
    });

    let subscription: any = null;

    if (existing?.transactionId?.startsWith("sub_")) {
      // Fetch subscription directly by ID
      try {
        subscription = await stripe.subscriptions.retrieve(existing.transactionId);
      } catch {
        // subscription might be deleted; fall through to customer search
      }
    }

    if (!subscription) {
      // Search for customer by email and find active subscriptions
      const customers = await stripe.customers.search({
        query: `email:"${user.email}"`,
        limit: 1,
      });

      if (customers.data.length === 0) {
        return { synced: false, plan: "FREE", message: "No Stripe customer found for this email." };
      }

      const customerId = customers.data[0].id;
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
        expand: ["data.items.data.price"],
      });

      if (subs.data.length === 0) {
        return { synced: false, plan: "FREE", message: "No active Stripe subscription found." };
      }

      subscription = subs.data[0];
    }

    // Determine plan from subscription metadata or price ID
    const meta = extractMetadata((subscription.metadata ?? {}) as Record<string, string>);
    if (!meta || meta.userId !== requestingUserId) {
      // Try to infer plan from price ID
      const priceId = subscription.items?.data?.[0]?.price?.id ?? "";
      let planType: "PRO" | "GROWTH" = "PRO";
      if (
        priceId === process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID ||
        priceId === process.env.STRIPE_GROWTH_YEARLY_PRICE_ID
      ) {
        planType = "GROWTH";
      }

      const isActive = ["active", "trialing"].includes(subscription.status);
      if (!isActive) {
        return { synced: false, plan: "FREE", message: "Subscription exists but is not active." };
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.upsert({
          where: { userId: requestingUserId },
          create: {
            userId: requestingUserId,
            amount: centsToDollars(subscription.items?.data?.[0]?.price?.unit_amount ?? 0),
            transactionId: subscription.id,
            stripeEventId: null,
            status: "PAID",
            planType,
            planMode: subscription.items?.data?.[0]?.price?.recurring?.interval === "year" ? "YEARLY" : "MONTHLY",
            paymentGatewayData: subscription as unknown as object,
          },
          update: {
            transactionId: subscription.id,
            status: "PAID",
            planType,
            planMode: subscription.items?.data?.[0]?.price?.recurring?.interval === "year" ? "YEARLY" : "MONTHLY",
            paymentGatewayData: subscription as unknown as object,
          },
        });
        await tx.workspace.updateMany({
          where: { ownerId: requestingUserId, deletedAt: null },
          data: { plan: PAYMENT_TYPE_TO_WORKSPACE_PLAN[planType] },
        });
      });

      return { synced: true, plan: planType, message: `Plan synced to ${planType} from Stripe.` };
    }

    const isActive = ["active", "trialing"].includes(subscription.status);
    const newStatus = isActive ? "PAID" as const : "UNPAID" as const;

    await prisma.$transaction(async (tx) => {
      await tx.payment.upsert({
        where: { userId: requestingUserId },
        create: {
          userId: requestingUserId,
          amount: centsToDollars(subscription.items?.data?.[0]?.price?.unit_amount ?? 0),
          transactionId: subscription.id,
          stripeEventId: null,
          status: newStatus,
          planType: meta.planType,
          planMode: meta.planMode,
          paymentGatewayData: subscription as unknown as object,
        },
        update: {
          transactionId: subscription.id,
          status: newStatus,
          planType: meta.planType,
          planMode: meta.planMode,
          paymentGatewayData: subscription as unknown as object,
        },
      });

      const workspacePlan = isActive ? PAYMENT_TYPE_TO_WORKSPACE_PLAN[meta.planType] : ("FREE" as const);
      await tx.workspace.updateMany({
        where: { ownerId: requestingUserId, deletedAt: null },
        data: { plan: workspacePlan },
      });
    });

    const finalPlan = isActive ? meta.planType : "FREE";
    return { synced: true, plan: finalPlan, message: `Plan synced to ${finalPlan} from Stripe.` };
  },

  async getUsage(payload: { requestingUserId: string }): Promise<GetPaymentUsageResult> {
    const { requestingUserId } = payload;

    // 1. Resolve current plan
    const payment = await prisma.payment.findUnique({
      where:  { userId: requestingUserId },
      select: { status: true, planType: true },
    });

    const activePlan: UsagePlan = (payment?.status === "PAID") ? payment.planType : "FREE";
    const limits = PLAN_LIMITS[activePlan];

    // 2. Fetch all workspaces owned by the user
    const workspaces = await prisma.workspace.findMany({
      where:  { ownerId: requestingUserId, deletedAt: null },
      select: { id: true },
    });
    const workspaceIds = workspaces.map((ws) => ws.id);

    // 3. Aggregate counts
    const [waitlistCount, subscriberCount, memberCount, prizeCount, boardCount] = await Promise.all([
      prisma.waitlist.count({
        where: { workspaceId: { in: workspaceIds }, deletedAt: null }
      }),
      prisma.subscriber.count({
        where: { waitlist: { workspaceId: { in: workspaceIds } }, deletedAt: null }
      }),
      prisma.workspaceMember.count({
        where: { workspaceId: { in: workspaceIds }, deletedAt: null }
      }),
      prisma.leaderboardPrize.count({
        where: { waitlist: { workspaceId: { in: workspaceIds } }, deletedAt: null }
      }),
      prisma.feedbackBoard.count({
        where: { workspaceId: { in: workspaceIds }, deletedAt: null }
      }),
    ]);

    const usage: UsageItem[] = [
      { label: "Waitlists",       used: waitlistCount,    limit: limits.waitlists,      unit: "waitlists"   },
      { label: "Subscribers",     used: subscriberCount,  limit: limits.subscribers,    unit: "subscribers" },
      { label: "Team members",    used: memberCount,      limit: limits.teamMembers,    unit: "members"     },
      { label: "Active prizes",   used: prizeCount,       limit: limits.prizes,         unit: "prizes"      },
      { label: "Feedback boards", used: boardCount,       limit: limits.feedbackBoards, unit: "boards"      },
      { label: "API calls (30d)", used: 0,                limit: null,                  unit: "calls"       },
    ];

    return { usage };
  },
};
