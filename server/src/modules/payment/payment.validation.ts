import { z } from "zod";

/* ─────────────────────────────────────────────────────────────────
   POST /api/payment/checkout
   ──────────────────────────────────────────────────────────────── */

export const createCheckoutSchema = z.object({
  planType: z.enum(["PRO", "GROWTH"] as const, {
    message: "planType must be 'PRO' or 'GROWTH'.",
  }),

  planMode: z.enum(["MONTHLY", "YEARLY"] as const, {
    message: "planMode must be 'MONTHLY' or 'YEARLY'.",
  }),
});

/* POST /api/payment/confirm
   Body: { sessionId }
   Confirms a Stripe Checkout Session after redirect back to the app. */
export const confirmCheckoutSchema = z.object({
  sessionId: z
    .string("sessionId is required.")
    .min(1, "sessionId must not be empty."),
});

/* ─────────────────────────────────────────────────────────────────
   POST /api/payment/webhook
   The raw body is handled by Express before this validator runs.
   We only validate the Stripe-Signature header presence here.
   Body signature verification happens in the controller via Stripe SDK.
   ──────────────────────────────────────────────────────────────── */

export const webhookHeaderSchema = z.object({
  "stripe-signature": z
    .string("Missing Stripe-Signature header.")
    .min(1, "Stripe-Signature header must not be empty."),
});

/* ─────────────────────────────────────────────────────────────────
   Payment ID param
   ──────────────────────────────────────────────────────────────── */

export const paymentIdParamSchema = z.object({
  id: z
    .string("Payment ID is required.")
    .uuid("Payment ID must be a valid UUID."),
});

/* ─────────────────────────────────────────────────────────────────
   Inferred DTOs
   ──────────────────────────────────────────────────────────────── */

export type CreateCheckoutDto = z.infer<typeof createCheckoutSchema>;
