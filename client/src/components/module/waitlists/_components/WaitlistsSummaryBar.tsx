import { Users, Share2, TrendingUp } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { WaitlistPageStats } from "../_types";

interface WaitlistsSummaryBarProps {
  stats: WaitlistPageStats;
}

export function WaitlistsSummaryBar({ stats }: WaitlistsSummaryBarProps) {
  const convRate = stats.subscribers > 0
    ? Math.round((stats.referrals / stats.subscribers) * 100)
    : 0;

  const items = [
    {
      icon:  <Users     size={14} className="text-indigo-400" />,
      label: "Total subscribers",
      value: stats.subscribers.toLocaleString(),
      sub:   `across ${stats.total} waitlist${stats.total !== 1 ? "s" : ""}`,
      accent: "border-indigo-500/20 bg-indigo-500/6",
    },
    {
      icon:  <Share2    size={14} className="text-violet-400" />,
      label: "Total referrals",
      value: stats.referrals.toLocaleString(),
      sub:   "all time",
      accent: "border-violet-500/20 bg-violet-500/6",
    },
    {
      icon:  <TrendingUp size={14} className="text-emerald-400" />,
      label: "Avg. viral score",
      value: stats.subscribers > 0
        ? (stats.referrals / stats.subscribers).toFixed(1) + "×"
        : "—",
      sub:   "referrals per signup",
      accent: "border-emerald-500/20 bg-emerald-500/6",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3",
            item.accent
          )}
        >
          <div className="shrink-0">{item.icon}</div>
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-600">{item.label}</p>
            <p className="text-base font-black tracking-tight text-zinc-100 tabular-nums">
              {item.value}
            </p>
            <p className="text-[10px] text-zinc-600">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}