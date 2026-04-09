"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowDownUp, Trophy, Zap, Users, Share2 } from "lucide-react";

import { Input }  from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { cn }    from "@/src/lib/utils";

import { LeaderboardWaitlistCard } from "./LeaderboardWaitlistCard";
import type { WaitlistLeaderboardCard } from "../_types";

/* ── Sort options ────────────────────────────────────────────────── */
type SortKey = "topReferrals" | "subscribers" | "viralScore" | "referrals";

const SORT_OPTIONS: { id: SortKey; label: string; icon: React.ReactNode }[] = [
  { id: "topReferrals", label: "Top referrer",   icon: <Trophy  size={12} /> },
  { id: "viralScore",   label: "Viral score",    icon: <Zap     size={12} /> },
  { id: "subscribers",  label: "Subscribers",    icon: <Users   size={12} /> },
  { id: "referrals",    label: "Total referrals", icon: <Share2  size={12} /> },
];

function sortCards(
  cards: WaitlistLeaderboardCard[],
  by:    SortKey,
): WaitlistLeaderboardCard[] {
  return [...cards].sort((a, b) => {
    switch (by) {
      case "topReferrals": return b.topReferralCount - a.topReferralCount;
      case "viralScore": {
        const va = a.totalSubscribers > 0 ? a.totalReferrals / a.totalSubscribers : 0;
        const vb = b.totalSubscribers > 0 ? b.totalReferrals / b.totalSubscribers : 0;
        return vb - va;
      }
      case "subscribers":  return b.totalSubscribers - a.totalSubscribers;
      case "referrals":    return b.totalReferrals   - a.totalReferrals;
      default: return 0;
    }
  });
}

interface LeaderboardsClientProps {
  leaderboards: WaitlistLeaderboardCard[];
}

export function LeaderboardsClient({ leaderboards }: LeaderboardsClientProps) {
  const [search,  setSearch]  = useState("");
  const [sortBy,  setSortBy]  = useState<SortKey>("topReferrals");

  /* ── Derived list ───────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = [...leaderboards];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (lb) =>
          lb.waitlistName.toLowerCase().includes(q) ||
          lb.waitlistSlug.toLowerCase().includes(q),
      );
    }

    return sortCards(list, sortBy);
  }, [leaderboards, search, sortBy]);

  const hasFilters   = search.trim() !== "";
  const activeSortLabel = SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? "";

  return (
    <div className="flex flex-col gap-5">

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Search */}
        <div className="relative max-w-xs flex-1">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leaderboards…"
            className="h-9 border-zinc-200 dark:border-zinc-800 bg-card/60 pl-8 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-300 dark:focus-visible:border-zinc-600 focus-visible:ring-0"
          />
        </div>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-zinc-200 dark:border-zinc-800 bg-card/60 text-xs text-muted-foreground hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-muted/60 hover:text-foreground/90"
            >
              <ArrowDownUp size={12} />
              Sort: {activeSortLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 border-border/80 bg-background/95 backdrop-blur-xl"
          >
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={cn(
                  "cursor-pointer gap-2 text-xs",
                  sortBy === opt.id
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 focus:bg-indigo-500/10 focus:text-indigo-600"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60",
                )}
              >
                <span className={sortBy === opt.id ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground/60"}>
                  {opt.icon}
                </span>
                {opt.label}
                {sortBy === opt.id && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Grid ────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-4 py-24 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-card/60">
              <Trophy size={26} className="text-zinc-800" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {hasFilters
                  ? "No leaderboards match your search"
                  : "No leaderboards yet"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {hasFilters
                  ? "Try a different name or slug."
                  : "Create a waitlist to start tracking referrals."}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {filtered.map((lb, i) => (
              <LeaderboardWaitlistCard key={lb.waitlistId} data={lb} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result count ────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground/40">
          Showing {filtered.length} of {leaderboards.length}{" "}
          leaderboard{leaderboards.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}