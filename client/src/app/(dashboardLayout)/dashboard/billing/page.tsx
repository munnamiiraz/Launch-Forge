import { type Metadata } from "next";
import { CreditCard, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";

import { DashboardHeader }  from "@/src/components/module/dashboard/_components/DashboardHeader";
import { CurrentPlanCard }  from "@/src/components/module/billing/_components/CurrentPlanCard";
import { UsageGauges }      from "@/src/components/module/billing/_components/UsageGauges";
import { PlanCards }        from "@/src/components/module/billing/_components/PlanCards";
import { InvoiceHistory }   from "@/src/components/module/billing/_components/InvoiceHistory";
import { BillingFaq }       from "@/src/components/module/billing/_components/BillingFaq";
import { getBillingData }   from "@/src/components/module/billing/_lib/data";

export const metadata: Metadata = {
  title:       "Billing — LaunchForge",
  description: "Manage your LaunchForge subscription and billing.",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-muted/60" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        {children}
      </span>
      <div className="h-px flex-1 bg-muted/60" />
    </div>
  );
}

export default async function BillingPage() {
  const { subscription, invoices, usage } = await getBillingData();

  const currentPlan = subscription?.planTier ?? "FREE";

  return (
    <div className="flex flex-col">

      {/* ── Sticky header ────────────────────────────────────── */}
      <DashboardHeader
        title="Billing"
        subtitle={`${currentPlan} plan · ${
          subscription?.status === "active" ? "Active subscription" :
          subscription?.status === "past_due" ? "Payment past due" :
          "No active subscription"
        }`}
      >
        {subscription && subscription.planTier !== "FREE" && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-zinc-700/80 bg-transparent text-xs text-muted-foreground hover:border-zinc-600 hover:bg-muted/60 hover:text-foreground/90"
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

        {/* ── Current plan hero ─────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <CurrentPlanCard subscription={subscription} />
        </section>

        {/* ── Usage + Plan grid ──────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <SectionLabel>Usage & plans</SectionLabel>
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            {/* Plans */}
            <PlanCards currentPlan={currentPlan} />
            {/* Usage gauges */}
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

        {/* ── Footer contact strip ───────────────────────────── */}
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-zinc-900/20 py-6 text-center">
          <CreditCard size={20} className="text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Questions about your bill?</p>
          <p className="text-xs text-muted-foreground/60">
            Our team is happy to help with invoices, refunds, or plan questions.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-1 gap-1.5 border-zinc-700/80 bg-transparent text-xs text-muted-foreground hover:border-zinc-600 hover:bg-muted/60 hover:text-foreground/90"
            asChild
          >
            <a href="mailto:support@launchforge.app">
              <MessageCircle size={12} />
              support@launchforge.app
              <ExternalLink size={10} />
            </a>
          </Button>
        </div>

      </div>
    </div>
  );
}