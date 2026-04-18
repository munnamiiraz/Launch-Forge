"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { useWorkspace } from "@/src/provider/WorkspaceProvider";
import { fetchViralKFactor, fetchWaitlistComparison } from "@/src/services/analytics/analytics.action";

const kFactorConfig = {
  kFactor: { label: "K-factor", color: "hsl(var(--chart-1))" },
  invites: { label: "Invites sent", color: "hsl(var(--chart-4))" },
};

export function ViralKFactorChart() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["owner-analytics", "kfactor", workspaceId],
    queryFn: () => fetchViralKFactor({ workspaceId: workspaceId!, range: "12m" }),
    enabled: Boolean(workspaceId),
  });

  const points = data ?? [];
  const current = points.length ? points[points.length - 1].kFactor : 0;
  const viral = current >= 1;

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Viral coefficient (K-factor)</p>
            <p className="text-[11px] text-muted-foreground/60">K ≥ 1 means exponential growth</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight tabular-nums text-amber-300">
              {current}
            </span>
            <Badge
              className={
                viral
                  ? "border-emerald-500/25 bg-emerald-500/10 text-[10px] text-emerald-400"
                  : "border-amber-500/25 bg-amber-500/10 text-[10px] text-amber-400"
              }
            >
              {viral ? "🚀 Viral" : "📈 Growing"}
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
            {(error as Error)?.message || "Failed to load k-factor."}
          </div>
        ) : points.length === 0 && !isLoading ? (
          <div className="flex h-52 items-center justify-center text-xs text-muted-foreground/80">
            No data yet.
          </div>
        ) : (
          <ChartContainer config={kFactorConfig} className="h-52 w-full">
            <LineChart data={points} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="k" domain={[0, 3]} tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <ReferenceLine
                yAxisId="k"
                y={1}
                stroke="rgba(52,211,153,0.35)"
                strokeDasharray="6 3"
                label={{ value: "Viral threshold", position: "insideTopRight", fill: "rgb(52,211,153)", fontSize: 9 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="k"
                type="monotone"
                dataKey="kFactor"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "hsl(var(--chart-1))", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Waitlist Comparison ─────────────────────────────────────────── */

const comparisonConfig = {
  subscribers: { label: "Subscribers", color: "hsl(var(--chart-1))" },
  referrals: { label: "Referrals", color: "hsl(var(--chart-2))" },
  confirmed: { label: "Confirmed", color: "hsl(var(--chart-3))" },
};

export function WaitlistComparisonChart() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["owner-analytics", "waitlists", workspaceId],
    queryFn: () => fetchWaitlistComparison({ workspaceId: workspaceId!, range: "30d" }),
    enabled: Boolean(workspaceId),
  });

  const rows = data ?? [];

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <p className="text-sm font-semibold text-foreground/90">Waitlist comparison</p>
        <p className="text-[11px] text-muted-foreground/60">Subscribers · Referrals · Confirmed per waitlist</p>
      </CardHeader>
      <CardContent className="p-5">
        {!workspaceId ? (
          <div className="flex h-56 items-center justify-center text-xs text-muted-foreground/80">
            Select a workspace to view analytics.
          </div>
        ) : isError ? (
          <div className="flex h-56 items-center justify-center text-xs text-red-400">
            {(error as Error)?.message || "Failed to load waitlist comparison."}
          </div>
        ) : rows.length === 0 && !isLoading ? (
          <div className="flex h-56 items-center justify-center text-xs text-muted-foreground/80">
            No data yet.
          </div>
        ) : (
          <>
            <ChartContainer config={comparisonConfig} className="h-56 w-full">
              <BarChart data={rows} barGap={2} barCategoryGap="25%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgb(113,113,122)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "rgb(113,113,122)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="subscribers" fill="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} />
                <Bar dataKey="referrals" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
                <Bar dataKey="confirmed" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>

            <div className="mt-3 flex flex-wrap gap-2">
              {rows.map((w) => (
                <div key={w.name} className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-2.5 py-1">
                  <span className="text-[10px] text-muted-foreground/80">{w.name.split(" ").slice(0, 2).join(" ")}</span>
                  <Badge className="border-amber-500/25 bg-amber-500/10 px-1.5 py-0 text-[9px] font-bold text-amber-400">
                    {w.viralScore}×
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
