import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { UsersPageStats } from "../_lib/users-data";

export function UsersStatsStrip({ stats }: { stats: UsersPageStats }) {
  const pills = [
    {
      icon:   <Users      size={14} className="text-indigo-400" />,
      label:  "Total users",
      value:  stats.total.toLocaleString(),
      sub:    `+${stats.newWeek} this week`,
      accent: "border-indigo-500/20 bg-indigo-500/6",
    },
    {
      icon:   <UserCheck  size={14} className="text-emerald-400" />,
      label:  "Active",
      value:  stats.active.toLocaleString(),
      sub:    `${Math.round((stats.active / stats.total) * 100)}% of total`,
      accent: "border-emerald-500/20 bg-emerald-500/6",
    },
    {
      icon:   <UserX      size={14} className="text-amber-400" />,
      label:  "Suspended",
      value:  stats.suspended.toLocaleString(),
      sub:    `${stats.deleted} deleted`,
      accent: "border-amber-500/20 bg-amber-500/6",
    },
    {
      icon:   <TrendingUp size={14} className="text-violet-400" />,
      label:  "Paid users",
      value:  (stats.pro + stats.growth).toLocaleString(),
      sub:    `${stats.pro} Pro · ${stats.growth} Growth`,
      accent: "border-violet-500/20 bg-violet-500/6",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {pills.map((p) => (
        <div
          key={p.label}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3",
            p.accent,
          )}
        >
          <div className="shrink-0">{p.icon}</div>
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-600">{p.label}</p>
            <p className="text-lg font-black tracking-tight tabular-nums text-zinc-100">
              {p.value}
            </p>
            <p className="text-[10px] text-zinc-600">{p.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}