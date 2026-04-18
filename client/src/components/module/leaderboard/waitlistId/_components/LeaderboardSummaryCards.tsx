"use client";

import { motion } from "framer-motion";
import { Users, Share2, TrendingUp, Trophy, Zap } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import type { LeaderboardSummary } from "../_types";

interface SummaryCardProps {
  icon:    React.ReactNode;
  label:   string;
  value:   string;
  sub?:    string;
  accent:  string;
  index:   number;
}

function SummaryCard({ icon, label, value, sub, accent, index }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Card className="group relative flex h-[118px] flex-col overflow-hidden border-zinc-200 dark:border-border/80 bg-card/40 transition-all duration-300 hover:bg-card/60 hover:shadow-lg hover:shadow-black/20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-border to-transparent transition-all duration-300 group-hover:via-indigo-500/30" />
        <CardContent className="flex h-full flex-col justify-between p-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">{label}</p>
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg border transition-transform group-hover:scale-110", accent)}>
                {icon}
              </div>
            </div>
            <p className="text-2xl font-black tracking-tight text-foreground tabular-nums">{value}</p>
          </div>
          {sub && <p className="mt-1 text-[11px] text-muted-foreground/60">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface LeaderboardSummaryCardsProps {
  summary: LeaderboardSummary;
}

export function LeaderboardSummaryCards({ summary }: LeaderboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <SummaryCard
        index={0}
        icon={<Users size={13} className="text-indigo-600 dark:text-indigo-400" />}
        label="Total subscribers"
        value={summary.totalSubscribers.toLocaleString()}
        sub="in this waitlist"
        accent="border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/12"
      />
      <SummaryCard
        index={1}
        icon={<Share2 size={13} className="text-violet-600 dark:text-violet-400" />}
        label="Total referrals"
        value={summary.totalReferrals.toLocaleString()}
        sub="all time"
        accent="border-violet-500/30 bg-violet-500/10 dark:bg-violet-500/12"
      />
      <SummaryCard
        index={2}
        icon={<TrendingUp size={13} className="text-emerald-600 dark:text-emerald-400" />}
        label="Active referrers"
        value={summary.activeReferrers.toLocaleString()}
        sub={`avg ${summary.avgReferralsPerReferrer.toFixed(1)} refs each`}
        accent="border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/12"
      />
      <SummaryCard
        index={3}
        icon={<Trophy size={13} className="text-amber-600 dark:text-amber-400" />}
        label="Top referral count"
        value={summary.topReferralCount.toString()}
        sub="by #1 champion"
        accent="border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/12"
      />
    </div>
  );
}