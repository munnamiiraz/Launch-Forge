"use client";

import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { TrendingDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { getChurnData, ChurnDataPoint } from "../_lib/revenue-data";

const churnConfig = {
  churned:   { label: "Churned users",  color: "hsl(var(--chart-5))" },
  recovered: { label: "Recovered",      color: "hsl(var(--chart-3))" },
  churnRate: { label: "Churn rate %",   color: "hsl(var(--chart-1))" },
};

export function ChurnAnalysisChart({ data }: { data: ChurnDataPoint[] }) {
  const latestRate  = data[data.length - 1].churnRate;
  const prevRate    = data[data.length - 2].churnRate;
  const delta       = parseFloat((latestRate - prevRate).toFixed(1));
  const avgChurn    = parseFloat((data.reduce((s, d) => s + d.churnRate, 0) / data.length).toFixed(1));
  const totalChurned  = data.reduce((s, d) => s + d.churned, 0);
  const totalRecovered= data.reduce((s, d) => s + d.recovered, 0);

  return (
    <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/25 to-transparent" />
      <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Churn analysis (12 months)</p>
            <p className="text-[11px] text-zinc-600">Users churned vs recovered per month with churn rate overlay</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <p className="text-xl font-black tabular-nums text-red-300">{latestRate}%</p>
            <Badge className={cn(
              "gap-1 text-[10px]",
              delta <= 0
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/25 bg-red-500/10 text-red-400",
            )}>
              <TrendingDown size={9} />
              {delta > 0 ? "+" : ""}{delta}% MoM
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <ChartContainer config={churnConfig} className="h-56 w-full">
          <ComposedChart data={data} margin={{ top: 4, right: 24, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="count"
              tick={{ fill: "rgb(113,113,122)", fontSize: 10 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              yAxisId="rate"
              orientation="right"
              domain={[0, 5]}
              tick={{ fill: "rgb(113,113,122)", fontSize: 10 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            {/* Avg churn reference line */}
            <ReferenceLine
              yAxisId="rate"
              y={avgChurn}
              stroke="rgba(251,146,60,0.3)"
              strokeDasharray="6 3"
              label={{ value: `Avg ${avgChurn}%`, position: "insideTopRight", fill: "rgb(251,146,60)", fontSize: 9 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar yAxisId="count" dataKey="churned"   fill="hsl(var(--chart-5))" opacity={0.75} radius={[2, 2, 0, 0]} />
            <Bar yAxisId="count" dataKey="recovered" fill="hsl(var(--chart-3))" opacity={0.75} radius={[2, 2, 0, 0]} />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="churnRate"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(var(--chart-1))", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ChartContainer>

        {/* Bottom summary strip */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Total churned (12mo)",  value: totalChurned.toString(),   color: "text-red-300"     },
            { label: "Recovered (12mo)",       value: totalRecovered.toString(), color: "text-emerald-300" },
            { label: "12mo avg churn rate",    value: `${avgChurn}%`,            color: "text-amber-300"   },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2">
              <p className="text-[10px] text-zinc-600">{s.label}</p>
              <p className={cn("text-base font-black tabular-nums", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}