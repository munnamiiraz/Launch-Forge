"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { cn } from "@/src/lib/utils";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";
import { fetchSubscriberGrowth } from "@/src/services/analytics/analytics.action";
import type { TimeRange } from "../_types";

const RANGES: { id: TimeRange; label: string }[] = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "12m", label: "12M" },
];

const chartConfig = {
  cumulative: { label: "Total subscribers", color: "hsl(var(--chart-1))" },
  subscribers: { label: "New signups", color: "hsl(var(--chart-2))" },
  referrals: { label: "Via referral", color: "hsl(var(--chart-3))" },
};

export function SubscriberGrowthChart() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const [range, setRange] = useState<TimeRange>("30d");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["owner-analytics", "growth", workspaceId, range],
    queryFn: () => fetchSubscriberGrowth({ workspaceId: workspaceId!, range }),
    enabled: Boolean(workspaceId),
  });

  const points = data ?? [];
  const last = points.length ? points[points.length - 1] : { cumulative: 0 };
  const first = points.length ? points[0] : { cumulative: 0 };
  const pct =
    first.cumulative > 0
      ? Math.round(((last.cumulative - first.cumulative) / first.cumulative) * 100)
      : 0;

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/30 to-transparent" />

      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Subscriber growth</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/60">Cumulative signups over time</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xl font-black tracking-tight tabular-nums text-indigo-300">
                {Number(last.cumulative ?? 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground/60">total</p>
            </div>
            <Badge className="gap-1 border-emerald-500/25 bg-emerald-500/10 text-[10px] text-emerald-400">
              <ArrowUpRight size={10} />+{pct}%
            </Badge>
          </div>
        </div>

        <div className="mt-3 flex gap-1">
          {RANGES.map((r) => (
            <Button
              key={r.id}
              size="sm"
              variant="ghost"
              onClick={() => setRange(r.id)}
              className={cn(
                "h-6 rounded-md px-2.5 text-xs",
                range === r.id
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80",
              )}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {!workspaceId ? (
          <div className="flex h-64 items-center justify-center text-xs text-muted-foreground/80">
            Select a workspace to view analytics.
          </div>
        ) : isError ? (
          <div className="flex h-64 items-center justify-center text-xs text-red-400">
            {(error as Error)?.message || "Failed to load subscriber growth."}
          </div>
        ) : points.length === 0 && !isLoading ? (
          <div className="flex h-64 items-center justify-center text-xs text-muted-foreground/80">
            No data yet.
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={points} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradReferrals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgb(113,113,122)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "rgb(113,113,122)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fill="url(#gradCumulative)"
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(var(--chart-1))" }}
                />
                <Area
                  type="monotone"
                  dataKey="referrals"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={1.5}
                  fill="url(#gradReferrals)"
                  dot={false}
                  activeDot={{ r: 3, fill: "hsl(var(--chart-3))" }}
                />
              </AreaChart>
            </ChartContainer>

            <div className="mt-3 flex items-center gap-4">
              {[
                { color: "hsl(var(--chart-1))", label: "Total subscribers" },
                { color: "hsl(var(--chart-3))", label: "Via referral" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="text-[10px] text-muted-foreground/60">{l.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
