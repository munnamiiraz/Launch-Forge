"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge }  from "@/src/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { MessageSquare, ThumbsUp, MessageCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  getFeedbackStatusBreakdown, getFeedbackTimeline, getFeedbackStats,
  getRoadmapProgress, getRoadmapStats,
} from "../_lib/analytics-data";

/* ── Feedback status donut ────────────────────────────────────────── */
const feedbackConfig  = { value: { label: "Requests" } };
const feedbackConfig2 = {
  requests: { label: "New requests", color: "hsl(var(--chart-1))" },
  votes:    { label: "Votes cast",   color: "hsl(var(--chart-3))" },
  comments: { label: "Comments",     color: "hsl(var(--chart-4))" },
};

export function FeedbackHealthChart() {
  const breakdown = getFeedbackStatusBreakdown();
  const timeline  = getFeedbackTimeline();
  const stats     = getFeedbackStats();

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">

      {/* ── Donut ────────────────────────────────────────── */}
      <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/25 to-transparent" />
        <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-200">Feedback request status</p>
          <p className="text-[11px] text-zinc-600">
            All <code className="text-zinc-500">FeatureRequest</code> records by{" "}
            <code className="text-zinc-500">status</code>
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-5">
          <ChartContainer config={feedbackConfig} className="mx-auto h-40 w-full max-w-[180px]">
            <PieChart>
              <Pie data={breakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={64}
                dataKey="value" strokeWidth={2} stroke="hsl(240 6% 10%)">
                {breakdown.map((e) => <Cell key={e.status} fill={e.fill} />)}
              </Pie>
              <ChartTooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/95 p-2.5 text-xs shadow-xl">
                    <p className="font-semibold text-zinc-200">{d.status}</p>
                    <p className="text-zinc-500">{d.count.toLocaleString()} · {d.pct}%</p>
                  </div>
                );
              }} />
            </PieChart>
          </ChartContainer>

          <div className="flex flex-col gap-1.5">
            {breakdown.map((d) => (
              <div key={d.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.fill }} />
                  <span className="text-zinc-400">{d.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-600">{d.pct}%</span>
                  <span className="w-14 text-right font-semibold tabular-nums text-zinc-300">
                    {d.count.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-zinc-800/60 pt-3">
            {[
              { icon: <MessageSquare size={11} className="text-rose-400"    />, label: "Boards",       value: stats.totalBoards.toLocaleString() },
              { icon: <ThumbsUp      size={11} className="text-indigo-400"  />, label: "Avg votes",    value: stats.avgVotesPerRequest.toFixed(1) },
              { icon: <MessageCircle size={11} className="text-violet-400"  />, label: "Comments",     value: (stats.totalComments / 1000).toFixed(1) + "k" },
              { icon: <CheckCircle2  size={11} className="text-emerald-400" />, label: "Completed",    value: stats.completedPct + "%" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                {s.icon}
                <div>
                  <p className="text-[9px] text-zinc-700">{s.label}</p>
                  <p className="text-xs font-bold text-zinc-300">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 30-day activity bars ──────────────────────────── */}
      <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-200">Feedback activity (30 days)</p>
          <p className="text-[11px] text-zinc-600">
            New <code className="text-zinc-500">FeatureRequest</code>, <code className="text-zinc-500">Vote</code>, and{" "}
            <code className="text-zinc-500">Comment</code> records per day
          </p>
        </CardHeader>
        <CardContent className="p-5">
          <ChartContainer config={feedbackConfig2} className="h-56 w-full">
            <BarChart data={timeline} barGap={1} barCategoryGap="15%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgb(113,113,122)", fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="votes"    fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} opacity={0.7} />
              <Bar dataKey="comments" fill="hsl(var(--chart-4))" radius={[2, 2, 0, 0]} opacity={0.7} />
              <Bar dataKey="requests" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>

          <div className="mt-3 flex flex-wrap gap-3">
            {[
              { color: "hsl(var(--chart-1))", label: "Feature requests" },
              { color: "hsl(var(--chart-3))", label: "Votes" },
              { color: "hsl(var(--chart-4))", label: "Comments" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[10px] text-zinc-600">{l.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Roadmap progress chart ──────────────────────────────────────── */
const roadmapConfig = { count: { label: "Items" } };

export function RoadmapProgressChart() {
  const data  = getRoadmapProgress();
  const stats = getRoadmapStats();

  return (
    <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Platform roadmap progress</p>
            <p className="text-[11px] text-zinc-600">
              All <code className="text-zinc-500">RoadmapItem</code> records by{" "}
              <code className="text-zinc-500">RoadmapStatus</code> across {stats.totalRoadmaps.toLocaleString()} roadmaps
            </p>
          </div>
          <Badge className="border-emerald-500/25 bg-emerald-500/10 text-[10px] text-emerald-400">
            {stats.completedPct}% done
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {/* Visual bars */}
        <div className="flex flex-col gap-3">
          {data.map((d) => (
            <div key={d.status} className="flex items-center gap-3">
              <div className="w-28 shrink-0 text-xs text-zinc-400">{d.status}</div>
              <div className="flex-1">
                <div className="h-5 overflow-hidden rounded-md bg-zinc-800/60">
                  <div
                    className="h-full rounded-md flex items-center justify-end pr-2 transition-all duration-700"
                    style={{ width: `${d.pct}%`, backgroundColor: d.fill, opacity: 0.85 }}
                  >
                    <span className="text-[10px] font-bold text-white">{d.pct}%</span>
                  </div>
                </div>
              </div>
              <div className="w-20 shrink-0 text-right text-xs font-semibold tabular-nums text-zinc-300">
                {d.count.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-800/60 pt-4 sm:grid-cols-4">
          {[
            { label: "Total roadmaps", value: stats.totalRoadmaps.toLocaleString(),  color: "text-zinc-300"   },
            { label: "Total items",    value: stats.totalItems.toLocaleString(),      color: "text-zinc-300"   },
            { label: "In progress",    value: `${stats.inProgressPct}%`,             color: "text-amber-300"  },
            { label: "Completed",      value: `${stats.completedPct}%`,              color: "text-emerald-300"},
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2">
              <p className="text-[10px] text-zinc-600">{s.label}</p>
              <p className={cn("text-sm font-black tabular-nums", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}