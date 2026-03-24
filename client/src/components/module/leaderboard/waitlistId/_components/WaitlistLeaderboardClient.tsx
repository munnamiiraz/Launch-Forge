"use client";

import { useState, useCallback, useRef, useSyncExternalStore } from "react";
import { useQuery }     from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, AlertCircle, RefreshCw } from "lucide-react";

import { Card }   from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { TooltipProvider } from "@/src/components/ui/tooltip";
import { cn }     from "@/src/lib/utils";

import { LeaderboardToolbar }       from "./LeaderboardToolbar";
import { LeaderboardTableRow }      from "./LeaderboardTableRow";
import { LeaderboardPagination }    from "./LeaderboardPagination";
import { LeaderboardSummaryCards }  from "./LeaderboardSummaryCards";
import {
  leaderboardKeys,
  LEADERBOARD_REFETCH_INTERVAL,
} from "../_lib/queryKeys";
import { fetchLeaderboard } from "@/src/services/leaderboard/leaderboard.action";
import type {
  LeaderboardQueryParams,
  TierFilter,
  CountMode,
  LeaderboardResponse,
} from "../_types";

const PAGE_SIZE = 15;

interface WaitlistLeaderboardClientProps {
  waitlistId:       string;
  initialData:      LeaderboardResponse;
}

export function WaitlistLeaderboardClient({
  waitlistId,
  initialData,
}: WaitlistLeaderboardClientProps) {

  /* ── Query params state ─────────────────────────────────────── */
  const [params, setParams] = useState<LeaderboardQueryParams>({
    page:      1,
    limit:     PAGE_SIZE,
    tier:      "all",
    search:    "",
    countMode: "all",
  });

  const isHydrated = useHydrated();

  /* Debounce search to avoid firing a query on every keystroke */
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearch = useCallback((v: string) => {
    setParams((p) => ({ ...p, search: v, page: 1 }));
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(v), 280);
  }, []);

  const handleTier = useCallback((tier: TierFilter) => {
    setParams((p) => ({ ...p, tier, page: 1 }));
  }, []);

  const handleCountMode = useCallback((countMode: CountMode) => {
    setParams((p) => ({ ...p, countMode, page: 1 }));
  }, []);

  const handlePage = useCallback((page: number) => {
    setParams((p) => ({ ...p, page }));
    // Scroll to top of table
    document.getElementById("leaderboard-table")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* The live params used for the query key (search is debounced) */
  const liveParams: LeaderboardQueryParams = {
    ...params,
    search: debouncedSearch,
  };

  /* ── TanStack Query ─────────────────────────────────────────── */
  const {
    data,
    isFetching,
    isError,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey:     leaderboardKeys.entries(waitlistId, liveParams),
    queryFn:      () => fetchLeaderboard(waitlistId, liveParams),
    initialData:  liveParams.page === 1 &&
                  liveParams.tier === "all" &&
                  liveParams.search === "" &&
                  liveParams.countMode === "all"
                    ? initialData
                    : undefined,
    staleTime:    30_000,
    refetchInterval: LEADERBOARD_REFETCH_INTERVAL,
    placeholderData: (prev) => prev,   // keep previous page visible while loading next
  });

  const hydrationSafeIsFetching = isHydrated ? isFetching : false;
  const lastUpdated = isHydrated && dataUpdatedAt ? new Date(dataUpdatedAt) : null;
  const maxReferrals = data?.data?.[0]?.directReferrals ?? 1;

  /* ── Error state ────────────────────────────────────────────── */
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/8">
          <AlertCircle size={22} className="text-red-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground/80">Failed to load leaderboard</p>
          <p className="mt-0.5 text-xs text-muted-foreground/60">
            {(error as Error)?.message ?? "An unexpected error occurred."}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="gap-2 border-zinc-800 text-muted-foreground hover:border-zinc-700 hover:text-foreground/90"
        >
          <RefreshCw size={13} />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">

        {/* ── Summary stats ─────────────────────────────────────── */}
        {data?.summary && (
          <LeaderboardSummaryCards summary={data.summary} />
        )}

        {/* ── Table card ────────────────────────────────────────── */}
        <Card
          id="leaderboard-table"
          className="overflow-hidden border-border/80 bg-card/40"
        >
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />

          {/* Toolbar */}
          <div className="border-b border-border/60 bg-card/60 px-5 py-4">
            <LeaderboardToolbar
              search={params.search}
              onSearch={handleSearch}
              tier={params.tier}
              onTier={handleTier}
              countMode={params.countMode}
              onCountMode={handleCountMode}
              isFetching={hydrationSafeIsFetching}
              onRefetch={() => refetch()}
              totalCount={data?.meta?.total ?? 0}
              lastUpdated={lastUpdated}
            />
          </div>

          {/* Stale overlay — subtle opacity shift when fetching */}
          <div className={cn("transition-opacity duration-200", hydrationSafeIsFetching && "opacity-60")}>

            {/* Column headers */}
            <div className="hidden grid-cols-[36px_1fr_auto_auto_auto_auto_auto] gap-4 border-b border-border/60 bg-card/60 px-5 py-2.5 sm:grid">
              <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">#</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Referrer</p>
              <p className="hidden text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 sm:block">Tier</p>
              <p className="hidden w-32 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 md:block">Direct refs</p>
              <p className="hidden text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 lg:block">Chain</p>
              <p className="hidden text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 xl:block">Queue pos.</p>
              <div className="w-16" />
            </div>

            {/* Rows */}
            <AnimatePresence mode="wait">
              {!data || data.data.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 py-16 text-center"
                >
                  <Trophy size={32} className="text-zinc-800" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground/80">No referrers found</p>
                    <p className="text-xs text-muted-foreground/40">
                      {params.search || params.tier !== "all"
                        ? "Try adjusting your filters."
                        : "Share the waitlist to start building your leaderboard."}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`page-${params.page}-${params.tier}-${debouncedSearch}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {data.data.map((entry, i) => (
                    <LeaderboardTableRow
                      key={entry.id}
                      entry={entry}
                      index={i}
                      maxReferrals={maxReferrals}
                      isLast={i === data.data.length - 1}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="border-t border-border/60 bg-card/30 px-5 py-3.5">
              <LeaderboardPagination
                meta={data.meta}
                onPage={handlePage}
                disabled={hydrationSafeIsFetching}
              />
            </div>
          )}

          {/* Loading bar at bottom */}
          {hydrationSafeIsFetching && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ originX: 0 }}
              className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600"
            />
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
}

function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
