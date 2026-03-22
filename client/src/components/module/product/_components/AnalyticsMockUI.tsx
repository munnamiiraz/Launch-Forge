"use client";

import { motion } from "framer-motion";
import {
  Users, Share2, TrendingUp, ArrowUpRight,
  Globe, Zap, MousePointerClick,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

/* ── data ─────────────────────────────────────────────────────────── */
const AREA_POINTS = [18, 26, 22, 38, 35, 52, 48, 67, 60, 78, 72, 88, 82, 96, 100];

const STAT_CARDS = [
  { label: "Total Signups",   value: "2,847", delta: "+143",  pct: "+5.3%",  positive: true,  icon: <Users size={12} className="text-indigo-400" />,   accent: "indigo" },
  { label: "Viral K-Factor",  value: "3.2×",  delta: "+0.4",  pct: "+14%",   positive: true,  icon: <Share2 size={12} className="text-violet-400" />,  accent: "violet" },
  { label: "Conversion Rate", value: "68%",   delta: "+12pp", pct: "+21%",   positive: true,  icon: <MousePointerClick size={12} className="text-emerald-400" />, accent: "emerald" },
  { label: "Avg. Position",   value: "#1,240", delta: "−82",  pct: "climbing", positive: true, icon: <TrendingUp size={12} className="text-cyan-400" />, accent: "cyan" },
];

const CHANNEL_ROWS = [
  { label: "Twitter / X", pct: 44, count: "1,253" },
  { label: "Direct link",  pct: 28, count: "797"   },
  { label: "Email share",  pct: 18, count: "512"   },
  { label: "LinkedIn",     pct: 10, count: "285"   },
];

const ACCENT_DOT: Record<string, string> = {
  indigo:  "bg-indigo-500",
  violet:  "bg-violet-500",
  emerald: "bg-emerald-500",
  cyan:    "bg-cyan-500",
};

const GEO_DOTS = [
  { x: "22%", y: "32%", label: "US", size: "h-3 w-3", color: "bg-indigo-500" },
  { x: "47%", y: "28%", label: "EU", size: "h-2.5 w-2.5", color: "bg-violet-500" },
  { x: "70%", y: "40%", label: "IN", size: "h-2 w-2", color: "bg-cyan-500" },
  { x: "82%", y: "48%", label: "SG", size: "h-1.5 w-1.5", color: "bg-emerald-500" },
  { x: "34%", y: "62%", label: "BR", size: "h-1.5 w-1.5", color: "bg-amber-500" },
];

export function AnalyticsMockUI() {
  /* Build SVG area-chart path from percentage data */
  const W = 420; const H = 72;
  const pts = AREA_POINTS.map((v, i) => {
    const x = (i / (AREA_POINTS.length - 1)) * W;
    const y = H - (v / 100) * H;
    return `${x},${y}`;
  });
  const linePath = `M ${pts.join(" L ")}`;
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-zinc-800/60 px-4 py-2.5">
        <div className="flex gap-1.5">
          {["bg-zinc-700", "bg-zinc-700", "bg-zinc-700"].map((c, i) => (
            <div key={i} className={cn("h-2 w-2 rounded-full", c)} />
          ))}
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-zinc-500">launchforge.app/analytics</span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/8 px-2 py-0.5 text-[9px] font-semibold text-indigo-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
          </span>
          Live
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STAT_CARDS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-3"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[9px] text-zinc-600">{s.label}</span>
                {s.icon}
              </div>
              <p className="text-sm font-bold tracking-tight text-zinc-100">{s.value}</p>
              <div className="mt-1 flex items-center gap-1">
                <span className={cn("h-1 w-1 rounded-full", ACCENT_DOT[s.accent])} />
                <span className="text-[9px] text-emerald-500">{s.pct}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Area chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-300">Signup velocity</p>
              <p className="text-[10px] text-zinc-600">Last 30 days</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
              <ArrowUpRight size={10} />
              +34% vs last month
            </span>
          </div>

          {/* SVG area chart */}
          <svg viewBox={`0 0 ${W} ${H}`} className="h-16 w-full overflow-visible">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(99,102,241)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d={areaPath}
              fill="url(#areaGrad)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
            />
            <motion.path
              d={linePath}
              fill="none"
              stroke="rgb(99,102,241)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1.0, ease: "easeOut" }}
            />
            {/* Last point dot */}
            <motion.circle
              cx={W}
              cy={H - AREA_POINTS[AREA_POINTS.length - 1] / 100 * H}
              r="3"
              fill="rgb(99,102,241)"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.4, type: "spring", stiffness: 300 }}
            />
          </svg>

          <div className="mt-1 flex justify-between text-[9px] text-zinc-700">
            {["Day 1","","","","","Day 8","","","","","Day 16","","","","Day 30"].map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
        </motion.div>

        {/* Bottom row: channel breakdown + geo mini map */}
        <div className="grid grid-cols-5 gap-3">
          {/* Channel breakdown — spans 3 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3"
          >
            <p className="mb-2.5 text-[10px] font-semibold text-zinc-500">Channel attribution</p>
            <div className="space-y-2">
              {CHANNEL_ROWS.map((row, i) => (
                <div key={row.label} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-[10px] text-zinc-500">{row.label}</span>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-y-0 left-0 rounded-full bg-indigo-500"
                    />
                  </div>
                  <span className="w-8 text-right text-[10px] text-zinc-600">{row.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Geo map — spans 2 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.62, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-2 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-zinc-500">Top regions</p>
              <Globe size={11} className="text-zinc-700" />
            </div>
            {/* Simplified world blob + dots */}
            <div className="relative h-16 overflow-hidden rounded-lg bg-zinc-800/40">
              <div className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.3) 0%, transparent 70%)",
                }}
              />
              {GEO_DOTS.map((dot) => (
                <motion.div
                  key={dot.label}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + Math.random() * 0.3, type: "spring", stiffness: 300 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: dot.x, top: dot.y }}
                >
                  <div className={cn("rounded-full", dot.size, dot.color, "opacity-80")} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
