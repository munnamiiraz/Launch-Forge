import { Payment } from "../../../generated/client";

/* ─────────────────────────────────────────────────────────────────
   Enum mirrors (match Prisma exactly)
   ──────────────────────────────────────────────────────────────── */

export type PaymentStatus = "PAID" | "UNPAID";
export type PaymentMode   = "MONTHLY" | "YEARLY";
export type PaymentType   = "PRO" | "GROWTH";

/* ─────────────────────────────────────────────────────────────────
   Service-layer payloads
   ──────────────────────────────────────────────────────────────── */

/** POST /api/payment/checkout — create a Stripe Checkout session */
export interface CreateCheckoutPayload {
  requestingUserId: string;
  planType:         PaymentType;
  planMode:         PaymentMode;
}

/** GET /api/payment/status — get the caller's current payment record */
export interface GetPaymentStatusPayload {
  requestingUserId: string;
}

/** POST /api/payment/webhook — raw Stripe event already verified */
export interface HandleWebhookPayload {
  stripeEventId:  string;
  eventType:      string;
  /** The raw deserialized Stripe event object */
  stripeEvent:    StripeEventData;
}

/** POST /api/payment/portal — customer billing portal session */
export interface CreatePortalSessionPayload {
  requestingUserId: string;
}

/** POST /api/payment/confirm - confirm a Checkout Session after returning from Stripe */
export interface ConfirmCheckoutPayload {
  requestingUserId: string;
  sessionId: string;
}

/* ─────────────────────────────────────────────────────────────────
   Stripe event shape (only the fields we actually use)
   ──────────────────────────────────────────────────────────────── */

export interface StripeEventData {
  id:   string;
  type: string;
  data: {
    object: StripeCheckoutSession | StripeInvoice | StripeSubscription;
  };
}

export interface StripeCheckoutSession {
  id:               string;
  object:           "checkout.session";
  customer:         string;
  customer_email:   string | null;
  payment_status:   "paid" | "unpaid" | "no_payment_required";
  amount_total:     number | null;
  currency:         string;
  metadata:         Record<string, string>;   // userId, planType, planMode
  subscription:     string | null;
  payment_intent:   string | null;
}

export interface StripeInvoice {
  id:               string;
  object:           "invoice";
  customer:         string;
  status:           "paid" | "open" | "void" | "uncollectible";
  amount_paid:      number;
  currency:         string;
  subscription:     string;
  metadata:         Record<string, string>;
}

export interface StripeSubscription {
  id:               string;
  object:           "subscription";
  customer:         string;
  status:           "active" | "canceled" | "past_due" | "trialing" | "unpaid";
  metadata:         Record<string, string>;
  current_period_end: number;
}

/* ─────────────────────────────────────────────────────────────────
   Response shapes
   ──────────────────────────────────────────────────────────────── */

export interface CheckoutSessionResult {
  checkoutUrl: string;
  sessionId:   string;
}

export interface PortalSessionResult {
  portalUrl: string;
}

export type PaymentRecord = Pick<
  Payment,
  | "id"
  | "status"
  | "planType"
  | "planMode"
  | "amount"
  | "transactionId"
  | "createdAt"
  | "updatedAt"
>;

export interface ActiveSubscriptionInfo {
  planTier:      PaymentType;
  billingMode:   PaymentMode;
  status:        "active" | "trialing" | "past_due" | "cancelled" | "none";
  amount:        number;
  currency:      string;
  nextBillingAt: string | null;  // ISO date
  cancelAt:      string | null;  // ISO date
  trialEndsAt:   string | null;
  transactionId: string;
  startedAt:     string;
}

export interface PaymentStatusResult {
  hasPaid:      boolean;
  payment:      PaymentRecord | null;
  /** Resolved plan slug for the workspace plan gate */
  activePlan:   "FREE" | "PRO" | "GROWTH";
  /** Detailed subscription info for the billing page UI */
  subscription: ActiveSubscriptionInfo | null;
}

/** Returned by the webhook handler to the controller */
export interface WebhookHandledResult {
  processed: boolean;
  eventType: string;
}
