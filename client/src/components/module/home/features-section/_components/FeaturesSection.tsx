"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import { FeaturesGrid } from "./FeaturesGrid";

export function FeaturesSection() {
  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 py-24 md:py-32">

      {/* ── Ambient layers (consistent with hero + how-it-works) ── */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/6 blur-[150px]" />
      <div aria-hidden className="pointer-events-none absolute -left-56 bottom-1/4 h-[350px] w-[450px] rounded-full bg-violet-600/5 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -right-56 top-1/3 h-[350px] w-[450px] rounded-full bg-cyan-600/4 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8">

        {/* ── Section header ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <Badge
            variant="outline"
            className="gap-2 border-indigo-500/25 bg-indigo-500/8 px-3.5 py-1.5 text-xs font-medium text-indigo-300"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Features
          </Badge>

          <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-100 md:text-5xl">
            Not just a waitlist —{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              a growth engine
            </span>
          </h2>

          <p className="max-w-xl text-base leading-relaxed text-zinc-500">
            Every feature is designed to turn passive sign-ups into active
            advocates. From viral referrals to public roadmaps — this is the
            full launch stack.
          </p>
        </motion.div>

        {/* ── Feature grid ──────────────────────────────────────── */}
        <FeaturesGrid />

        {/* ── Bottom CTA ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-6"
        >
          <Separator className="bg-zinc-800/50" />

          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-zinc-500">
              Everything you need to launch with{" "}
              <span className="font-medium text-zinc-300">confidence</span>.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden bg-indigo-600 px-7 font-semibold text-white hover:bg-indigo-500 transition-all duration-200"
              >
                <Link href="/register">
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                  <Zap size={15} className="text-indigo-300" />
                  Get started free
                  <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="lg"
                className="px-7 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
              >
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>

            <p className="text-xs text-zinc-700">
              Free forever plan · No credit card · 2-minute setup
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
