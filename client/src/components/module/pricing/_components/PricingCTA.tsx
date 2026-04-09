"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function PricingCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card/60 px-8 py-14 text-center shadow-indigo-500/5"
    >
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[80px]"
      />
      {/* Top line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent"
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/15">
          <Zap size={22} className="text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Copy */}
        <div className="flex flex-col gap-2">
          <h3 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Start growing your waitlist today
          </h3>
          <p className="mx-auto max-w-md text-base text-muted-foreground/80">
            Join 2,847 founders already using LaunchForge. Set up in 2 minutes,
            no engineering required.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group relative overflow-hidden bg-indigo-600 px-7 font-semibold text-white hover:bg-indigo-500 transition-all duration-200"
          >
            <Link href="/register">
              <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              <Zap size={15} className="text-indigo-300" />
              Create your waitlist
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {[
            { icon: <ShieldCheck size={12} />, text: "No credit card required" },
            { icon: <Zap size={12} />, text: "Free forever plan" },
            { icon: <ShieldCheck size={12} />, text: "14-day money-back guarantee" },
          ].map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-muted-foreground/60">{icon}</span>
              {text}
            </span>
          ))}
          <p className="text-sm text-muted-foreground/80">
            Still have questions?{" "}
            <a href="/contact" className="text-indigo-600 underline-offset-4 hover:underline transition-colors font-medium">
              Contact us
            </a>
          </p>
        </div>
      </div>

      {/* Bottom line */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border to-transparent"
      />
    </motion.div>
  );
}
