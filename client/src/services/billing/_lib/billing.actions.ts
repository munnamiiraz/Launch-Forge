"use server";

import { cookies } from "next/headers";
import type { BillingMode, PlanTier } from "@/src/components/module/billing/_types";

// Prefer the same base URL used across the app (client/.env sets NEXT_PUBLIC_API_BASE_URL).
// Fallback keeps local dev working if env is missing.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

/* ── Forward the session cookie to the backend ────────────────────── */
async function authHeader(): Promise<HeadersInit> {
  const jar = await cookies();
  return {
    "Content-Type": "application/json",
    Cookie: jar.toString(),
  };
}

/* ─────────────────────────────────────────────────────────────────
   createCheckoutAction
   POST /api/payment/checkout
   Body: { planType, planMode }
   → Redirects user to Stripe Checkout
   ──────────────────────────────────────────────────────────────── */
export async function createCheckoutAction(
  planTier: PlanTier,
  mode:     BillingMode,
): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/payment/checkout`, {
      method:  "POST",
      headers: await authHeader(),
      body:    JSON.stringify({ planType: planTier, planMode: mode }),
      cache:   "no-store",
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message ?? "Failed to create checkout session." };
    }

    const checkoutUrl: string = json.data?.checkoutUrl ?? json.data?.url;
    if (!checkoutUrl) return { success: false, message: "No checkout URL returned." };

    return { success: true, url: checkoutUrl };
  } catch (err) {
    console.error("[billing] checkout error:", err);
    return { success: false, message: "Network error. Please try again." };
  }
}

/* ─────────────────────────────────────────────────────────────────
   createPortalAction
   POST /api/payment/portal
   → Opens Stripe Customer Portal (update card, cancel, invoices)
   ──────────────────────────────────────────────────────────────── */
export async function confirmCheckoutAction(
  sessionId: string,
): Promise<{ success: boolean; updated?: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/payment/confirm`, {
      method:  "POST",
      headers: await authHeader(),
      body:    JSON.stringify({ sessionId }),
      cache:   "no-store",
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message ?? "Failed to confirm checkout." };
    }

    return { success: true, updated: Boolean(json.data?.updated) };
  } catch (err) {
    console.error("[billing] confirm error:", err);
    return { success: false, message: "Network error. Please try again." };
  }
}

export async function createPortalAction(): Promise<{
  success: boolean;
  url?:    string;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/payment/portal`, {
      method:  "POST",
      headers: await authHeader(),
      cache:   "no-store",
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message ?? "Failed to open billing portal." };
    }

    const portalUrl: string = json.data?.portalUrl ?? json.data?.url;
    if (!portalUrl) return { success: false, message: "No portal URL returned." };

    return { success: true, url: portalUrl };
  } catch (err) {
    console.error("[billing] portal error:", err);
    return { success: false, message: "Network error. Please try again." };
  }
}

/* ─────────────────────────────────────────────────────────────────
   getPaymentStatusAction
   GET /api/payment/status
   → Fetch current subscription state (used by server components)
   ──────────────────────────────────────────────────────────────── */
export async function getPaymentStatusAction(): Promise<{
  success:  boolean;
  data?: {
    hasPaid: boolean;
    activePlan: "FREE" | "PRO" | "GROWTH";
    payment: {
      id: string;
      status: "PAID" | "UNPAID";
      planType: "PRO" | "GROWTH";
      planMode: "MONTHLY" | "YEARLY";
      amount: number;
      transactionId: string;
      createdAt: string;
      updatedAt: string;
    } | null;
    subscription: {
      planTier:      PlanTier;
      billingMode:   BillingMode;
      status:        "active" | "trialing" | "past_due" | "cancelled" | "none";
      amount:        number;
      currency:      string;
      nextBillingAt: string | null;
      cancelAt:      string | null;
      trialEndsAt:   string | null;
      transactionId: string;
      startedAt:     string;
    } | null;
  };
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/payment/status`, {
      method:  "GET",
      headers: await authHeader(),
      cache:   "no-store",
    });

    const json = await res.json();
    if (!res.ok) return { success: false, message: json.message };
    return { success: true, data: json.data };
  } catch (err) {
    console.error("[billing] status error:", err);
    return { success: false, message: "Network error." };
  }
}

export async function getInvoicesAction(): Promise<{
  success: boolean;
  data?: any[];
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/payment/invoices`, {
      method:  "GET",
      headers: await authHeader(),
      cache:   "no-store",
    });

    const json = await res.json();
    if (!res.ok) return { success: false, message: json.message };
    return { success: true, data: json.data };
  } catch (err) {
    console.error("[billing] invoices error:", err);
    return { success: false, message: "Network error." };
  }
}
