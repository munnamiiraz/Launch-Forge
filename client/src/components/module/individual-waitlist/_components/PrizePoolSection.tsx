"use client";

import { motion } from "framer-motion";
import { Trophy, Clock } from "lucide-react";
import { Badge }    from "@/src/components/ui/badge";
import { cn }       from "@/src/lib/utils";
import type { PublicPrize } from "../_lib/data";

function fmtExpiry(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const PRIZE_ACCENT: Record<string, { card: string; value: string; bar: string }> = {
  CASH:            { card: "border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/8",  value: "text-emerald-600 dark:text-emerald-300", bar: "bg-emerald-500" },
  GIFT_CARD:       { card: "border-amber-500/20 bg-amber-500/10 dark:bg-amber-500/6",      value: "text-amber-600 dark:text-amber-300",   bar: "bg-amber-500"  },
  PRODUCT:         { card: "border-cyan-500/20 bg-cyan-500/10 dark:bg-cyan-500/6",        value: "text-cyan-600 dark:text-cyan-300",    bar: "bg-cyan-500"   },
  LIFETIME_ACCESS: { card: "border-violet-500/20 bg-violet-500/10 dark:bg-violet-500/6",    value: "text-violet-600 dark:text-violet-300",  bar: "bg-violet-500" },
  DISCOUNT:        { card: "border-rose-500/20 bg-rose-500/10 dark:bg-rose-500/6",        value: "text-rose-600 dark:text-rose-300",    bar: "bg-rose-500"   },
  CUSTOM:          { card: "border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-500/6",    value: "text-indigo-600 dark:text-indigo-300",  bar: "bg-indigo-500" },
};

interface PrizePoolSectionProps {
  prizes: PublicPrize[];
}

export function PrizePoolSection({ prizes }: PrizePoolSectionProps) {
  if (prizes.length === 0) return null;

  const totalCash = prizes
    .filter((p) => p.prizeType === "CASH" && p.value)
    .reduce((s, p) => s + (p.value ?? 0), 0);

  return (
    <section className="flex flex-col gap-6" id="prizes">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 dark:border-amber-500/25 bg-amber-500/10">
            <Trophy size={16} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground">Prize pool</h2>
            <p className="text-xs text-muted-foreground/60">
              Top referrers win prizes when the waitlist closes
            </p>
          </div>
        </div>
        {totalCash > 0 && (
          <Badge className="border-emerald-500/20 dark:border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-sm font-black text-emerald-700 dark:text-emerald-400">
            ${totalCash.toLocaleString()} cash
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {prizes.map((prize, i) => {
          const accent   = PRIZE_ACCENT[prize.prizeType] ?? PRIZE_ACCENT.CUSTOM;
          const isTop    = prize.rankFrom === 1 && prize.rankTo === 1;
          const expired  = prize.expiresAt ? new Date(prize.expiresAt) < new Date() : false;

          return (
            <motion.div
              key={prize.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative overflow-hidden rounded-2xl border p-4 transition-all duration-300",
                accent.card,
                isTop && "ring-1 ring-amber-500/20",
              )}
            >
              {/* Left accent bar */}
              <div className={cn("absolute inset-y-0 left-0 w-1 rounded-l-2xl", accent.bar, "opacity-60")} />

              <div className="flex items-start justify-between gap-4 pl-3">
                <div className="flex items-start gap-3">
                  {/* Emoji */}
                  <span className={cn("text-2xl", isTop ? "mt-0" : "mt-0.5")}>
                    {isTop ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : prize.emoji}
                  </span>

                  <div className="flex flex-col gap-1.5">
                    {/* Rank badge */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        isTop
                          ? "border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "border-border bg-muted text-muted-foreground",
                      )}>
                        {prize.rankLabel} place
                      </Badge>
                      {expired && (
                        <Badge className="border-red-500/20 bg-red-500/8 text-[9px] text-red-400">Expired</Badge>
                      )}
                    </div>

                    <p className="text-sm font-bold text-foreground">{prize.title}</p>

                    {prize.description && (
                      <p className="text-xs leading-relaxed text-muted-foreground/80">{prize.description}</p>
                    )}

                    {prize.expiresAt && !expired && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                        <Clock size={10} />
                        Ends {fmtExpiry(prize.expiresAt)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Value */}
                {prize.value && (
                  <div className="shrink-0 text-right">
                    <p className={cn("text-xl font-black tabular-nums", accent.value)}>
                      {prize.prizeType === "DISCOUNT"
                        ? `${prize.value}% off`
                        : `${prize.currency === "USD" ? "$" : prize.currency ?? ""}${prize.value.toLocaleString()}`
                      }
                    </p>
                    {prize.currency && prize.prizeType !== "DISCOUNT" && (
                      <p className="text-[10px] text-muted-foreground/60">{prize.currency}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground/40">
        Prizes are awarded to the top referrers when the waitlist closes.
        Each referral = one spot higher in the queue.
      </p>
    </section>
  );
}