"use client";

import { motion } from "framer-motion";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import type { HowItWorksStep, StepAccent } from "@/src/components/module/home/how-it-works/_types";
import { cn } from "@/src/lib/utils";

/* ── Per-accent colour maps ─────────────────────────────────────── */
const ACCENT: Record<
  StepAccent,
  {
    icon:    string;
    border:  string;
    glow:    string;
    num:     string;
    tag:     string;
    line:    string;
    dot:     string;
  }
> = {
  indigo: {
    icon:   "border-indigo-500/30 bg-indigo-500/12 text-indigo-400",
    border: "hover:border-indigo-500/30",
    glow:   "group-hover:shadow-indigo-500/8",
    num:    "text-indigo-500/40",
    tag:    "border-indigo-500/25 bg-indigo-500/8 text-indigo-400",
    line:   "from-indigo-500/60 to-indigo-500/0",
    dot:    "bg-indigo-500",
  },
  violet: {
    icon:   "border-violet-500/30 bg-violet-500/12 text-violet-400",
    border: "hover:border-violet-500/30",
    glow:   "group-hover:shadow-violet-500/8",
    num:    "text-violet-500/40",
    tag:    "border-violet-500/25 bg-violet-500/8 text-violet-400",
    line:   "from-violet-500/60 to-violet-500/0",
    dot:    "bg-violet-500",
  },
  cyan: {
    icon:   "border-cyan-500/30 bg-cyan-500/12 text-cyan-400",
    border: "hover:border-cyan-500/30",
    glow:   "group-hover:shadow-cyan-500/8",
    num:    "text-cyan-500/40",
    tag:    "border-cyan-500/25 bg-cyan-500/8 text-cyan-400",
    line:   "from-cyan-500/60 to-cyan-500/0",
    dot:    "bg-cyan-500",
  },
  emerald: {
    icon:   "border-emerald-500/30 bg-emerald-500/12 text-emerald-400",
    border: "hover:border-emerald-500/30",
    glow:   "group-hover:shadow-emerald-500/8",
    num:    "text-emerald-500/40",
    tag:    "border-emerald-500/25 bg-emerald-500/8 text-emerald-400",
    line:   "from-emerald-500/60 to-emerald-500/0",
    dot:    "bg-emerald-500",
  },
};

interface StepCardProps {
  step: HowItWorksStep;
  isLast: boolean;
  index: number;
}

export function StepCard({ step, isLast, index }: StepCardProps) {
  const a = ACCENT[step.accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        delay: index * 0.1,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative flex flex-1 flex-col"
    >
      {/* ── Horizontal connector (desktop) ──────────────────── */}
      {!isLast && (
        <div
          aria-hidden
          className="absolute left-[calc(50%+44px)] right-0 top-[28px] hidden h-px lg:block"
        >
          {/* Static track */}
          <div className="absolute inset-0 bg-zinc-800" />
          {/* Animated fill */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.1 + 0.4,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
              "absolute inset-y-0 left-0 origin-left bg-gradient-to-r",
              a.line
            )}
          />
          {/* Arrow head */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 border-b-[3px] border-r-[3px] border-zinc-700 h-2 w-2 rotate-[-45deg]" />
        </div>
      )}

      {/* ── Card ────────────────────────────────────────────── */}
      <Card
        className={cn(
          "group relative overflow-hidden border-border/80 bg-card/40",
          "backdrop-blur-sm transition-all duration-300",
          "hover:bg-card/60 hover:shadow-xl",
          a.border,
          a.glow
        )}
      >
        {/* Top gradient line */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
            `via-${step.accentColor}-500/40`
          )}
        />

        {/* Subtle corner glow on hover */}
        <div
          className={cn(
            "absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-0",
            "transition-opacity duration-300 group-hover:opacity-100",
            `bg-${step.accentColor}-500/10`
          )}
        />

        <CardContent className="relative flex flex-col gap-5 p-6 pt-16">
          {/* Step number — large ghost numeral */}
          <span
            className={cn(
              "absolute -top-1 right-4 select-none font-bold text-[56px] leading-none tracking-tighter opacity-100",
              a.num
            )}
          >
            {String(step.step).padStart(2, "0")}
          </span>

          {/* Icon + tag row */}
          <div className="flex items-start justify-between">
            {/* Icon bubble */}
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl border",
                "transition-transform duration-300 group-hover:scale-110",
                a.icon
              )}
            >
              {step.icon}
            </div>

            {/* Tag pill */}
            {step.tag && (
              <Badge
                variant="outline"
                className={cn(
                  "mt-0.5 h-5 rounded-full px-2.5 text-[10px] font-semibold",
                  a.tag
                )}
              >
                {step.tag}
              </Badge>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground/80">
              {step.description}
            </p>
          </div>

          {/* Bottom accent dot */}
          <div className="flex items-center gap-2">
            <span className={cn("h-1.5 w-1.5 rounded-full", a.dot)} />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
              Step {step.step}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Vertical connector (mobile) ─────────────────────── */}
      {!isLast && (
        <div
          aria-hidden
          className="mx-auto mt-2 flex flex-col items-center gap-1 lg:hidden"
        >
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.1 + 0.3,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
              "h-8 w-px origin-top bg-gradient-to-b",
              a.line
            )}
          />
          <div className={cn("h-1.5 w-1.5 rounded-full", a.dot)} />
        </div>
      )}
    </motion.div>
  );
}
