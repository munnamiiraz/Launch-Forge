"use client";

import { motion } from "framer-motion";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";

import { StatsRow }        from "./StatsRow";
import { TestimonialCard } from "./TestimonialCard";
import { LogoStrip }       from "./LogoStrip";
import { TESTIMONIALS }    from "../_lib/social-proof-data";

export function SocialProofSection() {
  const featured   = TESTIMONIALS.filter((t) => t.featured);
  const supporting = TESTIMONIALS.filter((t) => !t.featured);

  return (
    <section className="relative w-full overflow-hidden bg-background py-24 md:py-32">

      {/* ── Ambient layers (consistent system) ──────────────── */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/6 blur-[150px]" />
      <div aria-hidden className="pointer-events-none absolute -right-56 bottom-1/3 h-[350px] w-[450px] rounded-full bg-violet-600/5 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -left-56 top-1/3 h-[300px] w-[400px] rounded-full bg-cyan-600/4 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-size-[72px_72px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8">

        {/* ── Section header ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <Badge
            variant="outline"
            className="gap-2 border-indigo-500/25 bg-indigo-500/8 px-3.5 py-1.5 text-xs font-medium text-indigo-300"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Social Proof
          </Badge>

          <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Founders who launched{" "}
            <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              with momentum
            </span>
          </h2>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground/80">
            Over 2,800 founders have used LaunchForge to turn cold waitlists into
            warm, growing communities before writing a single line of product code.
          </p>
        </motion.div>

        {/* ── Stats row ──────────────────────────────────────── */}
        <StatsRow />

        {/* ── Testimonials grid ──────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Row 1: featured (2-col) + first supporting card */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {featured.map((t, i) => (
              <TestimonialCard key={t.id} testimonial={t} index={i} />
            ))}
            {supporting[0] && (
              <TestimonialCard testimonial={supporting[0]} index={featured.length} />
            )}
          </div>

          {/* Row 2: remaining supporting cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {supporting.slice(1).map((t, i) => (
              <TestimonialCard key={t.id} testimonial={t} index={i + featured.length + 1} />
            ))}
          </div>
        </div>

        {/* ── Divider ────────────────────────────────────────── */}
        <Separator className="bg-zinc-800/50" />

        {/* ── Logo strip ─────────────────────────────────────── */}
        <LogoStrip />
      </div>
    </section>
  );
}
