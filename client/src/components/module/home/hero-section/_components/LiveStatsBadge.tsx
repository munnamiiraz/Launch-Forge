"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp, Zap } from "lucide-react";
import { useWaitlistStats } from "../../../../../hooks/hero-section/useWaitlist";
import type { WaitlistStats } from "../_types";
import { cn } from "@/src/lib/utils";

function formatNumber(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

interface LiveStatsBadgeProps {
  initialStats?: WaitlistStats;
}

export function LiveStatsBadge({ initialStats }: LiveStatsBadgeProps) {
  const { data: stats } = useWaitlistStats(initialStats);

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap items-center justify-center gap-3"
    >
      {/* Live indicator pill */}
      <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[11px] font-medium text-emerald-400">Live</span>
      </div>

      {/* Stat chips */}
      <StatChip
        icon={<Users size={11} />}
        value={`${formatNumber(stats.totalSignups)} joined`}
        color="indigo"
      />
      <StatChip
        icon={<TrendingUp size={11} />}
        value={`+${stats.signupsLast24h} today`}
        color="violet"
      />
      <StatChip
        icon={<Zap size={11} />}
        value={`${stats.averageReferrals}x avg referrals`}
        color="amber"
      />
    </motion.div>
  );
}

function StatChip({
  icon,
  value,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  color: "indigo" | "violet" | "amber";
}) {
  const colors = {
    indigo: "border-indigo-500/15 dark:border-indigo-500/20 bg-indigo-500/8 text-indigo-700 dark:text-indigo-400",
    violet: "border-violet-500/15 dark:border-violet-500/20 bg-violet-500/8 text-violet-700 dark:text-violet-400",
    amber: "border-amber-500/15 dark:border-amber-500/20 bg-amber-500/8 text-amber-700 dark:text-amber-400",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1",
        "text-[11px] font-medium",
        colors[color]
      )}
    >
      {icon}
      {value}
    </div>
  );
}
