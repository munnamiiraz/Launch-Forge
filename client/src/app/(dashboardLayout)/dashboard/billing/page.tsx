import { type Metadata } from "next";
import { Suspense } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

import { DashboardHeader }  from "@/src/components/module/dashboard/_components/DashboardHeader";
import { BillingClient }    from "@/src/components/module/billing/_components/BillingClient";
import { PaymentSuccessHandler } from "@/src/components/module/billing/_components/PaymentSuccessHandler";
import { getBillingData }   from "@/src/components/module/billing/_lib/data";
import { confirmCheckoutAction } from "@/src/services/billing/_lib/billing.actions";

export const metadata: Metadata = {
  title:       "Billing — LaunchForge",
  description: "Manage your LaunchForge subscription and billing.",
};

interface BillingPageProps {
  searchParams: Promise<{ success?: string; cancelled?: string; session_id?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = await searchParams;

  // Confirm checkout server-side if Stripe redirects back with a session_id
  if (params.success === "true" && params.session_id) {
    await confirmCheckoutAction(params.session_id);
  }

  const { subscription, invoices, usage } = await getBillingData();

  const currentPlan  = subscription?.planTier ?? "FREE";
  const showSuccess  = params.success  === "true";
  const showCancelled= params.cancelled === "true";

  return (
    <div className="flex flex-col">

      {/* Client-side handler: refreshes data after Stripe redirect */}
      <Suspense fallback={null}>
        <PaymentSuccessHandler />
      </Suspense>

      <DashboardHeader
        title="Billing"
        subtitle={`${currentPlan} plan · ${
          subscription?.status === "active"   ? "Active subscription"  :
          subscription?.status === "past_due" ? "Payment past due"      :
                                                "No active subscription"
        }`}
      />

      <div className="flex flex-col gap-0">
        
        {/* Stripe Success Banner */}
        {showSuccess && (
          <div className="mx-6 mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 dark:bg-emerald-500/8 px-5 py-4">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Payment successful — welcome to your new plan!</p>
              <p className="mt-0.5 text-xs text-emerald-600/70 dark:text-emerald-500/70">Your subscription is now active. It may take a moment to reflect.</p>
            </div>
          </div>
        )}

        {/* Stripe Cancelled Banner */}
        {showCancelled && (
          <div className="mx-6 mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 dark:bg-amber-500/8 px-5 py-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Checkout cancelled — no charge was made.</p>
              <p className="mt-0.5 text-xs text-amber-600/70 dark:text-amber-500/70">You can upgrade whenever you're ready.</p>
            </div>
          </div>
        )}

        <BillingClient
          subscription={subscription}
          invoices={invoices}
          usage={usage}
        />
      </div>

    </div>
  );
}
