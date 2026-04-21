"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { cn } from "@/src/lib/utils";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";
import { fetchCohortRetention, fetchFeedbackActivity } from "@/src/services/analytics/analytics.action";

function heatColor(pct: number): string {
  if (pct >= 90) return "bg-indigo-500    text-white";
  if (pct >= 75) return "bg-indigo-500/75 text-white";
  if (pct >= 60) return "bg-indigo-500/55 text-white";
  if (pct >= 45) return "bg-indigo-500/35 text-foreground/90";
  if (pct >= 30) return "bg-indigo-500/20 text-muted-foreground";
  if (pct >= 15) return "bg-indigo-500/10 text-muted-foreground/80";
  return "bg-muted/40 text-muted-foreground/60";
}

export function CohortRetentionChart() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["owner-analytics", "cohorts", workspaceId],
    queryFn: () => fetchCohortRetention({ workspaceId: workspaceId!, range: "30d" }),
    enabled: Boolean(workspaceId),
  });

  const rows = data ?? [];
  const weekLabels = ["W0", "W1", "W2", "W3", "W4", "W5", "W6"];

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <p className="text-sm font-semibold text-foreground/90">Subscriber cohort retention</p>
        <p className="text-[11px] text-muted-foreground/60">% of subscribers still active week-over-week</p>
      </CardHeader>
      <CardContent className="overflow-x-auto p-5">
        {!workspaceId ? (
          <div className="flex h-28 items-center justify-center text-xs text-muted-foreground/80">
            Select a workspace to view analytics.
          </div>
        ) : isError ? (
          <div className="flex h-28 items-center justify-center text-xs text-red-400">
            {(error as Error)?.message || "Failed to load cohort retention."}
          </div>
        ) : rows.length === 0 && !isLoading ? (
          <div className="flex h-28 items-center justify-center text-xs text-muted-foreground/80">
            No data yet.
          </div>
        ) : (
          <>
            <table className="w-full min-w-max text-xs">
              <thead>
                <tr>
                  <th className="w-28 pb-2 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Cohort
                  </th>
                  <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 pr-2">
                    Size
                  </th>
                  {weekLabels.map((w) => (
                    <th
                      key={w}
                      className="w-12 pb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60"
                    >
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {rows.map((row) => (
                  <tr key={row.cohort}>
                    <td className="py-1.5 pr-3 text-[11px] text-muted-foreground">{row.cohort}</td>
                    <td className="py-1.5 pr-2 text-right text-[11px] font-semibold tabular-nums text-muted-foreground/80">
                      {row.size}
                    </td>
                    {row.weeks.map((pct, wi) => (
                      <td key={wi} className="py-1 px-0.5">
                        <div
                          className={cn(
                            "flex h-8 items-center justify-center rounded text-[10px] font-bold tabular-nums transition-colors",
                            heatColor(pct),
                          )}
                        >
                          {wi === 0 ? "100%" : `${pct}%`}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/60">Low</span>
              {[10, 25, 45, 60, 75, 90].map((pct) => (
                <div key={pct} className={cn("h-3 w-6 rounded-sm", heatColor(pct).split(" ")[0])} />
              ))}
              <span className="text-[10px] text-muted-foreground/60">High</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Feedback Activity ───────────────────────────────────────────── */

const feedbackConfig = {
  requests: { label: "New requests", color: "hsl(var(--chart-1))" },
  votes: { label: "Votes cast", color: "hsl(var(--chart-3))" },
};

export function FeedbackActivityChart() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["owner-analytics", "feedback", workspaceId],
    queryFn: () => fetchFeedbackActivity({ workspaceId: workspaceId!, range: "30d" }),
    enabled: Boolean(workspaceId),
  });

  const points = data ?? [];
  const totalVotes = points.reduce((s, d) => s + d.votes, 0);
  const totalReqs = points.reduce((s, d) => s + d.requests, 0);

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-rose-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Feedback activity</p>
            <p className="text-[11px] text-muted-foreground/60">Feature requests + votes (last 30 days)</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-base font-black tracking-tight tabular-nums text-indigo-300">{totalReqs}</p>
              <p className="text-[9px] text-muted-foreground/60">requests</p>
            </div>
            <div className="text-center">
              <p className="text-base font-black tracking-tight tabular-nums text-emerald-300">{totalVotes}</p>
              <p className="text-[9px] text-muted-foreground/60">votes</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {!workspaceId ? (
          <div className="flex h-44 items-center justify-center text-xs text-muted-foreground/80">
            Select a workspace to view analytics.
          </div>
        ) : isError ? (
          <div className="flex h-44 items-center justify-center text-xs text-red-400">
            {(error as Error)?.message || "Failed to load feedback activity."}
          </div>
        ) : points.length === 0 && !isLoading ? (
          <div className="flex h-44 items-center justify-center text-xs text-muted-foreground/80">
            No data yet.
          </div>
        ) : (
          <ChartContainer config={feedbackConfig} className="h-44 w-full">
            <BarChart data={points} barGap={1} barCategoryGap="15%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgb(113,113,122)", fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="votes" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} opacity={0.7} />
              <Bar dataKey="requests" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
