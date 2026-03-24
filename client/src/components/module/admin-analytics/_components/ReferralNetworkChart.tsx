"use client";

import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge }  from "@/src/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { Share2, Link2, CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { getReferralNetworkTimeline, getReferralStats } from "../_lib/analytics-data";

const refConfig = {
  totalReferrals: { label: "Total referrals", color: "hsl(var(--chart-1))" },
  chainReferrals: { label: "Chain referrals", color: "hsl(var(--chart-3))" },
  referrers:      { label: "Active referrers", color: "hsl(var(--chart-4))" },
};

export function ReferralNetworkChart() {
  const data  = getReferralNetworkTimeline();
  const stats = getReferralStats();
  const last  = data[data.length - 1];

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Platform referral network</p>
            <p className="text-[11px] text-muted-foreground/60">
              Monthly referrals from <code className="text-muted-foreground/80">Subscriber.referredById</code> across all waitlists
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <p className="text-xl font-black tabular-nums text-violet-300">
              {(stats.totalReferrals / 1000).toFixed(0)}k
            </p>
            <Badge className="border-violet-500/25 bg-violet-500/10 text-[10px] text-violet-400">
              {stats.platformKFactor}× k-factor
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <ChartContainer config={refConfig} className="h-52 w-full">
          <ComposedChart data={data} margin={{ top: 4, right: 24, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="refs"
              tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            />
            <YAxis
              yAxisId="referrers"
              orientation="right"
              tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(v, name) => [Number(v).toLocaleString(), name]} />}
            />
            <Bar yAxisId="refs" dataKey="totalReferrals" fill="hsl(var(--chart-1))" opacity={0.8} radius={[2, 2, 0, 0]} />
            <Bar yAxisId="refs" dataKey="chainReferrals" fill="hsl(var(--chart-3))" opacity={0.7} radius={[2, 2, 0, 0]} />
            <Line yAxisId="referrers" type="monotone" dataKey="referrers" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ChartContainer>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: <Share2       size={12} className="text-violet-400" />, label: "Total referrals",    value: (stats.totalReferrals / 1000).toFixed(0) + "k" },
            { icon: <Link2        size={12} className="text-indigo-400" />, label: "Active referrers",   value: (stats.totalReferrers / 1000).toFixed(0) + "k" },
            { icon: <Zap          size={12} className="text-amber-400"  />, label: "Avg refs/referrer",  value: stats.avgReferralsPerReferrer.toFixed(1) + "×" },
            { icon: <CheckCircle2 size={12} className="text-emerald-400"/>, label: "Email confirmed",    value: stats.confirmedPct.toFixed(1) + "%" },
          ].map((s) => (
            <div key={s.label} className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2">
              <div className="mt-0.5 shrink-0">{s.icon}</div>
              <div>
                <p className="text-[10px] text-muted-foreground/60">{s.label}</p>
                <p className="text-sm font-black tabular-nums text-foreground/90">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}