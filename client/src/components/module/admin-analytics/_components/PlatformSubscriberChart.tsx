"use client";

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge }  from "@/src/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { ArrowUpRight, Globe, Lock } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  getPlatformSubscriberGrowth,
  getWaitlistHealthBuckets,
  getWaitlistHealthStats,
} from "../_lib/analytics-data";

/* ── Platform subscriber growth ──────────────────────────────────── */
const subConfig = {
  newSubscribers: { label: "New subscribers", color: "hsl(var(--chart-1))" },
  referralSubs:   { label: "Via referral",    color: "hsl(var(--chart-3))" },
};

export function PlatformSubscriberChart() {
  const data    = getPlatformSubscriberGrowth();
  const current = data[data.length - 1];
  const prev    = data[data.length - 2];
  const pct     = Math.round(((current.newSubscribers - prev.newSubscribers) / prev.newSubscribers) * 100);
  const referralPct = Math.round((current.referralSubs / current.newSubscribers) * 100);

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Platform-wide subscriber growth</p>
            <p className="text-[11px] text-muted-foreground/60">
              New <code className="text-muted-foreground/80">Subscriber</code> records across all waitlists, 12 months
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <p className="text-xl font-black tabular-nums text-indigo-300">
                {(current.cumulative / 1_000_000).toFixed(2)}M
              </p>
              <p className="text-[10px] text-muted-foreground/60">cumulative</p>
            </div>
            <Badge className="gap-1 border-emerald-500/25 bg-emerald-500/10 text-[10px] text-emerald-400">
              <ArrowUpRight size={9} />+{pct}% MoM
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <ChartContainer config={subConfig} className="h-52 w-full">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSubs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(var(--chart-1))" stopOpacity={0.28} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gradRef" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(var(--chart-3))" stopOpacity={0.22} />
                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(v, name) => [Number(v).toLocaleString(), name]} />}
            />
            <Area type="monotone" dataKey="newSubscribers" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#gradSubs)" dot={false} />
            <Area type="monotone" dataKey="referralSubs"   stroke="hsl(var(--chart-3))" strokeWidth={1.5} fill="url(#gradRef)"  dot={false} />
          </AreaChart>
        </ChartContainer>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: "New this month",    value: current.newSubscribers.toLocaleString(), color: "text-indigo-300" },
            { label: "Via referral",      value: `${referralPct}%`,                       color: "text-emerald-300" },
            { label: "Direct",            value: `${100 - referralPct}%`,                 color: "text-foreground/80" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border/60 bg-card/40 px-3 py-2">
              <p className="text-[10px] text-muted-foreground/60">{s.label}</p>
              <p className={cn("text-sm font-black tabular-nums", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Waitlist subscriber distribution ────────────────────────────── */
const wlConfig = { count: { label: "Waitlists", color: "hsl(var(--chart-2))" } };

export function WaitlistHealthChart() {
  const buckets = getWaitlistHealthBuckets();
  const stats   = getWaitlistHealthStats();

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Waitlist size distribution</p>
            <p className="text-[11px] text-muted-foreground/60">
              How many subscribers each <code className="text-muted-foreground/80">Waitlist</code> has
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
            <span className="flex items-center gap-1"><Globe size={10} className="text-emerald-400" />{stats.open.toLocaleString()} open</span>
            <span className="flex items-center gap-1"><Lock  size={10} className="text-muted-foreground/60"    />{stats.closed.toLocaleString()} closed</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <ChartContainer config={wlConfig} className="h-44 w-full">
          <BarChart data={buckets} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="bucket" tick={{ fill: "rgb(113,113,122)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
            <ChartTooltip content={<ChartTooltipContent formatter={(v) => [Number(v).toLocaleString(), "Waitlists"]} />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {buckets.map((b) => <Cell key={b.bucket} fill={b.fill} opacity={0.85} />)}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: "Avg subscribers",  value: stats.avgSubs.toString(),                  color: "text-foreground/80" },
            { label: "Median",           value: stats.medianSubs.toString(),                color: "text-cyan-300" },
            { label: "P90",              value: stats.p90Subs.toLocaleString(),             color: "text-violet-300" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border/60 bg-card/40 px-3 py-2">
              <p className="text-[10px] text-muted-foreground/60">{s.label}</p>
              <p className={cn("text-sm font-black tabular-nums", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}