"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Share2, CheckCircle2,
  Trophy, Star, Users, Layers,
  ChevronLeft, ChevronRight,
} from "lucide-react";

import { Input }  from "@/src/components/ui/input";
import { Badge }  from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { cn }     from "@/src/lib/utils";
import type { FullLeaderboardEntry } from "../_lib/data";
import type { PublicPrize }          from "../../waitlist-page/_lib/data";
import { getPrizeForRank }           from "../_lib/data";

const PAGE_SIZE = 15;

type TierFilter = "all" | "champion" | "top10" | "top25" | "rising";

const TIER_TABS: { id: TierFilter; label: string; icon: React.ReactNode }[] = [
  { id: "all",      label: "All",      icon: <Layers size={12} />    },
  { id: "champion", label: "Champion", icon: <>🥇</>                  },
  { id: "top10",    label: "Top 10",   icon: <>🥈</>                  },
  { id: "top25",    label: "Top 25",   icon: <>🥉</>                  },
  { id: "rising",   label: "Rising",   icon: <Star  size={11} />      },
];

const TIER_BADGE: Record<FullLeaderboardEntry["tier"], string> = {
  champion: "border-amber-500/35 bg-amber-500/12 text-amber-300",
  top10:    "border-zinc-600/40 bg-zinc-700/20 text-zinc-300",
  top25:    "border-orange-600/30 bg-orange-600/10 text-orange-400",
  rising:   "border-indigo-500/25 bg-indigo-500/10 text-indigo-400",
};

const AVATAR_GRADS = [
  "from-amber-500 to-orange-500",   "from-zinc-400 to-zinc-500",
  "from-orange-600 to-red-500",     "from-indigo-500 to-violet-600",
  "from-cyan-500 to-blue-600",      "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",      "from-violet-500 to-purple-600",
  "from-amber-400 to-yellow-600",   "from-sky-500 to-indigo-500",
];

interface LeaderboardTableProps {
  entries: FullLeaderboardEntry[];
  prizes:  PublicPrize[];
}

