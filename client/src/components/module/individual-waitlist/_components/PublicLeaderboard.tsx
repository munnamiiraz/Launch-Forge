"use client";

import { motion } from "framer-motion";
import { Trophy, Share2, Users } from "lucide-react";
import { Badge }    from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { cn }       from "@/src/lib/utils";
import type { LeaderboardEntry, PublicPrize } from "@/src/components/module/individual-waitlist/_lib/data";

const AVATAR_GRADIENTS = [
  "from-amber-500 to-orange-500",
  "from-zinc-400 to-zinc-500",
  "from-orange-600 to-red-500",
  "from-indigo-500 to-violet-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-violet-500 to-purple-600",
];

const RANK_STYLES: Record<number, { num: string; row: string }> = {
  1: { num: "text-amber-400 text-base font-black",  row: "border-amber-500/15 bg-amber-500/5"  },
  2: { num: "text-foreground/80  text-sm  font-bold",    row: "border-border/60 bg-zinc-900/20"   },
  3: { num: "text-orange-400 text-sm font-bold",    row: "border-border/60 bg-zinc-900/20"   },
};
const DEFAULT_RANK = { num: "text-muted-foreground/60 text-sm font-medium", row: "hover:bg-zinc-900/20" };

function getPrizeForRank(rank: number, prizes: PublicPrize[]): PublicPrize | null {
  return prizes.find((p) => rank >= p.rankFrom && rank <= p.rankTo) ?? null;
}

interface PublicLeaderboardProps {
  entries: LeaderboardEntry[];
  prizes:  PublicPrize[];
  waitlistName: string;
}

export function PublicLeaderboard({ entries, prizes, waitlistName }: PublicLeaderboardProps) {
  const maxReferrals = entries[0]?.referralCount ?? 1;

  return (
    <section className="flex flex-col gap-5" id="leaderboard">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/10">
          <Trophy size={16} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-foreground">Leaderboard</h2>
          <p className="text-xs text-muted-foreground/60">
            Top referrers on {waitlistName} — updated live
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-12 text-center">
          <Trophy size={28} className="text-zinc-800" />
          <p className="text-sm text-muted-foreground/60">No referrals yet — be the first!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60">

          {/* Column header */}
          <div className="grid grid-cols-[40px_1fr_auto] gap-3 border-b border-border/60 bg-card/60 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            <span className="text-center">#</span>
            <span>Referrer</span>
            <span className="text-right">Referrals</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/40">
            {entries.map((entry, i) => {
              const style      = RANK_STYLES[entry.rank] ?? DEFAULT_RANK;
              const initials   = entry.maskedName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const grad       = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
              const barWidth   = Math.round((entry.referralCount / maxReferrals) * 100);
              const prize      = getPrizeForRank(entry.rank, prizes);

              return (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "grid grid-cols-[40px_1fr_auto] items-center gap-3 px-4 py-3 transition-colors",
                    style.row,
                    entry.rank > 3 && "hover:bg-zinc-900/20",
                  )}
                >
                  {/* Rank */}
                  <span className={cn("text-center tabular-nums", style.num)}>
                    {entry.rank === 1 ? "🥇"
                      : entry.rank === 2 ? "🥈"
                      : entry.rank === 3 ? "🥉"
                      : entry.rank}
                  </span>

                  {/* Name + bar + prize */}
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 shrink-0 rounded-md">
                        <AvatarFallback className={cn("rounded-md bg-gradient-to-br text-[9px] font-bold text-white", grad)}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm font-medium text-foreground/80">
                        {entry.maskedName}
                      </span>
                      {prize && (
                        <Badge className={cn(
                          "shrink-0 rounded-full px-1.5 py-0 text-[9px]",
                          entry.rank === 1
                            ? "border-amber-500/30 bg-amber-500/12 text-amber-300"
                            : "border-zinc-700/60 bg-muted/40 text-muted-foreground/80",
                        )}>
                          {prize.emoji} {prize.rankLabel}
                        </Badge>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ delay: i * 0.04 + 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          "h-full rounded-full",
                          entry.rank === 1 ? "bg-amber-400"
                          : entry.rank === 2 ? "bg-zinc-400"
                          : entry.rank === 3 ? "bg-orange-500"
                          : "bg-indigo-500/60",
                        )}
                      />
                    </div>
                  </div>

                  {/* Referral count */}
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1 text-xs font-bold tabular-nums text-foreground/90">
                      <Share2 size={10} className="text-muted-foreground/40" />
                      {entry.referralCount}
                    </div>
                    <span className="text-[9px] text-muted-foreground/40">
                      {entry.referralCount === 1 ? "referral" : "referrals"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/60 bg-card/30 px-4 py-3 text-[11px] text-muted-foreground/60">
            <span className="flex items-center gap-1.5">
              <Users size={11} />
              {entries.length} top referrers shown
            </span>
            <span>Updated every 5 minutes</span>
          </div>
        </div>
      )}
    </section>
  );
}