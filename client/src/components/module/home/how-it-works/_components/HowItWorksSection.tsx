"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { StepsGrid } from "./StepsGrid";
import { SectionCTA } from "./SectionCTA";

export function HowItWorksSection() {
  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 py-24 md:py-32">

      {/* ── Ambient background ──────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/6 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-48 bottom-0 h-[300px] w-[400px] rounded-full bg-violet-600/5 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-48 top-1/2 h-[300px] w-[400px] rounded-full bg-cyan-600/4 blur-[100px]"
      />

      {/* Grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:72px_72px]"
      />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <SectionHeader
          eyebrow="How It Works"
          title="From zero to viral in "
          titleHighlight="four simple steps"
          subtitle="LaunchForge turns a blank page into a self-growing audience. No engineering team required — just your idea and 2 minutes."
        />

        {/* Steps */}
        <StepsGrid />

        {/* Section CTA */}
        <SectionCTA />
      </div>
    </section>
  );
}
