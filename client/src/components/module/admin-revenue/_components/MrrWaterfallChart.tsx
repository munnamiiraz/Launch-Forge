"use client";

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ReferenceLine, Cell,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge }  from "@/src/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { getMrrWaterfall } from "../_lib/revenue-data";

const mrrConfig = {
  mrr:       { label: "MRR",       color: "hsl(var(--chart-2))" },
  newMrr:    { label: "New MRR",   color: "hsl(var(--chart-1))" },
  expansion: { label: "Expansion", color: "hsl(var(--chart-3))" },
  churn:     { label: "Churn",     color: "hsl(var(--chart-5))" },
};

const netConfig = {
  net: { label: "Net MRR", color: "hsl(var(--chart-2))" },
};

export function MrrWaterfallChart() {
  const data    = getMrrWaterfall();
  const current = data[data.length - 1].mrr;
  const prev    = data[data.length - 2].mrr;
  const pct     = Math.round(((current - prev) / prev) * 100);
  const currentNet = data[data.length - 1].net;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">

      {/* ── MRR area chart ─────────────────────────────── */}
      <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent" />
        <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-200">MRR trend (12 months)</p>
              <p className="text-[11px] text-zinc-600">Total MRR with new, expansion, and churn overlay</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-xl font-black tabular-nums text-emerald-300">
                ${(current / 1000).toFixed(1)}k
              </p>
              <Badge className="gap-1 border-emerald-500/25 bg-emerald-500/10 text-[10px] text-emerald-400">
                <ArrowUpRight size={9} />+{pct}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <ChartContainer config={mrrConfig} className="h-56 w-full">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gradMrrMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="hsl(var(--chart-2))" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gradNewMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="hsl(var(--chart-1))" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "rgb(113,113,122)", fontSize: 10 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(v, name) => [`$${Number(v).toLocaleString()}`, name]}
                  />
                }
              />
              <Area type="monotone" dataKey="mrr"    stroke="hsl(var(--chart-2))" strokeWidth={2.5} fill="url(#gradMrrMain)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="newMrr" stroke="hsl(var(--chart-1))" strokeWidth={1.5} fill="url(#gradNewMrr)"  dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ChartContainer>

          {/* Mini legend */}
          <div className="mt-3 flex flex-wrap gap-3">
            {[
              { color: "hsl(var(--chart-2))", label: "Total MRR" },
              { color: "hsl(var(--chart-1))", label: "New MRR"   },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[10px] text-zinc-600">{l.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Net MRR bar chart ───────────────────────────── */}
      <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Net new MRR</p>
              <p className="text-[11px] text-zinc-600">New + expansion − churn per month</p>
            </div>
            <div className="text-right shrink-0">
              <p className={cn("text-lg font-black tabular-nums", currentNet >= 0 ? "text-emerald-300" : "text-red-300")}>
                {currentNet >= 0 ? "+" : ""}${currentNet.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-600">this month</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <ChartContainer config={netConfig} className="h-52 w-full">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "rgb(113,113,122)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "rgb(113,113,122)", fontSize: 10 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(v, name) => [`$${Number(v).toLocaleString()}`, "Net MRR"]}
                  />
                }
              />
              <Bar dataKey="net" radius={[3, 3, 0, 0]}>
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.net >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--chart-5))"}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          {/* Breakdown for latest month */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "New",       value: `+$${data[data.length-1].newMrr.toLocaleString()}`,    color: "text-emerald-400" },
              { label: "Expansion", value: `+$${data[data.length-1].expansion.toLocaleString()}`, color: "text-indigo-400"  },
              { label: "Churn",     value: `-$${data[data.length-1].churn.toLocaleString()}`,     color: "text-red-400"     },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-0.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-2">
                <p className="text-[10px] text-zinc-600">{s.label}</p>
                <p className={cn("text-xs font-black tabular-nums", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}