"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";
import { fetchRevenue } from "@/src/services/analytics/analytics.action";

const mrrConfig = {
  mrr: { label: "MRR", color: "hsl(var(--chart-1))" },
  new: { label: "New MRR", color: "hsl(var(--chart-2))" },
  churn: { label: "Churned MRR", color: "hsl(var(--chart-5))" },
};

export function RevenueMrrChart() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["owner-analytics", "revenue", workspaceId],
    queryFn: () => fetchRevenue({ workspaceId: workspaceId!, range: "12m" }),
    enabled: Boolean(workspaceId),
  });

  const trend = data?.trend ?? [];
  const current = trend.length ? trend[trend.length - 1].mrr : 0;
  const prev = trend.length > 1 ? trend[trend.length - 2].mrr : 0;
  const pct = prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0;

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Monthly recurring revenue</p>
            <p className="text-[11px] text-muted-foreground/60">MRR + new/churn breakdown</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xl font-black tracking-tight tabular-nums text-cyan-300">
                ${(current / 1000).toFixed(1)}k
              </p>
              <p className="text-[10px] text-muted-foreground/60">current MRR</p>
            </div>
            <Badge className="gap-1 border-emerald-500/25 bg-emerald-500/10 text-[10px] text-emerald-400">
              <ArrowUpRight size={10} />+{pct}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {!workspaceId ? (
          <div className="flex h-52 items-center justify-center text-xs text-muted-foreground/80">
            Select a workspace to view analytics.
          </div>
        ) : isError ? (
          <div className="flex h-52 items-center justify-center text-xs text-red-400">
            {(error as Error)?.message || "Failed to load revenue."}
          </div>
        ) : trend.length === 0 && !isLoading ? (
          <div className="flex h-52 items-center justify-center text-xs text-muted-foreground/80">
            No data yet.
          </div>
        ) : (
          <ChartContainer config={mrrConfig} className="h-52 w-full">
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gradMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "rgb(113,113,122)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <ChartTooltip content={<ChartTooltipContent formatter={(v, name) => [`$${Number(v).toLocaleString()}`, name]} />} />
              <Area type="monotone" dataKey="mrr" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#gradMrr)" dot={false} />
              <Area type="monotone" dataKey="new" stroke="hsl(var(--chart-2))" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Plan Distribution Donut ─────────────────────────────────────── */

const planConfig = { value: { label: "Users" } };

export function PlanDistributionChart() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["owner-analytics", "revenue", workspaceId],
    queryFn: () => fetchRevenue({ workspaceId: workspaceId!, range: "12m" }),
    enabled: Boolean(workspaceId),
  });

  const distribution = data?.distribution ?? [];
  const total = distribution.reduce((s, d) => s + d.value, 0);
  const free = distribution.find((d) => d.name === "Free")?.value ?? 0;
  const paid = Math.max(0, total - free);
  const paidPct = total === 0 ? 0 : Math.round((paid / total) * 100);
  type DistRow = (typeof distribution)[number];

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Plan distribution</p>
            <p className="text-[11px] text-muted-foreground/60">Breakdown by subscription plan</p>
          </div>
          <Badge className="border-indigo-500/25 bg-indigo-500/10 text-[10px] text-indigo-400">
            {paidPct}% paid
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-5">
        {!workspaceId ? (
          <div className="flex h-40 items-center justify-center text-xs text-muted-foreground/80">
            Select a workspace to view analytics.
          </div>
        ) : isError ? (
          <div className="flex h-40 items-center justify-center text-xs text-red-400">
            {(error as Error)?.message || "Failed to load plan distribution."}
          </div>
        ) : distribution.length === 0 && !isLoading ? (
          <div className="flex h-40 items-center justify-center text-xs text-muted-foreground/80">
            No data yet.
          </div>
        ) : (
          <>
            <ChartContainer config={planConfig} className="mx-auto h-40 w-full max-w-[200px]">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={68}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="hsl(240 6% 10%)"
                >
                  {distribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as DistRow;
                    return (
                      <div className="rounded-lg border border-zinc-800 bg-background/95 p-2.5 text-xs text-foreground/80 shadow-xl">
                        <p className="font-semibold">{d.name}</p>
                        <p className="text-muted-foreground/80">{Number(d.value).toLocaleString()} users</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ChartContainer>

            <div className="grid grid-cols-1 gap-1.5">
              {distribution.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-[11px] text-muted-foreground">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold tabular-nums text-foreground/80">{d.value.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground/60">{Math.round((d.value / total) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
