"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge }  from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  AdminKpis, AdminUser, RevenuePoint, UserGrowthPoint,
  SignupSourcePoint, PlanBreakdownItem, AdminActivity,
  SystemHealth, TopWaitlist,
} from "../_types";

/* ── MRR / Revenue chart ─────────────────────────────────────────── */

const mrrConfig = {
  mrr:      { label: "MRR",      color: "hsl(var(--chart-2))" },
  newMrr:   { label: "New MRR",  color: "hsl(var(--chart-1))" },
  churn:    { label: "Churn",    color: "hsl(var(--chart-5))" },
  upgrades: { label: "Upgrades", color: "hsl(var(--chart-3))" },
};

export function AdminRevenueChart({ data }: { data: RevenuePoint[] }) {
  if (!data || data.length === 0) return null;
  const current = data[data.length - 1].mrr;
  const prev    = data.length > 1 ? data[data.length - 2].mrr : current;
  const pct     = prev !== 0 ? Math.round(((current - prev) / prev) * 100) : 0;

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Platform MRR</p>
            <p className="text-[11px] text-muted-foreground/60">Monthly recurring revenue across all subscribers</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xl font-black tabular-nums text-emerald-300">
              ${(current / 1000).toFixed(1)}k
            </p>
            <Badge className="gap-1 border-emerald-500/25 bg-emerald-500/10 text-[10px] text-emerald-400">
              <ArrowUpRight size={9} />{pct >= 0 ? "+" : ""}{pct}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <ChartContainer config={mrrConfig} className="h-56 w-full">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradMrr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0}   />
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
            <Area type="monotone" dataKey="mrr"    stroke="hsl(var(--chart-2))" strokeWidth={2.5} fill="url(#gradMrr)" dot={false} />
            <Area type="monotone" dataKey="newMrr" stroke="hsl(var(--chart-1))" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 2" />
          </AreaChart>
        </ChartContainer>

        {/* MRR breakdown strip */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "New MRR",  value: `$${(data[data.length-1].newMrr).toLocaleString()}`,  color: "text-indigo-400" },
            { label: "Churn",    value: `-$${(data[data.length-1].churn).toLocaleString()}`,  color: "text-red-400"    },
            { label: "Upgrades", value: `+$${(data[data.length-1].upgrades).toLocaleString()}`,color:"text-violet-400" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5 rounded-lg border border-border/60 bg-card/40 px-3 py-2">
              <p className="text-[10px] text-muted-foreground/60">{s.label}</p>
              <p className={cn("text-sm font-black tabular-nums", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── User growth chart ───────────────────────────────────────────── */

const growthConfig = {
  total: { label: "Total users", color: "hsl(var(--chart-1))" },
  paid:  { label: "Paid",        color: "hsl(var(--chart-3))" },
  free:  { label: "Free",        color: "hsl(var(--chart-5))" },
};

type RangeId = "7d" | "30d" | "90d";
const RANGES: { id: RangeId; label: string; days: number }[] = [
  { id: "7d",  label: "7D",  days: 7  },
  { id: "30d", label: "30D", days: 30 },
  { id: "90d", label: "90D", days: 90 },
];

export function AdminUserGrowthChart({ data: allData }: { data: Record<RangeId, UserGrowthPoint[]> }) {
  const [range, setRange] = useState<RangeId>("30d");
  const data = allData[range];
  const last = data[data.length - 1];

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">User growth</p>
            <p className="text-[11px] text-muted-foreground/60">Total registered users over time</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xl font-black tabular-nums text-indigo-300">{last?.total.toLocaleString()}</p>
            <div className="flex gap-1">
              {RANGES.map((r) => (
                <Button
                  key={r.id}
                  size="sm"
                  variant="ghost"
                  onClick={() => setRange(r.id)}
                  className={cn(
                    "h-6 rounded-md px-2 text-xs",
                    range === r.id ? "bg-indigo-600 text-white" : "text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80",
                  )}
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <ChartContainer config={growthConfig} className="h-52 w-full">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(var(--chart-1))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gradPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(var(--chart-3))" stopOpacity={0.20} />
                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="total" stroke="hsl(var(--chart-1))" strokeWidth={2}   fill="url(#gradTotal)" dot={false} />
            <Area type="monotone" dataKey="paid"  stroke="hsl(var(--chart-3))" strokeWidth={1.5} fill="url(#gradPaid)"  dot={false} />
          </AreaChart>
        </ChartContainer>
        <div className="mt-3 flex items-center gap-4">
          {[
            { color: "hsl(var(--chart-1))", label: "Total users" },
            { color: "hsl(var(--chart-3))", label: "Paid users"  },
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