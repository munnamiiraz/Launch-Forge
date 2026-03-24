"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";

export function FooterCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 px-8 py-12 text-center md:px-16"
    >
      {/* Background accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[220px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[80px]"
      />

      {/* Top gradient line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/15">
          <Zap size={22} className="text-indigo-400" />
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Ready to launch with momentum?
          </h2>
          <p className="mx-auto max-w-md text-base text-muted-foreground/80">
            Join 2,847 founders already using LaunchForge to build waitlists
            that compound. Start free, scale as you grow.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className={
              "group relative overflow-hidden bg-indigo-600 px-6 font-semibold text-white hover:bg-indigo-500 transition-all duration-200"
            }
          >
            <Link href="/register">
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              Start for free
              <ArrowRight
                size={16}
                className="ml-1.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="lg"
            className="px-6 text-muted-foreground hover:bg-muted/60 hover:text-foreground/90"
          >
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>

        {/* Micro trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            "Free forever plan",
            "No credit card required",
            "2-minute setup",
          ].map((text) => (
            <span key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom gradient line */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent"
      />
    </motion.div>
  );
}
