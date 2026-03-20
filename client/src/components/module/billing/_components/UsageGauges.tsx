"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge }  from "@/src/components/ui/badge";
import { cn }     from "@/src/lib/utils";
import type { UsageItem } from "@/src/components/module/billing/_types";

function pct(used: number, limit: number | null): number {
  if (limit === null) return 0;   // unlimited — no bar to fill
  if (limit === 0)    return 100;
  return Math.min(100, Math.round((used / limit) * 100));
}

function barColor(p: number): string {
  if (p >= 90) return "bg-red-500";
  if (p >= 70) return "bg-amber-500";
  return "bg-indigo-500";
}

interface UsageGaugesProps {
  usage: UsageItem[];
}

export function UsageGauges({ usage }: UsageGaugesProps) {
  return (
    <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
        <p className="text-sm font-semibold text-zinc-200">Current usage</p>
        <p className="text-[11px] text-zinc-600">Your resource consumption this billing period</p>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 p-5">
        {usage.map((item, i) => {
          const p       = pct(item.used, item.limit);
          const isUnlim = item.limit === null;
          const isHigh  = !isUnlim && p >= 90;
          const isWarn  = !isUnlim && p >= 70 && p < 90;

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-bold tabular-nums",
                    isHigh ? "text-red-400" : isWarn ? "text-amber-400" : "text-zinc-300",
                  )}>
                    {item.used.toLocaleString()}
                    {item.limit !== null && (
                      <span className="font-normal text-zinc-600">
                        {" "}/ {item.limit.toLocaleString()}
                      </span>
                    )}
                  </span>
                  {isUnlim && (
                    <Badge className="border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0 text-[9px] text-emerald-400">
                      Unlimited
                    </Badge>
                  )}
                  {!isUnlim && (
                    <span className={cn(
                      "text-[10px] tabular-nums",
                      isHigh ? "text-red-400" : isWarn ? "text-amber-400" : "text-zinc-600",
                    )}>
                      {p}%
                    </span>
                  )}
                </div>
              </div>

              {!isUnlim && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p}%` }}
                    transition={{ delay: i * 0.06 + 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className={cn("h-full rounded-full", barColor(p))}
                  />
                </div>
              )}

              {isHigh && (
                <p className="text-[10px] text-red-400">
                  Approaching your limit — consider upgrading to avoid service interruption.
                </p>
              )}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}