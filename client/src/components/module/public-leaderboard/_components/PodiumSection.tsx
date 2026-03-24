"use client";

import { motion } from "framer-motion";
import { Share2, CheckCircle2, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge }   from "@/src/components/ui/badge";
import { cn }      from "@/src/lib/utils";
import type { FullLeaderboardEntry } from "../_lib/data";
import type { PublicPrize } from "@/src/components/module/waitlist-page/_lib/data";
import { getPrizeForRank } from "../_lib/data";

const PODIUM_CONFIG = [
  /* #2 — left  */ { order: 0, height: "h-20", label: "2nd", medal: "🥈", glow: "bg-zinc-400/8",    border: "border-zinc-600/30",   value: "text-foreground/80", crown: false },
  /* #1 — centre*/ { order: 1, height: "h-28", label: "1st", medal: "🥇", glow: "bg-amber-400/10",  border: "border-amber-500/35",  value: "text-amber-300", crown: true  },
  /* #3 — right */ { order: 2, height: "h-14", label: "3rd", medal: "🥉", glow: "bg-orange-500/8",  border: "border-orange-500/25", value: "text-orange-300",crown: false },
];

// Display order: 2nd | 1st | 3rd
const DISPLAY_ORDER = [1, 0, 2]; // index into top3 array → podium slot

const GRADS = [
  "from-amber-400 to-orange-500",  // #1
  "from-zinc-400  to-zinc-500",    // #2
  "from-orange-500 to-red-600",    // #3
];

interface PodiumSectionProps {
  top3:   FullLeaderboardEntry[];
  prizes: PublicPrize[];
}

export function PodiumSection({ top3, prizes }: PodiumSectionProps) {
  if (top3.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-8">

      {/* ── Three avatars in podium layout ─────────────── */}
      <div className="flex items-end justify-center gap-4 sm:gap-8">
        {DISPLAY_ORDER.map((entryIdx, slotIdx) => {
          const entry   = top3[entryIdx];
          const slot    = PODIUM_CONFIG[slotIdx];
          if (!entry) return null;
          const initials= entry.maskedName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          const prize   = getPrizeForRank(entry.rank, prizes);

          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: slotIdx * 0.1 + 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-3"
            >
              {/* Crown for #1 */}
              {slot.crown && (
                <motion.div
                  initial={{ opacity: 0, y: 8, rotate: -10 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.5, duration: 0.4, type: "spring" }}
                  className="text-2xl"
                >
                  👑
                </motion.div>
              )}

              {/* Avatar */}
              <div className="relative">
                <div className={cn(
                  "absolute inset-0 -m-1 rounded-full blur-md",
                  slot.glow,
                )} />
                <Avatar className={cn(
                  "relative border-2 shadow-xl",
                  slot.crown ? "h-16 w-16 rounded-2xl" : "h-12 w-12 rounded-xl",
                  slot.border,
                )}>
                  <AvatarFallback className={cn(
                    "bg-gradient-to-br font-black text-white",
                    slot.crown ? "rounded-2xl text-base" : "rounded-xl text-sm",
                    GRADS[entryIdx],
                  )}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Confirmation dot */}
                {entry.isConfirmed && (
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="flex flex-col items-center gap-0.5">
                <p className={cn(
                  "font-bold tracking-tight",
                  slot.crown ? "text-sm text-foreground" : "text-xs text-foreground/80",
                )}>
                  {entry.maskedName}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                  <Share2 size={9} />
                  <span className="tabular-nums font-semibold text-muted-foreground">{entry.referralCount}</span>
                  refs
                </div>
              </div>

              {/* Podium block */}
              <div className={cn(
                "flex w-20 sm:w-24 items-center justify-center rounded-t-xl border-t border-l border-r transition-all",
                slot.height,
                slot.border,
                "bg-gradient-to-b from-zinc-800/40 to-zinc-900/40",
              )}>
                <span className="text-xl">{slot.medal}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Prize cards for top 3 ───────────────────────── */}
      <div className="grid w-full gap-3 sm:grid-cols-3">
        {top3.map((entry, i) => {
          const prize = getPrizeForRank(entry.rank, prizes);
          if (!prize) return null;
          const medals = ["🥇", "🥈", "🥉"];
          const accents = [
            "border-amber-500/25 bg-amber-500/8",
            "border-zinc-700/60 bg-card/30",
            "border-orange-500/20 bg-orange-500/6",
          ];
          const valueColors = ["text-amber-300", "text-foreground/80", "text-orange-300"];

          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3",
                accents[i],
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base shrink-0">{medals[i]}</span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground/90">{prize.title}</p>
                  <p className="text-[10px] text-muted-foreground/60">{prize.rankLabel} place</p>
                </div>
              </div>
              {prize.value && (
                <span className={cn("shrink-0 text-sm font-black tabular-nums", valueColors[i])}>
                  {prize.prizeType === "DISCOUNT"
                    ? `${prize.value}% off`
                    : `$${prize.value.toLocaleString()}`}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}