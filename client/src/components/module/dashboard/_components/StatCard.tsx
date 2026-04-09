"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

type Accent = "indigo" | "violet" | "emerald" | "amber" | "cyan" | "rose";

const ACCENT: Record<Accent, { icon: string; value: string; glow: string; dot: string }> = {
  indigo:  { icon: "border-indigo-500/20 dark:border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/12 text-indigo-600 dark:text-indigo-400",  value: "text-indigo-600 dark:text-indigo-300",  glow: "group-hover:shadow-indigo-500/8",  dot: "bg-indigo-500" },
  violet:  { icon: "border-violet-500/20 dark:border-violet-500/30 bg-violet-500/10 dark:bg-violet-500/12 text-violet-600 dark:text-violet-400",  value: "text-violet-600 dark:text-violet-300",  glow: "group-hover:shadow-violet-500/8",  dot: "bg-violet-500" },
  emerald: { icon: "border-emerald-500/20 dark:border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/12 text-emerald-600 dark:text-emerald-400", value: "text-emerald-600 dark:text-emerald-300", glow: "group-hover:shadow-emerald-500/8", dot: "bg-emerald-500" },
  amber:   { icon: "border-amber-500/20 dark:border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/12 text-amber-600 dark:text-amber-400",    value: "text-amber-600 dark:text-amber-300",   glow: "group-hover:shadow-amber-500/8",   dot: "bg-amber-500" },
  cyan:    { icon: "border-cyan-500/20 dark:border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-500/12 text-cyan-600 dark:text-cyan-400",        value: "text-cyan-600 dark:text-cyan-300",    glow: "group-hover:shadow-cyan-500/8",    dot: "bg-cyan-500" },
  rose:    { icon: "border-rose-500/20 dark:border-rose-500/30 bg-rose-500/10 dark:bg-rose-500/12 text-rose-600 dark:text-rose-400",        value: "text-rose-600 dark:text-rose-300",    glow: "group-hover:shadow-rose-500/8",    dot: "bg-rose-500" },
};

interface StatCardProps {
  label:      string;
  value:      string | number;
  delta?:     string;
  deltaType?: "up" | "down" | "neutral";
  subtext?:   string;
  icon:       React.ReactNode;
  accent:     Accent;
  index?:     number;
}

export function StatCard({
  label, value, delta, deltaType = "neutral",
  subtext, icon, accent, index = 0,
}: StatCardProps) {
  const a = ACCENT[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className={cn(
        "group relative overflow-hidden border-border bg-card dark:bg-card/40 backdrop-blur-sm",
        "transition-all duration-300 hover:bg-muted/5 dark:hover:bg-card/60 hover:shadow-xl",
        "shadow-indigo-500/5 dark:shadow-none",
        a.glow
      )}>
        {/* top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent transition-all duration-300 group-hover:via-indigo-500/30" />

        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground/80">{label}</p>
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-110", a.icon)}>
              {icon}
            </div>
          </div>

          <p className={cn("text-2xl font-black tracking-tight", a.value)}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>

          {(delta || subtext) && (
            <div className="mt-2 flex items-center gap-1.5">
              {delta && (
                <span className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  deltaType === "up"      ? "text-emerald-400"
                  : deltaType === "down"  ? "text-red-400"
                  : "text-muted-foreground/60"
                )}>
                  {deltaType === "up"      ? <TrendingUp  size={11} /> :
                   deltaType === "down"    ? <TrendingDown size={11} /> :
                   <Minus size={11} />}
                  {delta}
                </span>
              )}
              {subtext && (
                <span className="text-[11px] text-muted-foreground/60">{subtext}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
