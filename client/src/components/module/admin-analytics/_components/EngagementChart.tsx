"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge }  from "@/src/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { getEngagementTimeline } from "../_lib/analytics-data";

type Range = "30d" | "60d";

const chartConfig = {
  dau:    { label: "DAU",         color: "hsl(var(--chart-1))" },
  wau:    { label: "WAU",         color: "hsl(var(--chart-3))" },
  newReg: { label: "New signups", color: "hsl(var(--chart-4))" },
};

export function EngagementChart() {
  const [range, setRange] = useState<Range>("30d");
  const data = getEngagementTimeline(range === "30d" ? 30 : 60);
  const last = data[data.length - 1];
  const prev = data[Math.max(0, data.length - 8)];
  const dauPct = Math.round(((last.dau - prev.dau) / prev.dau) * 100);

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/25 to-transparent" />

      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Daily active users (DAU)</p>
            <p className="text-[11px] text-muted-foreground/60">
              Platform-wide user sessions derived from <code className="text-muted-foreground/80">Session</code> model
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <p className="text-xl font-black tabular-nums text-red-300">
              {last.dau.toLocaleString()}
            </p>
            <Badge className={cn(
              "gap-1 text-[10px]",
              dauPct >= 0
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/25 bg-red-500/10 text-red-400",
            )}>
              <ArrowUpRight size={9} />{dauPct >= 0 ? "+" : ""}{dauPct}%
            </Badge>
            <div className="flex gap-1">
              {(["30d", "60d"] as Range[]).map((r) => (
                <Button
                  key={r} size="sm" variant="ghost"
                  onClick={() => setRange(r)}
                  className={cn(
                    "h-6 rounded-md px-2 text-xs",
                    range === r ? "bg-red-600 text-white" : "text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80",
                  )}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradDAU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(var(--chart-1))" stopOpacity={0.30} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gradWAU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(var(--chart-3))" stopOpacity={0.18} />
                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="dau"    stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#gradDAU)" dot={false} />
            <Area type="monotone" dataKey="wau"    stroke="hsl(var(--chart-3))" strokeWidth={1.5} fill="url(#gradWAU)" dot={false} strokeDasharray="4 2" />
            <Area type="monotone" dataKey="newReg" stroke="hsl(var(--chart-4))" strokeWidth={1}   fill="none"           dot={false} strokeDasharray="2 3" />
          </AreaChart>
        </ChartContainer>

        <div className="mt-3 flex flex-wrap gap-4">
          {[
            { color: "hsl(var(--chart-1))", label: "DAU" },
            { color: "hsl(var(--chart-3))", label: "WAU" },
            { color: "hsl(var(--chart-4))", label: "New registrations" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-[10px] text-muted-foreground/60">{l.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}