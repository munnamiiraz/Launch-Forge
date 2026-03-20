"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";

import { PricingToggle } from "./PricingToggle";
import { PricingCard }   from "./PricingCard";
import { FeatureTable }  from "./FeatureTable";
import { PricingFAQ }    from "./PricingFAQ";
import { PricingCTA }    from "./PricingCTA";
import { PLANS }         from "../_lib/pricing-data";
import type { BillingCycle } from "../_types";

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 py-24 md:py-32">

      {/* ── Ambient layers ───────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/7 blur-[150px]" />
      <div aria-hidden className="pointer-events-none absolute -right-56 bottom-1/4 h-[350px] w-[450px] rounded-full bg-violet-600/5 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -left-56 top-1/3 h-[300px] w-[400px] rounded-full bg-cyan-600/4 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-20 px-4 sm:px-6 lg:px-8">

        {/* ── Section header ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <Badge
            variant="outline"
            className="gap-2 border-indigo-500/25 bg-indigo-500/8 px-3.5 py-1.5 text-xs font-medium text-indigo-300"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Pricing
          </Badge>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100 md:text-5xl xl:text-6xl">
              Simple, transparent{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
                pricing
              </span>
            </h1>
            <p className="text-lg text-zinc-500">
              Start free. Scale as you grow.
            </p>
          </div>

          {/* Billing toggle */}
          <PricingToggle cycle={cycle} onChange={setCycle} />
        </motion.div>

        {/* ── Pricing cards ───────────────────────────────────── */}
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} cycle={cycle} index={i} />
          ))}
        </div>

        {/* ── Comparison table ────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
              Compare all features
            </h2>
            <p className="max-w-md text-sm text-zinc-500">
              A full breakdown of what's included in every plan.
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <FeatureTable />
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-800/50" />

        {/* ── FAQ ─────────────────────────────────────────────── */}
        <PricingFAQ />

        <Separator className="bg-zinc-800/50" />

        {/* ── Bottom CTA ──────────────────────────────────────── */}
        <PricingCTA />
      </div>
    </section>
  );
}
