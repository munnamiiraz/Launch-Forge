"use client";

import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  ComposedChart,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";
import { fetchConfirmationRate, fetchTopReferrers } from "@/src/services/analytics/analytics.action";

const confirmConfig = {
  confirmed: { label: "Confirmed", color: "hsl(var(--chart-2))" },
  unconfirmed: { label: "Unconfirmed", color: "hsl(var(--chart-5))" },
  rate: { label: "Rate %", color: "hsl(var(--chart-1))" },
};

export function ConfirmationRateChart() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["owner-analytics", "confirmation", workspaceId],
    queryFn: () => fetchConfirmationRate({ workspaceId: workspaceId!, range: "12m" }),
    enabled: Boolean(workspaceId),
  });

  const points = data ?? [];
  const current = points.length ? points[points.length - 1].rate : 0;

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Email confirmation rate</p>
            <p className="text-[11px] text-muted-foreground/60">Confirmed vs unconfirmed subscribers</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black tracking-tight tabular-nums text-emerald-300">{current}%</p>
            <p className="text-[10px] text-muted-foreground/60">current rate</p>
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
            {(error as Error)?.message || "Failed to load confirmation rate."}
          </div>
        ) : points.length === 0 && !isLoading ? (
          <div className="flex h-52 items-center justify-center text-xs text-muted-foreground/80">
            No data yet.
          </div>
        ) : (
          <ChartContainer config={confirmConfig} className="h-52 w-full">
            <ComposedChart data={points} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgb(113,113,122)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis yAxisId="count" tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="rate"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: "rgb(113,113,122)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar yAxisId="count" dataKey="confirmed" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} stackId="a" />
              <Bar
                yAxisId="count"
                dataKey="unconfirmed"
                fill="hsl(var(--chart-5))"
                radius={[2, 2, 0, 0]}
                stackId="a"
                opacity={0.5}
              />
              <Line yAxisId="rate" type="monotone" dataKey="rate" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Top Referrers ──────────────────────────────────────────────── */

const AVATAR_GRADS = [
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-zinc-500 to-zinc-600",
  "from-orange-600 to-red-600",
];

export function TopReferrersChart() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["owner-analytics", "referrers", workspaceId],
    queryFn: () => fetchTopReferrers({ workspaceId: workspaceId!, range: "30d" }),
    enabled: Boolean(workspaceId),
  });

  const rows = data ?? [];
  const maxVal = rows.length ? Math.max(...rows.map((d) => d.direct + d.chain)) : 0;

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <p className="text-sm font-semibold text-foreground/90">Top referrers</p>
        <p className="text-[11px] text-muted-foreground/60">Direct + chain referrals across all waitlists</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 p-5">
        {!workspaceId ? (
          <div className="flex h-40 items-center justify-center text-xs text-muted-foreground/80">
            Select a workspace to view analytics.
          </div>
        ) : isError ? (
          <div className="flex h-40 items-center justify-center text-xs text-red-400">
            {(error as Error)?.message || "Failed to load top referrers."}
          </div>
        ) : rows.length === 0 && !isLoading ? (
          <div className="flex h-40 items-center justify-center text-xs text-muted-foreground/80">
            No data yet.
          </div>
        ) : (
          rows.map((r, i) => {
            const total = r.direct + r.chain;
            const pct = maxVal === 0 ? 0 : Math.round((total / maxVal) * 100);
            return (
              <div key={`${r.name}-${i}`} className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-4 shrink-0 text-center text-xs tabular-nums font-bold",
                    i === 0 ? "text-amber-400" : i === 1 ? "text-foreground/80" : i === 2 ? "text-orange-500" : "text-muted-foreground/60",
                  )}
                >
                  {i + 1}
                </span>
                <Avatar className="h-6 w-6 shrink-0 rounded-md">
                  <AvatarFallback
                    className={cn(
                      "rounded-md bg-gradient-to-br text-[9px] font-bold text-white",
                      AVATAR_GRADS[i % AVATAR_GRADS.length],
                    )}
                  >
                    {r.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs text-foreground/80">{r.name}</span>
                    <span className="ml-2 shrink-0 text-xs font-bold tabular-nums text-foreground/90">{total}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <Badge className="shrink-0 border-zinc-800 bg-card/60 px-1.5 text-[9px] text-muted-foreground/60">
                  {r.waitlist.split(" ")[0]}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
