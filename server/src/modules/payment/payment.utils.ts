import {
  PaymentType,
  PaymentMode,
  PaymentStatus,
  StripeCheckoutSession,
  StripeInvoice,
  StripeSubscription,
} from "./payment.interface";
import {
  HANDLED_STRIPE_EVENTS,
  HandledStripeEvent,
  PLAN_AMOUNTS_CENTS,
} from "./payment.constant";

/* ─────────────────────────────────────────────────────────────────
   Stripe event type guard
   ──────────────────────────────────────────────────────────────── */

export function isHandledEvent(eventType: string): eventType is HandledStripeEvent {
  return (HANDLED_STRIPE_EVENTS as readonly string[]).includes(eventType);
}

/* ─────────────────────────────────────────────────────────────────
   Extract userId from Stripe metadata
   Stripe metadata is set when we create the Checkout session.
   We always embed userId, planType, planMode in metadata.
   ──────────────────────────────────────────────────────────────── */

export function extractMetadata(
  metadata: Record<string, string>,
): { userId: string; planType: PaymentType; planMode: PaymentMode } | null {
  const { userId, planType, planMode } = metadata;

  if (!userId || !planType || !planMode) return null;
  if (!["PRO", "GROWTH"].includes(planType))      return null;
  if (!["MONTHLY", "YEARLY"].includes(planMode))  return null;

  return {
    userId,
    planType:  planType  as PaymentType,
    planMode:  planMode  as PaymentMode,
  };
}

/* ─────────────────────────────────────────────────────────────────
   Convert Stripe amount (cents) to dollars (float)
   ──────────────────────────────────────────────────────────────── */

export function centsToDollars(cents: number): number {
  return cents / 100;
}

/* ─────────────────────────────────────────────────────────────────
   Derive the plan amount for local record-keeping when Stripe
   doesn't provide a direct amount (e.g. subscription events).
   ──────────────────────────────────────────────────────────────── */

export function derivePlanAmount(
  planType: PaymentType,
  planMode: PaymentMode,
): number {
  return centsToDollars(PLAN_AMOUNTS_CENTS[planType][planMode]);
}

/* ─────────────────────────────────────────────────────────────────
   Type narrowing helpers for Stripe event objects
   ──────────────────────────────────────────────────────────────── */

export function isCheckoutSession(obj: unknown): obj is StripeCheckoutSession {
  return (obj as StripeCheckoutSession)?.object === "checkout.session";
}

export function isInvoice(obj: unknown): obj is StripeInvoice {
  return (obj as StripeInvoice)?.object === "invoice";
}

export function isSubscription(obj: unknown): obj is StripeSubscription {
  return (obj as StripeSubscription)?.object === "subscription";
}

/* ─────────────────────────────────────────────────────────────────
   Map Stripe payment/subscription status → our PaymentStatus enum
   ──────────────────────────────────────────────────────────────── */

export function toPaymentStatus(stripeStatus: string): PaymentStatus {
  const paid = ["paid", "active", "trialing"];
  return paid.includes(stripeStatus) ? "PAID" : "UNPAID";
}