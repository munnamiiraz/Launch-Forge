import { PaymentMode, PaymentType } from "./payment.interface";

/* ─────────────────────────────────────────────────────────────────
   Response messages
   ──────────────────────────────────────────────────────────────── */

export const PAYMENT_MESSAGES = {
  CHECKOUT_CREATED:   "Checkout session created successfully.",
  PORTAL_CREATED:     "Billing portal session created successfully.",
  STATUS_FETCHED:     "Payment status fetched successfully.",
  WEBHOOK_RECEIVED:   "Webhook processed successfully.",
  WEBHOOK_IGNORED:    "Webhook event type not handled — ignored.",
  WEBHOOK_DUPLICATE:  "Webhook event already processed — skipped.",
  USER_NOT_FOUND:     "User not found.",
  UNAUTHORIZED:       "Authentication required.",
  ALREADY_PAID:       "You already have an active subscription. Manage it via the billing portal.",
  STRIPE_ERROR:       "Payment provider error. Please try again.",
} as const;

/* ─────────────────────────────────────────────────────────────────
   Stripe Price IDs — set these in your .env and read via envVars.
   Defined here as a mapping so the service never hard-codes strings.

   Structure: STRIPE_PRICE_IDS[planType][planMode] → Stripe price ID
   ──────────────────────────────────────────────────────────────── */

export type PriceLookup = Record<PaymentType, Record<PaymentMode, string>>;

/**
 * Read from environment at startup so the constant is populated at runtime.
 * Replace the placeholder strings with real env var reads once wired up.
 *
 * import { envVars } from "../config/env";
 * export const STRIPE_PRICE_IDS: PriceLookup = {
 *   PRO: {
 *     MONTHLY: envVars.STRIPE_PRO_MONTHLY_PRICE_ID,
 *     YEARLY:  envVars.STRIPE_PRO_YEARLY_PRICE_ID,
 *   },
 *   GROWTH: {
 *     MONTHLY: envVars.STRIPE_GROWTH_MONTHLY_PRICE_ID,
 *     YEARLY:  envVars.STRIPE_GROWTH_YEARLY_PRICE_ID,
 *   },
 * };
 */
export const STRIPE_PRICE_IDS: PriceLookup = {
  PRO: {
    MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID    ?? "price_pro_monthly",
    YEARLY:  process.env.STRIPE_PRO_YEARLY_PRICE_ID     ?? "price_pro_yearly",
  },
  GROWTH: {
    MONTHLY: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID ?? "price_growth_monthly",
    YEARLY:  process.env.STRIPE_GROWTH_YEARLY_PRICE_ID  ?? "price_growth_yearly",
  },
};

/* ─────────────────────────────────────────────────────────────────
   Pricing amounts in USD cents (for local record-keeping).
   Stripe is the source of truth; these are for display / audit only.
   ──────────────────────────────────────────────────────────────── */

export const PLAN_AMOUNTS_CENTS: Record<PaymentType, Record<PaymentMode, number>> = {
  PRO: {
    MONTHLY: 1900,   // $19
    YEARLY:  15600,  // $15 × 12 = $180 billed annually → $156 with 20% off
  },
  GROWTH: {
    MONTHLY: 4900,   // $49
    YEARLY:  39600,  // $39 × 12 = $468 billed annually
  },
};

/* ─────────────────────────────────────────────────────────────────
   Stripe webhook events this module handles
   All other event types are acknowledged but not processed.
   ──────────────────────────────────────────────────────────────── */

export const HANDLED_STRIPE_EVENTS = [
  "checkout.session.completed",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "customer.subscription.deleted",
  "customer.subscription.updated",
] as const;

export type HandledStripeEvent = (typeof HANDLED_STRIPE_EVENTS)[number];

/* ─────────────────────────────────────────────────────────────────
   Plan type → Workspace Plan mapping
   Used to upgrade/downgrade the Workspace.plan after payment.
   ──────────────────────────────────────────────────────────────── */

export const PAYMENT_TYPE_TO_WORKSPACE_PLAN: Record<PaymentType, "PRO" | "GROWTH"> = {
  PRO:    "PRO",
  GROWTH: "GROWTH",
};

/* ─────────────────────────────────────────────────────────────────
   Checkout session config
   ──────────────────────────────────────────────────────────────── */

export const CHECKOUT_CONFIG = {
  // Include session_id so the app can confirm the Checkout Session on return (useful in local dev).
  // Stripe replaces {CHECKOUT_SESSION_ID} automatically.
  SUCCESS_URL: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
  CANCEL_URL:  `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/pricing?cancelled=true`,
} as const;