export function LeaderboardTable({ entries, prizes }: LeaderboardTableProps) {
  const [search,  setSearch]  = useState("");
  const [tier,    setTier]    = useState<TierFilter>("all");
  const [page,    setPage]    = useState(1);

  const filtered = useMemo(() => {
    let list = entries;
    if (tier !== "all") list = list.filter((e) => e.tier === tier);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.maskedName.toLowerCase().includes(q));
    }
    return list;
  }, [entries, tier, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const maxRefs    = entries[0]?.referralCount ?? 1;

  const handleTier = (t: TierFilter) => { setTier(t); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3">

        {/* Tier tabs */}
        <div className="flex items-center gap-0.5 overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-1">
          {TIER_TABS.map(({ id, label, icon }) => {
            const active = tier === id;
            const count  = id === "all"
              ? entries.length
              : entries.filter((e) => e.tier === id).length;

            return (
              <button
                key={id}
                onClick={() => handleTier(id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
                  active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="lb-tier-active"
                    className="absolute inset-0 rounded-lg bg-zinc-800"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {icon}
                  {label}
                  <span className={cn(
                    "rounded-full px-1.5 py-0 text-[9px] font-bold tabular-nums",
                    active ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800/60 text-zinc-600",
                  )}>
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name…"
            className="h-9 border-zinc-800/80 bg-zinc-900/60 pl-8 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-indigo-500/40 focus-visible:ring-1 focus-visible:ring-indigo-500/20"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800/60">

        {/* Column headers */}
        <div className="grid grid-cols-[44px_1fr_80px_80px] gap-3 border-b border-zinc-800/60 bg-zinc-900/60 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 sm:grid-cols-[44px_1fr_auto_80px_80px]">
          <span className="text-center">#</span>
          <span>Referrer</span>
          <span className="hidden text-center sm:block">Tier</span>
          <span className="text-right">Referrals</span>
          <span className="text-right">Share</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-800/40">
          <AnimatePresence mode="popLayout">
            {paginated.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-14 text-center"
              >
                <Trophy size={28} className="text-zinc-800" />
                <p className="text-sm text-zinc-600">No entries match your filters.</p>
              </motion.div>
            ) : paginated.map((entry, i) => {
              const globalIdx = (page - 1) * PAGE_SIZE + i;
              const prize     = getPrizeForRank(entry.rank, prizes);
              const initials  = entry.maskedName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const grad      = AVATAR_GRADS[globalIdx % AVATAR_GRADS.length];
              const barPct    = Math.round((entry.referralCount / maxRefs) * 100);

              const rankStyle =
                entry.rank === 1 ? "text-amber-400 text-base font-black"  :
                entry.rank === 2 ? "text-zinc-300  text-sm  font-bold"    :
                entry.rank === 3 ? "text-orange-400 text-sm font-bold"    :
                                   "text-zinc-600   text-sm  font-medium";

              const rowBg =
                entry.rank === 1 ? "bg-amber-500/5 border-l-2 border-l-amber-500/40" :
                entry.rank <= 3  ? "bg-zinc-900/30" :
                                   "hover:bg-zinc-900/20";

              return (
                <motion.div
                  key={entry.rank}
                  layout
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "grid grid-cols-[44px_1fr_80px_80px] items-center gap-3 px-4 py-3 transition-colors sm:grid-cols-[44px_1fr_auto_80px_80px]",
                    rowBg,
                  )}
                >
                  {/* Rank */}
                  <span className={cn("text-center tabular-nums", rankStyle)}>
                    {entry.rank === 1 ? "🥇"
                      : entry.rank === 2 ? "🥈"
                      : entry.rank === 3 ? "🥉"
                      : entry.rank}
                  </span>

                  {/* Name + bar + prize */}
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Avatar className="h-6 w-6 shrink-0 rounded-lg">
                        <AvatarFallback className={cn("rounded-lg bg-gradient-to-br text-[9px] font-bold text-white", grad)}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-zinc-200">{entry.maskedName}</span>
                      {entry.isConfirmed && (
                        <CheckCircle2 size={11} className="shrink-0 text-emerald-500" />
                      )}
                      {prize && (
                        <Badge className={cn(
                          "hidden shrink-0 rounded-full px-1.5 py-0 text-[9px] sm:inline-flex",
                          entry.rank === 1
                            ? "border-amber-500/30 bg-amber-500/12 text-amber-300"
                            : "border-zinc-700/60 bg-zinc-800/40 text-zinc-500",
                        )}>
                          {prize.emoji}
                        </Badge>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barPct}%` }}
                        transition={{ delay: i * 0.03 + 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          "h-full rounded-full",
                          entry.rank === 1 ? "bg-amber-400"     :
                          entry.rank === 2 ? "bg-zinc-400"      :
                          entry.rank === 3 ? "bg-orange-500"    :
                                             "bg-indigo-500/60",
                        )}
                      />
                    </div>
                  </div>

                  {/* Tier badge */}
                  <div className="hidden justify-center sm:flex">
                    <Badge className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", TIER_BADGE[entry.tier])}>
                      {entry.tier === "champion" ? "Champion"
                        : entry.tier === "top10" ? "Top 10"
                        : entry.tier === "top25" ? "Top 25"
                        : "Rising"}
                    </Badge>
                  </div>

                  {/* Referral count */}
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1 text-sm font-bold tabular-nums text-zinc-200">
                      <Share2 size={10} className="text-zinc-700" />
                      {entry.referralCount}
                    </div>
                    <span className="text-[9px] text-zinc-700">
                      {entry.referralCount === 1 ? "referral" : "referrals"}
                    </span>
                  </div>

                  {/* Share % */}
                  <div className="text-right">
                    <span className="text-xs tabular-nums text-zinc-500">{entry.sharePercent}%</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Pagination + count footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/60 bg-zinc-900/30 px-4 py-3">
          <p className="text-[11px] text-zinc-600">
            Showing{" "}
            <span className="font-semibold text-zinc-400">
              {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of <span className="font-semibold text-zinc-400">{filtered.length}</span> referrers
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="icon" disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 w-7 rounded-md text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-300 disabled:opacity-30"
              >
                <ChevronLeft size={13} />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1
                  : page <= 3 ? i + 1
                  : page >= totalPages - 2 ? totalPages - 4 + i
                  : page - 2 + i;
                return (
                  <Button
                    key={p} variant="ghost" size="icon"
                    onClick={() => setPage(p)}
                    className={cn(
                      "h-7 w-7 rounded-md text-xs font-medium",
                      p === page
                        ? "bg-indigo-600 text-white hover:bg-indigo-500"
                        : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300",
                    )}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button
                variant="ghost" size="icon" disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 w-7 rounded-md text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-300 disabled:opacity-30"
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}