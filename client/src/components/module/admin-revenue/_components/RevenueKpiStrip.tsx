"use client";

import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, Users,
  ArrowUpRight, RefreshCw, Zap, Clock, BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge }  from "@/src/components/ui/badge";
import { cn }     from "@/src/lib/utils";
import type { RevenueKpis } from "../_lib/revenue-data";

interface Kpi {
  label:   string;
  value:   string;
  sub:     string;
  icon:    React.ReactNode;
  accent:  string;
  value_c: string;
  badge?:  { text: string; up: boolean };
  index:   number;
}

function KpiCard({ label, value, sub, icon, accent, value_c, badge, index }: Kpi) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group relative overflow-hidden border-border/80 bg-card/40 transition-all duration-300 hover:bg-card/60 hover:shadow-lg hover:shadow-black/20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent transition-all duration-300 group-hover:via-emerald-500/20" />
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{label}</p>
            <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-110", accent)}>
              {icon}
            </div>
          </div>
          <p className={cn("text-2xl font-black tracking-tight tabular-nums", value_c)}>{value}</p>
          {badge ? (
            <div className="mt-1.5 flex items-center gap-1.5">
              <Badge className={cn(
                "gap-1 rounded-full px-1.5 py-0 text-[9px] font-bold",
                badge.up
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/25 bg-red-500/10 text-red-400",
              )}>
                {badge.up ? <ArrowUpRight size={9} /> : <TrendingDown size={9} />}
                {badge.text}
              </Badge>
              <span className="text-[10px] text-muted-foreground/40">{sub}</span>
            </div>
          ) : (
            <p className="mt-1 text-[10px] text-muted-foreground/60">{sub}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function RevenueKpiStrip({ kpis }: { kpis: RevenueKpis }) {
  const cards: Omit<Kpi, "index">[] = [
    {
      label:   "MRR",
      value:   `$${(kpis.mrr / 1000).toFixed(1)}k`,
      sub:     "monthly recurring revenue",
      icon:    <DollarSign size={13} className="text-emerald-400" />,
      accent:  "border-emerald-500/30 bg-emerald-500/12",
      value_c: "text-emerald-300",
      badge:   { text: `+${kpis.mrrGrowthPct}% MoM`, up: true },
    },
    {
      label:   "ARR",
      value:   `$${(kpis.arr / 1000).toFixed(0)}k`,
      sub:     "annualised run rate",
      icon:    <BarChart3 size={13} className="text-cyan-400" />,
      accent:  "border-cyan-500/30 bg-cyan-500/12",
      value_c: "text-cyan-300",
    },
    {
      label:   "New MRR",
      value:   `$${(kpis.newMrrThisMonth / 1000).toFixed(1)}k`,
      sub:     "new + expansion this month",
      icon:    <TrendingUp size={13} className="text-indigo-400" />,
      accent:  "border-indigo-500/30 bg-indigo-500/12",
      value_c: "text-indigo-300",
      badge:   { text: `+$${kpis.expansionMrr.toLocaleString()} expansion`, up: true },
    },
    {
      label:   "Churned MRR",
      value:   `$${kpis.churnedMrr.toLocaleString()}`,
      sub:     "lost this month",
      icon:    <TrendingDown size={13} className="text-red-400" />,
      accent:  "border-red-500/25 bg-red-500/8",
      value_c: "text-red-300",
      badge:   { text: `${kpis.churnRatePct}% churn rate`, up: false },
    },
    {
      label:   "Net New MRR",
      value:   `+$${(kpis.netNewMrr / 1000).toFixed(1)}k`,
      sub:     "net MRR change this month",
      icon:    <Zap size={13} className="text-amber-400" />,
      accent:  "border-amber-500/30 bg-amber-500/12",
      value_c: "text-amber-300",
    },
    {
      label:   "ARPU",
      value:   `$${kpis.arpu.toFixed(2)}`,
      sub:     "avg revenue per paid user",
      icon:    <Users size={13} className="text-violet-400" />,
      accent:  "border-violet-500/30 bg-violet-500/12",
      value_c: "text-violet-300",
    },
    {
      label:   "Paying users",
      value:   kpis.payingUsers.toLocaleString(),
      sub:     "active paid subscriptions",
      icon:    <RefreshCw size={13} className="text-rose-400" />,
      accent:  "border-rose-500/25 bg-rose-500/8",
      value_c: "text-rose-300",
    },
    {
      label:   "Avg LTV",
      value:   `$${kpis.ltv}`,
      sub:     "avg customer lifetime value",
      icon:    <Clock size={13} className="text-muted-foreground" />,
      accent:  "border-zinc-700/60 bg-zinc-800/30",
      value_c: "text-foreground/80",
    },
    {
      label:   "Avg sub length",
      value:   `${kpis.avgSubLengthMonths}mo`,
      sub:     "avg months before churn",
      icon:    <Clock size={13} className="text-muted-foreground" />,
      accent:  "border-zinc-700/60 bg-zinc-800/30",
      value_c: "text-foreground/80",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-3">
      {cards.map((c, i) => <KpiCard key={c.label} {...c} index={i} />)}
    </div>
  );
}