"use client";

import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { cn } from "@/src/lib/utils";
import { HeatmapCell, ChangelogPoint } from "../_lib/analytics-data";

/* ── Workspace activity heatmap ──────────────────────────────────── */

function heatColor(v: number): string {
  if (v >= 85) return "bg-red-500";
  if (v >= 70) return "bg-red-500/75";
  if (v >= 55) return "bg-orange-500/80";
  if (v >= 40) return "bg-amber-500/70";
  if (v >= 25) return "bg-amber-500/40";
  if (v >= 12) return "bg-zinc-700/80";
  return "bg-zinc-800/50";
}

const HOURS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0)  return "12am";
  if (i === 12) return "12pm";
  if (i < 12)   return `${i}am`;
  return `${i - 12}pm`;
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WorkspaceHeatmap({ data = [] }: { data?: HeatmapCell[] }) {
  const byDay: Record<string, number[]> = {};
  DAYS.forEach((d) => { byDay[d] = []; });
  data.forEach((c) => byDay[c.day].push(c.value));

  const peak = data.length > 0 ? data.reduce((max, c) => c.value > max.value ? c : max, data[0]) : null;

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/25 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Workspace activity heatmap</p>
            <p className="text-[11px] text-muted-foreground/60">
              Platform usage intensity by day of week × hour — derived from{" "}
              <code className="text-muted-foreground/80">Session</code> timestamps
            </p>
          </div>
          <div className="text-right text-[10px] text-muted-foreground/60">
            Peak: <span className="font-semibold text-foreground/80">{peak?.day} {peak ? HOURS[peak.hour] : ""}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto p-5">
        <div className="min-w-[600px]">
          {/* Hour axis */}
          <div className="mb-1 flex">
            <div className="w-10 shrink-0" />
            {HOURS.map((h, i) => (
              <div key={i} className="flex-1 text-center">
                {i % 3 === 0 && (
                  <span className="text-[8px] text-muted-foreground/40">{h}</span>
                )}
              </div>
            ))}
          </div>

          {/* Grid */}
          {DAYS.map((day) => (
            <div key={day} className="mb-0.5 flex items-center gap-0">
              <div className="w-10 shrink-0 text-[10px] text-muted-foreground/60">{day}</div>
              {(byDay[day] ?? []).map((val, hour) => (
                <motion.div
                  key={hour}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: DAYS.indexOf(day) * 0.04 + hour * 0.008, duration: 0.25 }}
                  title={`${day} ${HOURS[hour]}: ${val}%`}
                  className={cn(
                    "flex-1 mx-px rounded-sm transition-all",
                    "h-5 cursor-default hover:ring-1 hover:ring-white/20",
                    heatColor(val),
                  )}
                />
              ))}
            </div>
          ))}

          {/* Legend */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/60">Low</span>
            {[5, 15, 28, 42, 58, 72, 88].map((v) => (
              <div key={v} className={cn("h-3 w-5 rounded-sm", heatColor(v))} />
            ))}
            <span className="text-[10px] text-muted-foreground/60">High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Changelog publishing chart ──────────────────────────────────── */

const clConfig = {
  published: { label: "Published",  color: "hsl(var(--chart-2))" },
  drafts:    { label: "Drafts",     color: "hsl(var(--chart-5))" },
};

export function ChangelogChart({ data = [] }: { data?: ChangelogPoint[] }) {
  const totalPublished = data.reduce((s, d) => s + d.published, 0);
  const totalDrafts    = data.reduce((s, d) => s + d.drafts, 0);

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Changelog publishing</p>
            <p className="text-[11px] text-muted-foreground/60">
              <code className="text-muted-foreground/80">Changelog</code> records — <code className="text-muted-foreground/80">publishedAt</code> not null vs drafts
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
            <span>
              <span className="font-black text-cyan-300">{totalPublished.toLocaleString()}</span>{" "}published
            </span>
            <span>
              <span className="font-black text-muted-foreground/80">{totalDrafts.toLocaleString()}</span>{" "}drafts
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <ChartContainer config={clConfig} className="h-44 w-full">
          <BarChart data={data} barGap={2} barCategoryGap="25%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgb(113,113,122)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="published" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
            <Bar dataKey="drafts"    fill="hsl(var(--chart-5))" radius={[3, 3, 0, 0]} opacity={0.55} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}