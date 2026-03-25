"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Client component that handles post-payment redirect.
 *
 * When the user comes back from Stripe with `?success=true&session_id=...`,
 * the server component already confirms the session. This component then:
 * 1. Cleans up the URL (removes query params)
 * 2. Uses router.refresh() to re-fetch server data so the billing page
 *    shows the updated plan without a full page reload.
 */
export function PaymentSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    const isSuccess   = searchParams.get("success") === "true";
    const isCancelled = searchParams.get("cancelled") === "true";

    if (isSuccess || isCancelled) {
      hasRun.current = true;

      // Small delay to let the server-side confirm finish processing
      const timer = setTimeout(() => {
        // Clean URL by removing query params
        window.history.replaceState({}, "", "/dashboard/billing");
        // Refresh server component data to show updated plan
        router.refresh();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  return null;
}
