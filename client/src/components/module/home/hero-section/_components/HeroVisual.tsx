"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Share2, Zap, ArrowUpRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

const barData = [38, 55, 42, 70, 63, 88, 75, 95, 82, 100, 91, 78];

const referralRows = [
  { name: "Sarah K.", referrals: 12, spots: 60, pct: 100 },
  { name: "Marcus T.", referrals: 8, spots: 40, pct: 67 },
  { name: "Priya M.", referrals: 5, spots: 25, pct: 42 },
  { name: "James R.", referrals: 3, spots: 15, pct: 25 },
];

export function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 32, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-lg"
    >
      {/* Outer glow */}
      <div className="absolute -inset-4 rounded-3xl bg-indigo-600/8 blur-2xl" />

      {/* Main card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-background/95 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl">

        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-border" />
            <div className="h-2.5 w-2.5 rounded-full bg-border" />
            <div className="h-2.5 w-2.5 rounded-full bg-border" />
          </div>
          <div className="mx-auto flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">launchforge.app/dashboard</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Top stat cards row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Total Signups"
              value="2,847"
              delta="+143 today"
              deltaPositive
              icon={<Users size={13} className="text-indigo-600 dark:text-indigo-400" />}
              delay={0.5}
            />
            <StatCard
              label="Viral Score"
              value="3.2×"
              delta="+0.4 this week"
              deltaPositive
              icon={<Share2 size={13} className="text-violet-600 dark:text-violet-400" />}
              delay={0.57}
            />
            <StatCard
              label="Conversion"
              value="68%"
              delta="+12% vs avg"
              deltaPositive
              icon={<TrendingUp size={13} className="text-emerald-600 dark:text-emerald-400" />}
              delay={0.64}
            />
          </div>

          {/* Growth chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-border/60 bg-card/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Signups growth</p>
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
                <ArrowUpRight size={10} />
                +34% this month
              </span>
            </div>

            {/* Bar chart */}
            <div className="flex h-16 items-end gap-1">
              {barData.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{
                    delay: 0.8 + i * 0.04,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ height: `${h}%`, originY: 1 }}
                  className={cn(
                    "flex-1 rounded-sm transition-colors",
                    i === barData.length - 1
                      ? "bg-indigo-500"
                      : i >= barData.length - 3
                        ? "bg-indigo-500/60"
                        : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* X axis labels */}
            <div className="mt-1.5 flex justify-between text-[9px] text-muted-foreground/40">
              <span>Jan</span>
              <span>Apr</span>
              <span>Jul</span>
              <span>Oct</span>
              <span>Dec</span>
            </div>
          </motion.div>

          {/* Top referrers table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.88, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-border/60 bg-card/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Top referrers</p>
              <div className="flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/8 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                <Zap size={8} />
                Live
              </div>
            </div>

            <div className="space-y-2.5">
              {referralRows.map((row, i) => (
                <motion.div
                  key={row.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.95 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3"
                >
                  <div className="w-20 shrink-0 truncate text-xs text-muted-foreground">
                    {row.name}
                  </div>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${row.pct}%` }}
                        transition={{ delay: 1.0 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-y-0 left-0 rounded-full bg-indigo-500"
                      />
                    </div>
                    <span className="w-8 text-right text-[10px] text-muted-foreground/80">
                      {row.referrals} refs
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating notification card */}
      <motion.div
        initial={{ opacity: 0, y: 10, x: 10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 1.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-4 -left-6 flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/95 px-4 py-3 shadow-xl backdrop-blur-xl"
      >
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
            alt="Alex K."
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
        </div>
        <div>
          <p className="text-[11px] font-medium text-foreground/80">Alex K. just joined!</p>
          <p className="text-[10px] text-muted-foreground/60">via referral link · 2s ago</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  delta,
  deltaPositive,
  icon,
  delay,
}: {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-border/60 bg-card/40 p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/60">{label}</span>
        {icon}
      </div>
      <p className="text-base font-bold tracking-tight text-foreground">{value}</p>
      <p className={cn("mt-0.5 text-[10px]", deltaPositive ? "text-emerald-500" : "text-red-400")}>
        {delta}
      </p>
    </motion.div>
  );
}
