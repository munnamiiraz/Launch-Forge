import { type Metadata } from "next";
import { Suspense } from "react";
import { CreditCard, MessageCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/button";

import { DashboardHeader }  from "@/src/components/module/dashboard/_components/DashboardHeader";
import { CurrentPlanCard }  from "@/src/components/module/billing/_components/CurrentPlanCard";
import { UsageGauges }      from "@/src/components/module/billing/_components/UsageGauges";
import { PlanCards }        from "@/src/components/module/billing/_components/PlanCards";
import { InvoiceHistory }   from "@/src/components/module/billing/_components/InvoiceHistory";
import { BillingFaq }       from "@/src/components/module/billing/_components/BillingFaq";
import { PaymentSuccessHandler } from "@/src/components/module/billing/_components/PaymentSuccessHandler";
import { getBillingData }   from "@/src/components/module/billing/_lib/data";
import { confirmCheckoutAction } from "@/src/services/billing/_lib/billing.actions";

export const metadata: Metadata = {
  title:       "Billing — LaunchForge",
  description: "Manage your LaunchForge subscription and billing.",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-zinc-800/60" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">
        {children}
      </span>
      <div className="h-px flex-1 bg-zinc-800/60" />
    </div>
  );
}

/* ── Stripe redirect banners ─────────────────────────────────────── */
function SuccessBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-5 py-4">
      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
      <div>
        <p className="text-sm font-semibold text-emerald-300">
          Payment successful — welcome to your new plan!
        </p>
        <p className="mt-0.5 text-xs text-emerald-500/80">
          Your subscription is now active. It may take a moment for the page to reflect your updated plan.
        </p>
      </div>
    </div>
  );
}

function CancelledBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/8 px-5 py-4">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
      <div>
        <p className="text-sm font-semibold text-amber-300">
          Checkout was cancelled — no charge was made.
        </p>
        <p className="mt-0.5 text-xs text-amber-500/80">
          You can upgrade whenever you&apos;re ready.
        </p>
      </div>
    </div>
  );
}

interface BillingPageProps {
  searchParams: Promise<{ success?: string; cancelled?: string; session_id?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = await searchParams;

  // Webhooks should update the DB, but in local dev you may not have Stripe webhooks wired up.
  // If Stripe redirected back with a session_id, confirm the session server-side before loading billing state.
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

      {/* ── Sticky header ────────────────────────────────────── */}
      <DashboardHeader
        title="Billing"
        subtitle={`${currentPlan} plan · ${
          subscription?.status === "active"   ? "Active subscription"  :
          subscription?.status === "past_due" ? "Payment past due"      :
                                                "No active subscription"
        }`}
      >
        {subscription && subscription.planTier !== "FREE" && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-zinc-700/80 bg-transparent text-xs text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-200"
            asChild
          >
            <a href="mailto:support@launchforge.app">
              <MessageCircle size={12} />
              Contact support
            </a>
          </Button>
        )}
      </DashboardHeader>

      <div className="flex flex-col gap-8 p-6">

        {/* ── Stripe redirect banners ───────────────────────── */}
        {showSuccess   && <SuccessBanner />}
        {showCancelled && <CancelledBanner />}

        {/* ── Current plan hero ─────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <CurrentPlanCard subscription={subscription} />
        </section>

        {/* ── Usage + Plan grid ──────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <SectionLabel>Usage & plans</SectionLabel>
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <PlanCards currentPlan={currentPlan} />
            <UsageGauges usage={usage} />
          </div>
        </section>

        {/* ── Invoice history ────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <SectionLabel>Invoices</SectionLabel>
          <InvoiceHistory invoices={invoices} />
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <SectionLabel>FAQ</SectionLabel>
          <BillingFaq />
        </section>

        {/* ── Footer contact ──────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 py-6 text-center">
          <CreditCard size={20} className="text-zinc-700" />
          <p className="text-sm font-medium text-zinc-400">Questions about your bill?</p>
          <p className="text-xs text-zinc-600">
            Our team is happy to help with invoices, refunds, or plan questions.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-1 gap-1.5 border-zinc-700/80 bg-transparent text-xs text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-200"
            asChild
          >
            <a href="mailto:support@launchforge.app">
              <MessageCircle size={12} />
              support@launchforge.app
            </a>
          </Button>
        </div>

      </div>
    </div>
  );
}
