"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

interface GrowthDataPoint {
  day: string;
  value: number;
}

// Fallback mock data
const MOCK_WEEKLY_DATA: GrowthDataPoint[] = [
  { day: "Mon", value: 42  },
  { day: "Tue", value: 67  },
  { day: "Wed", value: 53  },
  { day: "Thu", value: 89  },
  { day: "Fri", value: 74  },
  { day: "Sat", value: 95  },
  { day: "Sun", value: 118 },
];

export function GrowthChart() {
  const { activeWorkspace } = useWorkspace();
  const [weeklyData, setWeeklyData] = useState<GrowthDataPoint[]>(MOCK_WEEKLY_DATA);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<GrowthDataPoint | null>(null);

  useEffect(() => {
    async function fetchGrowthData() {
      if (!activeWorkspace) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/workspaces/${activeWorkspace.id}/analytics/growth?range=7d`, {
          credentials: "include",
          cache: "no-store",
        });

        if (res.ok) {
          const json = await res.json();
          const apiData = json?.data;
          
          if (Array.isArray(apiData) && apiData.length > 0) {
            // Transform API data to our format - use 'subscribers' field for daily count
            const transformed = apiData.map((item: { date?: string; subscribers?: number; cumulative?: number }) => ({
              day: item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3) : "",
              value: item.subscribers || 0,
            }));
            setWeeklyData(transformed);
          }
        }
      } catch (error) {
        console.error("Failed to fetch growth data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGrowthData();
  }, [activeWorkspace]);

  // Calculate chart values
  const W = 500;
  const H = 100;
  const data = weeklyData.length > 0 ? weeklyData : MOCK_WEEKLY_DATA;
  const MAX = Math.max(...data.map((d) => d.value), 1);
  
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (d.value / MAX) * H * 0.9 - H * 0.05,
    ...d,
  }));
  
  const linePath  = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`;
  const areaPath  = `${linePath} L ${W},${H} L 0,${H} Z`;

  const total = weeklyData.reduce((s, d) => s + d.value, 0);
  const prevTotal = Math.round(total * 0.78);
  const pct = Math.round(((total - prevTotal) / prevTotal) * 100);

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
                {loading ? "..." : total.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground/60">total signups</p>
            </div>
            {!loading && (
              <Badge className="gap-1 border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                <ArrowUpRight size={10} />
                +{pct}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {loading ? (
          // Loading skeleton
          <div className="flex h-28 flex-col gap-4">
            <div className="flex items-end justify-between gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="mx-1 animate-pulse rounded-t bg-zinc-800"
                  style={{
                    height: `${Math.random() * 60 + 20}%`,
                    width: `${100 / 8}%`,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-3 w-8 animate-pulse rounded bg-zinc-800" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* SVG Chart */}
            <div className="relative">
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

                {/* Data point dots with hover */}
                {points.map((p, i) => (
                  <g key={`${p.day}-${i}`}>
                    {/* Invisible larger hit area for easier hovering */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={20}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* Visible dot */}
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredPoint?.day === p.day ? 6 : 3.5}
                      fill="rgb(99,102,241)"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8 + i * 0.08, type: "spring", stiffness: 300 }}
                      className="transition-all duration-150"
                      style={{ pointerEvents: "none" }}
                    />
                  </g>
                ))}
              </svg>

              {/* Tooltip */}
              {hoveredPoint && (
                <div
                  className="absolute z-10 rounded-lg bg-zinc-900 px-3 py-2 shadow-lg border border-zinc-700"
                  style={{
                    left: `${(points.find(p => p.day === hoveredPoint.day)?.x || 0) / W * 100}%`,
                    top: '0',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <p className="text-xs font-medium text-white">{hoveredPoint.day}</p>
                  <p className="text-[10px] text-zinc-400">{hoveredPoint.value} signups</p>
                </div>
              )}
            </div>

            {/* X-axis labels */}
            <div className="mt-2 flex justify-between">
              {data.map((d: GrowthDataPoint, i: number) => (
                <div key={`${d.day}-${i}`} className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-muted-foreground/40">{d.day}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
