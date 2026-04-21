"use client";

import { motion } from "framer-motion";
import {
  Activity, Users, MousePointer, Percent,
  Clock, Layers, UserPlus, Zap,
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { cn }   from "@/src/lib/utils";
import type { EngagementStats } from "../_lib/analytics-data";

interface Pill {
  icon:   React.ReactNode;
  label:  string;
  value:  string;
  sub:    string;
  accent: string;
  val_c:  string;
  badge?: string;
  index:  number;
}

function KpiCard({ icon, label, value, sub, accent, val_c, badge, index }: Pill) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Card className="group relative h-full overflow-hidden border-border/80 bg-card/40 transition-all duration-300 hover:bg-card/60 hover:shadow-lg hover:shadow-black/20">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent transition-all duration-300 group-hover:via-red-500/20" />
        <CardContent className="flex h-full flex-col justify-between p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">{label}</p>
            <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg border transition-transform group-hover:scale-110", accent)}>
              {icon}
            </div>
          </div>
          <p className={cn("text-xl font-bold font-heading tabular-nums", val_c)}>{value}</p>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            {badge && (
              <Badge className="border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0 text-[9px] text-emerald-400">
                {badge}
              </Badge>
            )}
            <p className="text-[10px] text-muted-foreground/60">{sub}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AnalyticsKpiRow({ stats }: { stats: EngagementStats }) {
  const cards: Omit<Pill, "index">[] = [
    {
      icon:   <Activity    size={13} className="text-red-400"     />,
      label:  "DAU today",
      value:  stats.dauToday.toLocaleString(),
      sub:    "daily active users",
      accent: "border-red-500/25 bg-red-500/8",
      val_c:  "text-red-300",
      badge:  "+5.2% DoD",
    },
    {
      icon:   <Users       size={13} className="text-indigo-400"  />,
      label:  "WAU this week",
      value:  stats.wauThisWeek.toLocaleString(),
      sub:    "weekly active users",
      accent: "border-indigo-500/30 bg-indigo-500/12",
      val_c:  "text-indigo-300",
    },
    {
      icon:   <Layers      size={13} className="text-violet-400"  />,
      label:  "MAU this month",
      value:  stats.mauThisMonth.toLocaleString(),
      sub:    "monthly active users",
      accent: "border-violet-500/30 bg-violet-500/12",
      val_c:  "text-violet-300",
      badge:  "+8.1% MoM",
    },
    {
      icon:   <Percent     size={13} className="text-amber-400"   />,
      label:  "DAU / MAU",
      value:  `${stats.dauOverMau}%`,
      sub:    "stickiness ratio",
      accent: "border-amber-500/30 bg-amber-500/12",
      val_c:  "text-amber-300",
    },
    {
      icon:   <MousePointer size={13} className="text-cyan-400"  />,
      label:  "Sessions / user",
      value:  stats.avgSessionsPerUser.toFixed(1),
      sub:    "avg sessions per user",
      accent: "border-cyan-500/30 bg-cyan-500/12",
      val_c:  "text-cyan-300",
    },
    {
      icon:   <Clock       size={13} className="text-emerald-400" />,
      label:  "Session length",
      value:  `${stats.avgSessionLengthMin}m`,
      sub:    "avg minutes per session",
      accent: "border-emerald-500/30 bg-emerald-500/12",
      val_c:  "text-emerald-300",
    },
    {
      icon:   <UserPlus    size={13} className="text-rose-400"    />,
      label:  "New registrations",
      value:  stats.newUsersToday.toLocaleString(),
      sub:    "registered today",
      accent: "border-rose-500/30 bg-rose-500/12",
      val_c:  "text-rose-300",
      badge:  "+12% DoD",
    },
    {
      icon:   <Zap         size={13} className="text-amber-400"   />,
      label:  "Active workspaces",
      value:  stats.activeWorkspaces30d.toLocaleString(),
      sub:    "active in last 30d",
      accent: "border-amber-500/30 bg-amber-500/12",
      val_c:  "text-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {cards.map((c, i) => (
        <KpiCard key={c.label} {...c} index={i} />
      ))}
    </div>
  );
}