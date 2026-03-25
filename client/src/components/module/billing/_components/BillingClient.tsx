"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import type { BillingPageData } from "../_types";

import { CurrentPlanCard } from "./CurrentPlanCard";
import { UsageGauges }     from "./UsageGauges";
import { PlanCards }       from "./PlanCards";
import { InvoiceHistory }  from "./InvoiceHistory";
import { BillingFaq }      from "./BillingFaq";

/* ═══════════════════════════════════════════════════════════════════
   SECTION DIVIDER
   ═══════════════════════════════════════════════════════════════════ */

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-zinc-800/60" />
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-700">
        {label}
      </span>
      <div className="h-px flex-1 bg-zinc-800/60" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT EXPORT
   ═══════════════════════════════════════════════════════════════════ */

export function BillingClient({ subscription, invoices, usage }: BillingPageData) {
  const currentPlan = subscription?.planTier ?? "FREE";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6">
      
      {/* Current Subscription Hero */}
      <CurrentPlanCard subscription={subscription} />

      {/* Resource Usage Gauges */}
      {usage.length > 0 && (
        <>
          <Divider label="Usage this period" />
          <UsageGauges usage={usage} />
        </>
      )}

      {/* Available Plans & Upgrades */}
      <Divider label="Plans" />
      <PlanCards currentPlan={currentPlan} />

      {/* Subscription History */}
      <Divider label="Billing history" />
      <InvoiceHistory invoices={invoices} />

      {/* FAQ & Support */}
      <Divider label="FAQ" />
      <BillingFaq />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-800/40 bg-zinc-900/20 py-10 text-center"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-900/60">
          <MessageCircle size={16} className="text-zinc-600" />
        </div>
        <p className="text-sm font-medium text-zinc-400">Questions about your bill?</p>
        <p className="max-w-xs text-xs text-zinc-600">
          We're here to help with invoices, refunds, or plan changes. Expect a reply within 24h.
        </p>
        <a
          href="mailto:support@launchforge.app"
          className="mt-2 flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-4 py-2 text-xs text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-200"
        >
          <MessageCircle size={12} />
          support@launchforge.app
        </a>
      </motion.div>
    </div>
  );
}
