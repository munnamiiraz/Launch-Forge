"use server";

import type { BillingMode, PlanTier } from "@/src/components/module/billing/_types";

export async function createCheckoutAction(
  planTier: PlanTier,
  mode:     BillingMode,
): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    /**
     * Real:
     * const res = await fetch(`${process.env.BACKEND_URL}/api/payment/checkout`, {
     *   method: "POST",
     *   headers: { "Content-Type": "application/json", Cookie: cookies().toString() },
     *   body: JSON.stringify({ planType: planTier, planMode: mode }),
     * });
     * const data = await res.json();
     * return { success: true, url: data.data.checkoutUrl };
     */
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, url: "https://checkout.stripe.com/demo" };
  } catch {
    return { success: false, message: "Failed to create checkout session." };
  }
}

export async function createPortalAction(): Promise<{
  success: boolean;
  url?: string;
  message?: string;
}> {
  try {
    /**
     * Real:
     * const res = await fetch(`${process.env.BACKEND_URL}/api/payment/portal`, {
     *   method: "POST",
     *   headers: { Cookie: cookies().toString() },
     * });
     * const data = await res.json();
     * return { success: true, url: data.data.portalUrl };
     */
    await new Promise((r) => setTimeout(r, 600));
    return { success: true, url: "https://billing.stripe.com/demo" };
  } catch {
    return { success: false, message: "Failed to open billing portal." };
  }
}