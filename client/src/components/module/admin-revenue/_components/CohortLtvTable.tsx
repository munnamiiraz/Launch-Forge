"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import { getCohortLtv, getRevenueByCountry, CohortLtvRow, RevenueByCountry } from "../_lib/revenue-data";

/* ── Heat colour based on MRR retention % ────────────────────────── */
function heatColor(pct: number): string {
  if (pct === 0)   return "bg-zinc-800/30 text-muted-foreground/40";
  if (pct >= 90)   return "bg-emerald-500    text-white";
  if (pct >= 75)   return "bg-emerald-500/70 text-white";
  if (pct >= 60)   return "bg-emerald-500/45 text-foreground/90";
  if (pct >= 45)   return "bg-amber-500/40   text-foreground/90";
  if (pct >= 30)   return "bg-amber-500/25   text-muted-foreground";
  return "bg-red-500/20 text-muted-foreground/80";
}

/* ── Cohort LTV heatmap ──────────────────────────────────────────── */
export function CohortLtvTable({ data }: { data: CohortLtvRow[] }) {

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <p className="text-sm font-semibold text-foreground/90">Cohort revenue retention (LTV heatmap)</p>
        <p className="text-[11px] text-muted-foreground/60">
          MRR retained per monthly cohort at M1, M3, M6, M12 — greener = better retention
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto p-5">
        <table className="w-full min-w-max text-xs">
          <thead>
            <tr>
              <th className="pb-2 pr-4 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">
                Cohort
              </th>
              <th className="pb-2 pr-4 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Users
              </th>
              {["M1", "M3", "M6", "M12"].map((h) => (
                <th key={h} className="w-20 pb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {h}
                </th>
              ))}
              <th className="pb-2 pl-4 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Avg LTV
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {data.map((row, ri) => {
              const base     = row.month1Mrr;
              const retentions = [
                { val: row.month1Mrr,  pct: base > 0 ? 100 : 0 },
                { val: row.month3Mrr,  pct: base > 0 ? Math.round((row.month3Mrr  / base) * 100) : 0 },
                { val: row.month6Mrr,  pct: base > 0 ? Math.round((row.month6Mrr  / base) * 100) : 0 },
                { val: row.month12Mrr, pct: base > 0 ? Math.round((row.month12Mrr / base) * 100) : 0 },
              ];

              return (
                <motion.tr
                  key={row.cohort}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: ri * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <td className="py-2 pr-4 text-xs font-medium text-foreground/80 whitespace-nowrap">
                    {row.cohort}
                  </td>
                  <td className="py-2 pr-4 text-right text-xs tabular-nums text-muted-foreground/80">
                    {row.startingUsers}
                  </td>
                  {retentions.map((r, ci) => (
                    <td key={ci} className="px-1 py-1.5">
                      <div className={cn(
                        "flex h-9 flex-col items-center justify-center rounded-md text-[10px] font-bold tabular-nums transition-colors",
                        r.val === 0 ? "bg-muted/20 text-zinc-800" : heatColor(r.pct),
                      )}>
                        {r.val > 0 ? (
                          <>
                            <span>${(r.val / 1000).toFixed(1)}k</span>
                            {ci > 0 && <span className="text-[8px] opacity-70">{r.pct}%</span>}
                          </>
                        ) : (
                          <span className="text-zinc-800">—</span>
                        )}
                      </div>
                    </td>
                  ))}
                  <td className="py-2 pl-4 text-right text-xs font-bold tabular-nums text-foreground/80">
                    ${row.avgLtv}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {/* Colour scale legend */}
        <div className="mt-5 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground/60">Low retention</span>
          {[10, 30, 50, 70, 90, 100].map((p) => (
            <div key={p} className={cn("h-3 w-8 rounded-sm", heatColor(p).split(" ")[0])} />
          ))}
          <span className="text-[10px] text-muted-foreground/60">High retention</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Revenue by country ──────────────────────────────────────────── */
export function RevenueByCountryCard({ data }: { data: RevenueByCountry[] }) {
  const maxMrr   = Math.max(...data.map((d) => d.mrr));
  const totalMrr = data.reduce((s, d) => s + d.mrr, 0);

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-500/30 to-transparent" />
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-foreground/90">Revenue by country</p>
            <p className="text-[11px] text-muted-foreground/60">MRR distribution across top markets</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-5">
        {data.map((country, i) => (
          <motion.div
            key={country.country}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            {/* Flag */}
            <span className="w-6 shrink-0 text-center text-base">{country.flag}</span>

            {/* Country name */}
            <div className="w-32 shrink-0 min-w-0">
              <p className="truncate text-xs text-foreground/80">{country.country}</p>
              <p className="text-[10px] text-muted-foreground/60">{country.users} users</p>
            </div>

            {/* Bar */}
            <div className="flex-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((country.mrr / maxMrr) * 100)}%` }}
                  transition={{ delay: i * 0.05 + 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-linear-to-r from-amber-500 to-orange-500"
                />
              </div>
            </div>

            {/* MRR + pct */}
            <div className="flex shrink-0 flex-col items-end">
              <span className="text-xs font-bold tabular-nums text-foreground/80">
                ${(country.mrr / 1000).toFixed(1)}k
              </span>
              <span className="text-[10px] tabular-nums text-muted-foreground/60">{country.pct}%</span>
            </div>
          </motion.div>
        ))}

        {/* Total */}
        <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-3">
          <span className="text-xs font-semibold text-muted-foreground/80">Total MRR</span>
          <span className="text-sm font-black tabular-nums text-emerald-300">
            ${(totalMrr / 1000).toFixed(1)}k
          </span>
        </div>
      </CardContent>
    </Card>
  );
}