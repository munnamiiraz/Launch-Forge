"use client";

import { motion, Variants } from "framer-motion";
import {
  Users,
  Share2,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  Zap,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";
import { fetchAnalyticsSummary } from "@/src/services/analytics/analytics.action";
import type { AnalyticsSummary } from "../_types";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.44, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

interface KpiProps {
  label: string;
  value: string;
  delta: string;
  deltaType: "up" | "down" | "neutral";
  icon: React.ReactNode;
  iconClass: string;
  index: number;
}

function KpiCard({ label, value, delta, deltaType, icon, iconClass, index }: KpiProps) {
  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible">
      <Card className="group relative overflow-hidden border-border/80 bg-card/40 transition-all duration-300 hover:bg-card/60 hover:shadow-lg hover:shadow-black/20">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent transition-all duration-300 group-hover:via-indigo-500/30" />
        <CardContent className="p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {label}
            </p>
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-110",
                iconClass,
              )}
            >
              {icon}
            </div>
          </div>
          <p className="text-2xl font-black tracking-tight text-foreground tabular-nums">{value}</p>
          <div className="mt-1.5 flex items-center gap-1">
            <Badge
              className={cn(
                "rounded-full px-1.5 py-0 text-[9px] font-bold",
                deltaType === "up"
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                  : deltaType === "down"
                    ? "border-red-500/25 bg-red-500/10 text-red-400"
                    : "border-zinc-700/60 bg-muted/40 text-muted-foreground/80",
              )}
            >
              {delta}
            </Badge>
            <span className="text-[10px] text-muted-foreground/40">vs last period</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AnalyticsKpiStrip() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const { data: summary, isLoading, isError, error } = useQuery({
    queryKey: ["owner-analytics", "summary", workspaceId],
    queryFn: () => fetchAnalyticsSummary({ workspaceId: workspaceId!, range: "30d" }),
    enabled: Boolean(workspaceId),
  });

  const safe: AnalyticsSummary = summary ?? {
    totalSubscribers: 0,
    totalWaitlists: 0,
    totalReferrals: 0,
    avgViralScore: 0,
    confirmationRate: 0,
    totalRevenueMrr: 0,
    activeReferrers: 0,
    feedbackItems: 0,
    weekOverWeekGrowth: 0,
    bestKFactor: 0,
  };

  const kpis: KpiProps[] = [
    {
      label: "Total subscribers",
      value: safe.totalSubscribers.toLocaleString(),
      delta: `+${safe.weekOverWeekGrowth}% WoW`,
      deltaType: "up",
      icon: <Users size={13} className="text-indigo-400" />,
      iconClass: "border-indigo-500/30 bg-indigo-500/12",
      index: 0,
    },
    {
      label: "Total referrals",
      value: safe.totalReferrals.toLocaleString(),
      delta: "+34% MoM",
      deltaType: "up",
      icon: <Share2 size={13} className="text-violet-400" />,
      iconClass: "border-violet-500/30 bg-violet-500/12",
      index: 1,
    },
    {
      label: "Avg viral score",
      value: `${safe.avgViralScore.toFixed(1)}×`,
      delta: `Best: ${safe.bestKFactor}×`,
      deltaType: "up",
      icon: <Zap size={13} className="text-amber-400" />,
      iconClass: "border-amber-500/30 bg-amber-500/12",
      index: 2,
    },
    {
      label: "Confirmation rate",
      value: `${safe.confirmationRate}%`,
      delta: "+4pp MoM",
      deltaType: "up",
      icon: <CheckCircle2 size={13} className="text-emerald-400" />,
      iconClass: "border-emerald-500/30 bg-emerald-500/12",
      index: 3,
    },
    {
      label: "MRR",
      value: `$${(safe.totalRevenueMrr / 1000).toFixed(1)}k`,
      delta: "+$1.2k MoM",
      deltaType: "up",
      icon: <DollarSign size={13} className="text-cyan-400" />,
      iconClass: "border-cyan-500/30 bg-cyan-500/12",
      index: 4,
    },
    {
      label: "Feedback items",
      value: safe.feedbackItems.toString(),
      delta: "+12 this week",
      deltaType: "up",
      icon: <MessageSquare size={13} className="text-rose-400" />,
      iconClass: "border-rose-500/30 bg-rose-500/12",
      index: 5,
    },
  ];

  return (
    <div className="relative">
      {isError && (
        <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
          {(error as Error)?.message || "Failed to load analytics."}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
    </div>
  );
}
