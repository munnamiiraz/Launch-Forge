"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { ChartContainer } from "@/src/components/ui/chart";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";
import { fetchReferralFunnel } from "@/src/services/analytics/analytics.action";

export function ReferralFunnelChart() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["owner-analytics", "funnel", workspaceId],
    queryFn: () => fetchReferralFunnel({ workspaceId: workspaceId!, range: "30d" }),
    enabled: Boolean(workspaceId),
  });

  const funnel = data?.funnel ?? [];

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <p className="text-sm font-semibold text-foreground/90">Referral funnel</p>
        <p className="text-[11px] text-muted-foreground/60">From signup to active referrer</p>
      </CardHeader>
      <CardContent className="p-5">
        {!workspaceId ? (
          <div className="flex h-44 items-center justify-center text-xs text-muted-foreground/80">
            Select a workspace to view analytics.
          </div>
        ) : isError ? (
          <div className="flex h-44 items-center justify-center text-xs text-red-400">
            {(error as Error)?.message || "Failed to load referral funnel."}
          </div>
        ) : funnel.length === 0 && !isLoading ? (
          <div className="flex h-44 items-center justify-center text-xs text-muted-foreground/80">
            No data yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {funnel.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-32 shrink-0">
                  <p className="truncate text-[11px] text-muted-foreground">{item.label}</p>
                </div>
                <div className="flex-1">
                  <div className="h-5 overflow-hidden rounded-sm bg-muted/60">
                    <div
                      className="h-full rounded-sm transition-all duration-700"
                      style={{
                        width: `${item.pct}%`,
                        background: item.color,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                </div>
                <div className="flex w-24 shrink-0 items-center justify-between gap-1">
                  <span className="text-xs font-bold tabular-nums text-foreground/80">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">{item.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Signup Source Donut ─────────────────────────────────────────── */

const planConfig = {
  value: { label: "Signups" },
};

const RADIAN = Math.PI / 180;
type PieLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  pct: number;
};

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, pct }: PieLabelProps) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  if (pct < 6) return null;
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={9}
      fontWeight={700}
    >
      {pct}%
    </text>
  );
}

export function SignupSourceChart() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["owner-analytics", "funnel", workspaceId],
    queryFn: () => fetchReferralFunnel({ workspaceId: workspaceId!, range: "30d" }),
    enabled: Boolean(workspaceId),
  });

  const sources = data?.sources ?? [];
  const total = sources.reduce((s, d) => s + d.value, 0);
  const withPct = sources.map((d) => ({
    ...d,
    pct: total === 0 ? 0 : Math.round((d.value / total) * 100),
  }));
  type SourceWithPct = (typeof withPct)[number];

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <p className="text-sm font-semibold text-foreground/90">Signup sources</p>
        <p className="text-[11px] text-muted-foreground/60">How people find your waitlists</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-5">
        {!workspaceId ? (
          <div className="flex h-44 items-center justify-center text-xs text-muted-foreground/80">
            Select a workspace to view analytics.
          </div>
        ) : isError ? (
          <div className="flex h-44 items-center justify-center text-xs text-red-400">
            {(error as Error)?.message || "Failed to load signup sources."}
          </div>
        ) : withPct.length === 0 && !isLoading ? (
          <div className="flex h-44 items-center justify-center text-xs text-muted-foreground/80">
            No data yet.
          </div>
        ) : (
          <>
            <ChartContainer config={planConfig} className="mx-auto h-44 w-full max-w-[220px]">
              <PieChart>
                <Pie
                  data={withPct}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  dataKey="value"
                  labelLine={false}
                  label={renderLabel}
                  strokeWidth={2}
                  stroke="hsl(240 6% 10%)"
                >
                  {withPct.map((entry) => (
                    <Cell key={entry.source} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as SourceWithPct;
                    return (
                      <div className="rounded-lg border border-zinc-800 bg-background/95 p-2.5 text-xs text-foreground/80 shadow-xl">
                        <p className="font-semibold">{d.source}</p>
                        <p className="text-muted-foreground/80">
                          {Number(d.value).toLocaleString()} signups · {d.pct}%
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ChartContainer>

            <div className="grid grid-cols-1 gap-1.5">
              {withPct.map((d) => (
                <div key={d.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-[11px] text-muted-foreground">{d.source}</span>
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums text-foreground/80">
                    {d.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
