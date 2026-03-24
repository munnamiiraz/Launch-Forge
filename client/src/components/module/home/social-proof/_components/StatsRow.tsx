"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Separator } from "@/src/components/ui/separator";
import { STATS } from "../_lib/social-proof-data";
import { cn } from "@/src/lib/utils";

const ACCENT_VALUE: Record<string, string> = {
  indigo:  "text-indigo-300",
  violet:  "text-violet-300",
  emerald: "text-emerald-300",
  amber:   "text-amber-300",
  cyan:    "text-cyan-300",
};

const ACCENT_TREND: Record<string, string> = {
  indigo:  "text-indigo-400/80",
  violet:  "text-violet-400/80",
  emerald: "text-emerald-400/80",
  amber:   "text-amber-400/80",
  cyan:    "text-cyan-400/80",
};

const ACCENT_BAR: Record<string, string> = {
  indigo:  "bg-indigo-500/60",
  violet:  "bg-violet-500/60",
  emerald: "bg-emerald-500/60",
  amber:   "bg-amber-500/60",
  cyan:    "bg-cyan-500/60",
};

export function StatsRow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 backdrop-blur-sm"
    >
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="grid grid-cols-2 divide-x divide-y divide-border/60 md:grid-cols-4 md:divide-y-0">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex flex-col gap-2 px-6 py-7"
          >
            {/* Hover glow */}
            <div className={cn(
              "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
              "bg-gradient-to-b from-white/[0.02] to-transparent"
            )} />

            {/* Value */}
            <span className={cn("text-3xl font-black tracking-tight md:text-4xl", ACCENT_VALUE[stat.accent])}>
              {stat.value}
            </span>

            {/* Label */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground/80">{stat.label}</span>
              {stat.sublabel && (
                <span className="text-xs text-muted-foreground/60">{stat.sublabel}</span>
              )}
            </div>

            {/* Trend */}
            {stat.trend && (
              <div className="flex items-center gap-1.5">
                {stat.trendPositive && stat.accent !== "amber" && (
                  <TrendingUp size={11} className={ACCENT_TREND[stat.accent]} />
                )}
                <span className={cn("text-[11px] font-medium", ACCENT_TREND[stat.accent])}>
                  {stat.trend}
                </span>
              </div>
            )}

            {/* Bottom accent bar — animated width */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "32px" }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 + 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn("h-0.5 rounded-full", ACCENT_BAR[stat.accent])}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
