"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

const WEEKLY_DATA = [
  { day: "Mon", value: 42  },
  { day: "Tue", value: 67  },
  { day: "Wed", value: 53  },
  { day: "Thu", value: 89  },
  { day: "Fri", value: 74  },
  { day: "Sat", value: 95  },
  { day: "Sun", value: 118 },
];

const MAX = Math.max(...WEEKLY_DATA.map((d) => d.value));
const W = 500;
const H = 100;

const points = WEEKLY_DATA.map((d, i) => ({
  x: (i / (WEEKLY_DATA.length - 1)) * W,
  y: H - (d.value / MAX) * H * 0.9 - H * 0.05,
  ...d,
}));

const linePath  = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`;
const areaPath  = `${linePath} L ${W},${H} L 0,${H} Z`;

export function GrowthChart() {
  const total   = WEEKLY_DATA.reduce((s, d) => s + d.value, 0);
  const prevTotal = Math.round(total * 0.78); // mock prev week
  const pct     = Math.round(((total - prevTotal) / prevTotal) * 100);

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Signup growth</p>
            <p className="text-[11px] text-muted-foreground/60">Last 7 days</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xl font-black tracking-tight text-indigo-300">
                {total.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground/60">total signups</p>
            </div>
            <Badge className="gap-1 border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
              <ArrowUpRight size={10} />
              +{pct}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {/* SVG Chart */}
        <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full overflow-visible">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgb(99,102,241)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0"   />
            </linearGradient>
          </defs>

          <motion.path
            d={areaPath}
            fill="url(#chartGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          />
          <motion.path
            d={linePath}
            fill="none"
            stroke="rgb(99,102,241)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
          />

          {/* Data point dots */}
          {points.map((p, i) => (
            <motion.circle
              key={p.day}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="rgb(99,102,241)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.08, type: "spring", stiffness: 300 }}
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="mt-2 flex justify-between">
          {WEEKLY_DATA.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-muted-foreground/40">{d.day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
