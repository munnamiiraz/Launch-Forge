"use client";

import { motion } from "framer-motion";
import {
  Search, RefreshCw, Users,
  CheckCircle2, Layers, Star,
} from "lucide-react";

import { Input }    from "@/src/components/ui/input";
import { Button }   from "@/src/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";
import type { TierFilter, CountMode } from "../_types";

/* ── Tier tab config ─────────────────────────────────────────────── */

interface TierTabDef {
  id:    TierFilter;
  label: string;
  icon:  React.ReactNode;
}

const TIER_TABS: TierTabDef[] = [
  { id: "all",      label: "All",      icon: <Layers size={12} />  },
  { id: "champion", label: "Champion", icon: <>🥇</>               },
  { id: "top10",    label: "Top 10",   icon: <>🥈</>               },
  { id: "top25",    label: "Top 25",   icon: <>🥉</>               },
  { id: "rising",   label: "Rising",   icon: <Star  size={12} />   },
];

interface LeaderboardToolbarProps {
  search:          string;
  onSearch:        (v: string) => void;
  tier:            TierFilter;
  onTier:          (t: TierFilter) => void;
  countMode:       CountMode;
  onCountMode:     (m: CountMode) => void;
  isFetching:      boolean;
  onRefetch:       () => void;
  totalCount:      number;
  lastUpdated:     Date | null;
}

export function LeaderboardToolbar({
  search, onSearch,
  tier, onTier,
  countMode, onCountMode,
  isFetching, onRefetch,
  totalCount, lastUpdated,
}: LeaderboardToolbarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-3">

        {/* Row 1: tier tabs + right controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          {/* Tier tabs */}
          <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 dark:border-border/80 bg-muted/40 dark:bg-card/40 p-1">
            {TIER_TABS.map((tab) => {
              const active = tier === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTier(tab.id)}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                    active ? "text-foreground" : "text-muted-foreground/80 hover:text-foreground/80",
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="tier-active"
                      className="absolute inset-0 rounded-md bg-white dark:bg-zinc-800 shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {tab.icon}
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: countMode + refetch */}
          <div className="flex items-center gap-2">
            {/* Count mode toggle */}
            <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 dark:border-border/80 bg-muted/40 dark:bg-card/40 p-1">
              {(["all", "confirmed"] as CountMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => onCountMode(m)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-all duration-150",
                    countMode === m
                      ? "bg-white dark:bg-zinc-800 font-medium text-foreground/90 shadow-sm"
                      : "text-muted-foreground/60 hover:text-muted-foreground",
                  )}
                >
                  {m === "confirmed"
                    ? <><CheckCircle2 size={11} />Confirmed</>
                    : <><Users        size={11} />All</>
                  }
                </button>
              ))}
            </div>

            {/* Refetch */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRefetch}
                  disabled={isFetching}
                  className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-border/80 bg-muted/20 dark:bg-card/40 text-muted-foreground/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-muted/60 hover:text-foreground/80 disabled:opacity-40"
                >
                  <RefreshCw
                    size={13}
                    className={cn(isFetching && "animate-spin")}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="border-zinc-800 bg-zinc-900 text-xs text-foreground/80">
                {isFetching ? "Refreshing…" : "Refresh leaderboard"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Row 2: search + meta */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative max-w-xs flex-1">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
            />
            <Input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="h-8 border-zinc-200 dark:border-zinc-800 bg-card/60 pl-8 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-300 dark:focus-visible:border-zinc-600 focus-visible:ring-0"
            />
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
            <span>
              <span className="font-semibold text-muted-foreground">{totalCount}</span>{" "}
              {totalCount === 1 ? "result" : "results"}
            </span>
            {lastUpdated && (
              <>
                <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
                <span className="flex items-center gap-1">
                  {isFetching
                    ? <span className="text-indigo-400">Updating…</span>
                    : <>Updated {formatRelative(lastUpdated)}</>
                  }
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function formatRelative(date: Date): string {
  const diff = Math.round((Date.now() - date.getTime()) / 1000);
  if (diff < 5)  return "just now";
  if (diff < 60) return `${diff}s ago`;
  return `${Math.round(diff / 60)}m ago`;
}
