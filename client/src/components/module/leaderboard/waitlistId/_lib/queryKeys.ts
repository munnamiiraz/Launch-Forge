import type { LeaderboardQueryParams } from "../_types";

/**
 * Centralized query key factory.
 *
 * All invalidations, prefetches, and subscriptions reference these keys
 * so a cache invalidation from one component automatically refreshes any
 * other component sharing the same key.
 *
 * Usage:
 *   queryClient.invalidateQueries({ queryKey: leaderboardKeys.entries(id, params) })
 */
export const leaderboardKeys = {
  /** Root namespace — invalidates everything for a waitlist */
  all: (waitlistId: string) =>
    ["leaderboard", waitlistId] as const,

  /** Waitlist metadata (name, slug, isOpen) */
  info: (waitlistId: string) =>
    ["leaderboard", waitlistId, "info"] as const,

  /** Paginated + filtered entry list */
  entries: (waitlistId: string, params: LeaderboardQueryParams) =>
    ["leaderboard", waitlistId, "entries", params] as const,

  /** Summary stats block */
  summary: (waitlistId: string) =>
    ["leaderboard", waitlistId, "summary"] as const,
} as const;

/** Default stale time — 30 s for leaderboard entries (real-time feel without hammering the API) */
export const LEADERBOARD_STALE_TIME = 30_000;

/** Background refetch interval when the page is focused */
export const LEADERBOARD_REFETCH_INTERVAL = 60_000;