"use client";

import { motion } from "framer-motion";
import {
  Users, DollarSign, BarChart3, Zap,
  TrendingUp, TrendingDown, UserCheck,
  Globe, Share2, MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { cn }   from "@/src/lib/utils";
import type { AdminKpis } from "../_types";

interface KpiDef {
  label:     string;
  value:     string;
  sub:       string;
  delta?:    string;
  deltaUp?:  boolean;
  icon:      React.ReactNode;
  accent:    string;
  valueColor: string;
}

interface AdminKpiGridProps { kpis: AdminKpis }

export function AdminKpiGrid({ kpis }: AdminKpiGridProps) {
  const cards: KpiDef[] = [
    {
      label: "Total users",
      value: kpis.totalUsers.toLocaleString(),
      sub:   `+${kpis.newUsersToday} today · +${kpis.newUsersThisWeek} this week`,
      delta: `+${kpis.newUsersThisWeek}`, deltaUp: true,
      icon: <Users size={14} />,
      accent: "border-indigo-500/30 bg-indigo-500/12",
      valueColor: "text-indigo-300",
    },
    {
      label: "MRR",
      value: `$${(kpis.mrr / 1000).toFixed(1)}k`,
      sub:   `ARR $${(kpis.arr / 1000).toFixed(0)}k`,
      delta: "+12%", deltaUp: true,
      icon: <DollarSign size={14} />,
      accent: "border-emerald-500/30 bg-emerald-500/12",
      valueColor: "text-emerald-300",
    },
    {
      label: "Paid users",
      value: kpis.paidUsers.toLocaleString(),
      sub:   `${Math.round((kpis.paidUsers / kpis.totalUsers) * 100)}% conversion`,
      delta: `${kpis.proUsers} Pro · ${kpis.growthUsers} Growth`,
      icon: <UserCheck size={14} />,
      accent: "border-violet-500/30 bg-violet-500/12",
      valueColor: "text-violet-300",
    },
    {
      label: "Active 30d",
      value: kpis.activeUsers30d.toLocaleString(),
      sub:   `${Math.round((kpis.activeUsers30d / kpis.totalUsers) * 100)}% of total users`,
      icon: <Zap size={14} />,
      accent: "border-amber-500/30 bg-amber-500/12",
      valueColor: "text-amber-300",
    },
    {
      label: "Total waitlists",
      value: kpis.totalWaitlists.toLocaleString(),
      sub:   `avg ${kpis.avgWaitlistsPerUser.toFixed(1)} per user`,
      icon: <Globe size={14} />,
      accent: "border-cyan-500/30 bg-cyan-500/12",
      valueColor: "text-cyan-300",
    },
    {
      label: "Total subscribers",
      value: kpis.totalSubscribers >= 1_000_000
        ? `${(kpis.totalSubscribers / 1_000_000).toFixed(2)}M`
        : kpis.totalSubscribers.toLocaleString(),
      sub:   `avg ${kpis.avgSubscribersPerWaitlist} per waitlist`,
      icon: <BarChart3 size={14} />,
      accent: "border-rose-500/30 bg-rose-500/12",
      valueColor: "text-rose-300",
    },
    {
      label: "Total referrals",
      value: kpis.totalReferrals >= 1_000_000
        ? `${(kpis.totalReferrals / 1_000_000).toFixed(1)}M`
        : `${(kpis.totalReferrals / 1000).toFixed(0)}k`,
      sub:   `${Math.round((kpis.totalReferrals / kpis.totalSubscribers) * 100) / 100}× avg viral score`,
      icon: <Share2 size={14} />,
      accent: "border-indigo-500/30 bg-indigo-500/12",
      valueColor: "text-indigo-300",
    },
    {
      label: "Feedback & votes",
      value: kpis.totalFeedbackItems.toLocaleString(),
      sub:   `${kpis.totalVotes.toLocaleString()} votes cast`,
      icon: <MessageSquare size={14} />,
      accent: "border-zinc-700/60 bg-zinc-800/30",
      valueColor: "text-zinc-300",
    },
    {
      label: "Churned this month",
      value: kpis.churnedThisMonth.toString(),
      sub:   `${((kpis.churnedThisMonth / kpis.paidUsers) * 100).toFixed(1)}% churn rate`,
      delta: `${kpis.churnedThisMonth}`, deltaUp: false,
      icon: <TrendingDown size={14} />,
      accent: "border-red-500/25 bg-red-500/8",
      valueColor: "text-red-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="group relative overflow-hidden border-zinc-800/80 bg-zinc-900/40 transition-all duration-300 hover:bg-zinc-900/60 hover:shadow-lg hover:shadow-black/20">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent transition-all duration-300 group-hover:via-red-500/20" />
            <CardContent className="p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{card.label}</p>
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg border text-current transition-transform group-hover:scale-110", card.accent, card.valueColor)}>
                  {card.icon}
                </div>
              </div>
              <p className={cn("text-2xl font-black tracking-tight tabular-nums", card.valueColor)}>{card.value}</p>
              <p className="mt-1 text-[10px] text-zinc-600">{card.sub}</p>
              {card.delta && (
                <div className={cn(
                  "mt-1.5 flex items-center gap-1 text-[10px] font-semibold",
                  card.deltaUp ? "text-emerald-400" : "text-red-400",
                )}>
                  {card.deltaUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {card.delta} this week
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}