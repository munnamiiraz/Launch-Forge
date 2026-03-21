import { Trophy, Share2, Users, Zap } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { LeaderboardPageStats } from "../_types";

interface LeaderboardSummaryStripProps {
  stats: LeaderboardPageStats;
}

export function LeaderboardSummaryStrip({ stats }: LeaderboardSummaryStripProps) {
  const pills = [
    {
      icon:  <Trophy  size={14} className="text-amber-400" />,
      label: "Leaderboards",
      value: stats.totalWaitlists.toString(),
      sub:   "active waitlists",
      accent: "border-amber-500/20 bg-amber-500/6",
    },
    {
      icon:  <Share2  size={14} className="text-indigo-400" />,
      label: "Total referrals",
      value: stats.totalReferrals.toLocaleString(),
      sub:   "across all waitlists",
      accent: "border-indigo-500/20 bg-indigo-500/6",
    },
    {
      icon:  <Users   size={14} className="text-violet-400" />,
      label: "Active referrers",
      value: stats.totalReferrers.toLocaleString(),
      sub:   "people sharing",
      accent: "border-violet-500/20 bg-violet-500/6",
    },
    {
      icon:  <Zap     size={14} className="text-emerald-400" />,
      label: "Top viral score",
      value: `${stats.topViralScore.toFixed(1)}×`,
      sub:   "best k-factor",
      accent: "border-emerald-500/20 bg-emerald-500/6",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {pills.map((p) => (
        <div
          key={p.label}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3",
            p.accent
          )}
        >
          <div className="shrink-0">{p.icon}</div>
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-600">{p.label}</p>
            <p className="text-lg font-black tracking-tight text-zinc-100 tabular-nums">
              {p.value}
            </p>
            <p className="text-[10px] text-zinc-600">{p.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}