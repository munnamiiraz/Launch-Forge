"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge }  from "@/src/components/ui/badge";
import { cn }     from "@/src/lib/utils";
import { getFeatureAdoption } from "../_lib/analytics-data";

export function FeatureAdoptionChart() {
  const data = getFeatureAdoption();

  return (
    <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
        <p className="text-sm font-semibold text-zinc-200">Feature adoption</p>
        <p className="text-[11px] text-zinc-600">
          % of workspaces actively using each feature — sourced from{" "}
          <code className="text-zinc-500">Workspace</code> + feature model relations
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-5">
        {data.map((item, i) => (
          <motion.div
            key={item.feature}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            {/* Feature name */}
            <div className="w-36 shrink-0">
              <p className="text-xs font-medium text-zinc-300 truncate">{item.feature}</p>
            </div>

            {/* Progress bar */}
            <div className="flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ delay: i * 0.05 + 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
              </div>
            </div>

            {/* Pct + delta */}
            <div className="flex shrink-0 items-center gap-2 w-28 justify-end">
              <span className="text-xs font-bold tabular-nums text-zinc-300">
                {item.pct.toFixed(1)}%
              </span>
              <Badge className={cn(
                "gap-0.5 rounded-full px-1.5 py-0 text-[9px] font-semibold",
                item.deltaWoW > 0
                  ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-400"
                  : "border-zinc-700 bg-zinc-800/40 text-zinc-600",
              )}>
                {item.deltaWoW > 0 && <TrendingUp size={8} />}
                {item.deltaWoW > 0 ? `+${item.deltaWoW}` : "—"}
              </Badge>
            </div>
          </motion.div>
        ))}

        <p className="mt-1 text-center text-[10px] text-zinc-700">
          WoW delta = week-over-week change in adoption percentage points
        </p>
      </CardContent>
    </Card>
  );
}