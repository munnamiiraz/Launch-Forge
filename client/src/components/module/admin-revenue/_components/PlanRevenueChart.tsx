"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { DollarSign } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { getPlanRevenue, PlanRevenue } from "../_lib/revenue-data";

const planConfig = { mrr: { label: "MRR" }, users: { label: "Users" } };
const churnConfig = { churnPct: { label: "Churn %", color: "hsl(var(--chart-5))" } };

export function PlanRevenueChart({ data }: { data: PlanRevenue[] }) {
  const totalMrr = data.reduce((s, d) => s + d.mrr, 0);

  const donutData = data.map((d) => ({
    name:  `${d.plan} ${d.mode}`,
    value: d.mrr,
    fill:  d.fill,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">

      {/* ── Revenue by plan donut + table ──────────────── */}
      <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />
        <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Revenue by plan</p>
              <p className="text-[11px] text-zinc-600">MRR contribution per subscription tier</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-black tabular-nums text-emerald-300">
              <DollarSign size={13} className="text-emerald-400" />
              ${(totalMrr / 1000).toFixed(1)}k
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-5">
          <ChartContainer config={planConfig} className="mx-auto h-44 w-full max-w-[200px]">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%" cy="50%"
                innerRadius={44} outerRadius={70}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(240 6% 10%)"
              >
                {donutData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/95 p-2.5 text-xs shadow-xl">
                      <p className="font-semibold text-zinc-200">{d.name}</p>
                      <p className="text-emerald-400">${d.value.toLocaleString()} MRR</p>
                      <p className="text-zinc-500">{Math.round((d.value / totalMrr) * 100)}% of total</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ChartContainer>

          {/* Plan breakdown table */}
          <div className="flex flex-col gap-0">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-zinc-800/60 pb-2 text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
              <span>Plan</span>
              <span className="text-right">Users</span>
              <span className="text-right">MRR</span>
              <span className="text-right">Churn</span>
            </div>
            {data.map((d) => (
              <div
                key={`${d.plan}-${d.mode}`}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-zinc-800/40 py-2.5 text-xs last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                  <span className="text-zinc-300">{d.plan}</span>
                  <Badge className="border-zinc-700/60 bg-zinc-800/40 px-1.5 py-0 text-[9px] text-zinc-600">
                    {d.mode === "Monthly" ? "Mo" : "Yr"}
                  </Badge>
                </div>
                <span className="text-right tabular-nums text-zinc-500">{d.users}</span>
                <span className="text-right tabular-nums font-semibold text-emerald-400">
                  ${(d.mrr / 1000).toFixed(1)}k
                </span>
                <span className={cn(
                  "text-right tabular-nums text-[11px]",
                  d.churnPct > 2.5 ? "text-red-400" : "text-zinc-500",
                )}>
                  {d.churnPct}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Churn rate per plan ────────────────────────── */}
      <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/25 to-transparent" />
        <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-200">Churn rate by plan</p>
          <p className="text-[11px] text-zinc-600">
            Yearly plans churn significantly less — key retention insight
          </p>
        </CardHeader>
        <CardContent className="p-5">
          <ChartContainer config={churnConfig} className="h-52 w-full">
            <BarChart
              data={data.map((d) => ({ name: `${d.plan} ${d.mode}`, churnPct: d.churnPct, fill: d.fill }))}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "rgb(113,113,122)", fontSize: 9 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgb(113,113,122)", fontSize: 10 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 5]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(v) => [`${v}%`, "Monthly churn rate"]}
                  />
                }
              />
              <Bar dataKey="churnPct" radius={[4, 4, 0, 0]}>
                {data.map((d) => (
                  <Cell
                    key={`${d.plan}-${d.mode}`}
                    fill={d.churnPct > 2.5 ? "hsl(var(--chart-5))" : "hsl(var(--chart-2))"}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          {/* Insight callout */}
          <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/6 px-4 py-3">
            <p className="text-xs font-medium text-indigo-300">💡 Yearly plans retain 2× better</p>
            <p className="mt-0.5 text-[11px] text-zinc-600">
              Avg churn on monthly plans: {((3.1 + 2.8) / 2).toFixed(1)}% vs{" "}
              yearly: {((1.4 + 0.9) / 2).toFixed(1)}% — push annual billing at checkout.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}