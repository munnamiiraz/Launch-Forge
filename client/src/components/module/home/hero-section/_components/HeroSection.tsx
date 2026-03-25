"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";

import { LiveStatsBadge } from "./LiveStatsBadge";
import { FeaturePills } from "./FeaturePills";
import { HeroVisual } from "./HeroVisual";
import { RecentSignupsTicker } from "./RecentSignupsTicker";
import { QueryProvider } from "./QueryProvider";
import type { WaitlistStats, RecentSignup } from "../_types";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

interface HeroSectionProps {
  initialStats: WaitlistStats;
  initialRecent: RecentSignup[];
}

export function HeroSection({ initialStats, initialRecent }: HeroSectionProps) {
  return (
    <QueryProvider>
      <HeroContent initialStats={initialStats} initialRecent={initialRecent} />
    </QueryProvider>
  );
}

function HeroContent({ initialStats, initialRecent }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden -mt-8 bg-background">

      {/* ── Ambient layers ──────────────────────────────────────── */}
      {/* Primary top-left glow */}
      <div aria-hidden className="pointer-events-none absolute -left-64 -top-64 h-[700px] w-[700px] rounded-full bg-indigo-600/10 blur-[160px]" />
      {/* Secondary right glow */}
      <div aria-hidden className="pointer-events-none absolute -right-48 top-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/8 blur-[130px]" />
      {/* Bottom warmth */}
      <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 h-[400px] w-[600px] rounded-full bg-indigo-900/15 blur-[120px]" />

      {/* Grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px]" />

      {/* Radial vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.12),transparent)]" />

      {/* ── Hero body ───────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center gap-16 px-6 pb-16 pt-8 lg:flex-row lg:items-start lg:gap-12 lg:pt-16 xl:px-12">

        {/* Left column — copy + form */}
        <div className="flex w-full flex-col items-center gap-8 text-center lg:max-w-[560px] lg:items-start lg:text-left">

          {/* Announcement badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <Badge
              variant="outline"
              className="gap-2 border-indigo-500/25 bg-indigo-500/8 px-3.5 py-1.5 text-xs font-medium text-indigo-300"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Launching Q1 2025 — get early access
              <ArrowRight size={11} />
            </Badge>
          </motion.div>

          {/* Live stats bar */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <LiveStatsBadge initialStats={initialStats} />
          </motion.div>

          {/* Headline */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-foreground lg:text-6xl xl:text-7xl">
              Build waitlists
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
                  that go viral
                </span>
                {/* Underline accent */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  className="absolute -bottom-1 left-0 right-0 h-px origin-left bg-gradient-to-r from-indigo-500/60 via-violet-500/60 to-transparent"
                />
              </span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground/80">
              LaunchForge turns signups into a growth engine. Viral referral loops, 
              real-time leaderboards, and AI-powered insights — launch with momentum,
              not just a list.
            </p>
          </motion.div>

          {/* Feature pills */}
          <FeaturePills />

          {/* CTA Button */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Create a waitlist — it's free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>

          {/* Social proof — avatar stack + count */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3"
          >
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {[
                { img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", alt: "Alex K." },
                { img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", alt: "Sarah R." },
                { img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", alt: "James L." },
                { img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", alt: "Maria P." },
                { img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", alt: "Nathan B." },
              ].map((user, i) => (
                <img
                  key={i}
                  src={user.img}
                  alt={user.alt}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-zinc-950"
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/80">
                {initialStats.totalSignups.toLocaleString()} founders created their waitlists
              </p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3 w-3 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-xs text-muted-foreground/60">4.9/5 satisfaction</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right column — visual */}
        <div className="flex w-full flex-1 items-center justify-center pt-4 lg:pt-8">
          <HeroVisual />
        </div>
      </div>

      {/* ── Social proof ticker ─────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl border-t border-border/50 py-5 px-6 xl:px-12">
        <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
          <div className="h-px w-12 bg-zinc-800" />
          Recent signups
          <div className="h-px w-12 bg-zinc-800" />
        </div>
        <RecentSignupsTicker initialRecent={initialRecent} />
      </div>
    </section>
  );
}
