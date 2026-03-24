"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge }  from "@/src/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { DollarSign } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  AdminKpis, AdminUser, RevenuePoint, UserGrowthPoint,
  SignupSourcePoint, PlanBreakdownItem, AdminActivity,
  SystemHealth, TopWaitlist,
} from "../_types";

/* ── Plan distribution ───────────────────────────────────────────── */
const planConfig = { value: { label: "Users" }, mrr: { label: "MRR" } };

export function AdminPlanChart({ data }: { data: PlanBreakdownItem[] }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + d.value, 0);
  const totalMrr = data.reduce((s, d) => s + d.mrr, 0);
  const paid  = total - (data.find((d) => d.name === "Free")?.value ?? 0);

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Plan distribution</p>
            <p className="text-[11px] text-muted-foreground/60">All user accounts by subscription tier</p>
          </div>
          <Badge className="border-violet-500/25 bg-violet-500/10 text-[10px] text-violet-400">
            {total > 0 ? Math.round((paid / total) * 100) : 0}% paid
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-5">
        <ChartContainer config={planConfig} className="mx-auto h-44 w-full max-w-[200px]">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={68}
              dataKey="value" strokeWidth={2} stroke="hsl(240 6% 10%)">
              {data.map((e) => <Cell key={e.name} fill={e.fill} />)}
            </Pie>
            <ChartTooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-zinc-800 bg-background/95 p-2.5 text-xs shadow-xl">
                  <p className="font-semibold text-foreground/90">{d.name}</p>
                  <p className="text-muted-foreground/80">{d.value.toLocaleString()} users</p>
                  {d.mrr > 0 && <p className="text-emerald-400">${d.mrr.toLocaleString()} MRR</p>}
                </div>
              );
            }} />
          </PieChart>
        </ChartContainer>

        <div className="flex flex-col gap-1.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                <span className="text-[11px] text-muted-foreground">{d.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground/60">{total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
                <span className="w-16 text-right text-[11px] font-semibold tabular-nums text-foreground/80">
                  {d.value.toLocaleString()}
                </span>
                {d.mrr > 0 && (
                  <span className="w-20 text-right text-[10px] text-emerald-500 tabular-nums">
                    ${(d.mrr / 1000).toFixed(1)}k
                  </span>
                )}
              </div>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <DollarSign size={11} className="text-emerald-400" />Total MRR
            </div>
            <span className="text-sm font-black tabular-nums text-emerald-300">
              ${totalMrr.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Signup sources ──────────────────────────────────────────────── */
const sourceConfig = { value: { label: "Signups", color: "hsl(var(--chart-1))" } };

export function AdminSignupSourcesChart({ data }: { data: SignupSourcePoint[] }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <p className="text-sm font-semibold text-foreground/90">Signup sources</p>
        <p className="text-[11px] text-muted-foreground/60">
          How users discover LaunchForge ({total.toLocaleString()} total)
        </p>
      </CardHeader>
      <CardContent className="p-5">
        <ChartContainer config={sourceConfig} className="h-52 w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category" dataKey="source" width={100}
              tick={{ fill: "rgb(161,161,170)", fontSize: 10 }}
              axisLine={false} tickLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((e) => <Cell key={e.source} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}