/* ── Response messages ───────────────────────────────────────────── */

export const LEADERBOARD_MESSAGES = {
  FETCHED:      "Leaderboard fetched successfully.",
  UNAUTHORIZED: "You are not a member of this workspace.",
  NOT_FOUND:    "Waitlist not found or does not belong to this workspace.",
} as const;

/* ── Tier definitions ────────────────────────────────────────────── */

/**
 * Rank thresholds for visual tier badges.
 *
 * "champion" → rank 1 only            (🥇 gold)
 * "top10"    → rank 2–10              (🥈 silver)
 * "top25"    → rank 11–25             (🥉 bronze)
 * "rising"   → rank 26+ with > 0 refs (✨ rising star)
 * "all"      — not a real tier, used as a filter-all query value only
 */
export const LEADERBOARD_TIERS = {
  CHAMPION_RANK: 1,
  TOP10_MAX:     10,
  TOP25_MAX:     25,
} as const;

/* ── Pagination ──────────────────────────────────────────────────── */

export const LEADERBOARD_PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
} as const;

/* ── Referral chain ──────────────────────────────────────────────── */

export const REFERRAL_CHAIN = {
  /** Max direct referral previews attached to each entry */
  PREVIEW_LIMIT: 3,

  /**
   * Maximum depth we traverse for chainReferrals count.
   * Prevents runaway recursion on adversarial data.
   * 4 hops = great-grandchild of a subscriber.
   */
  MAX_DEPTH: 4,
} as const;

/* ── Referral URL ────────────────────────────────────────────────── */

/* ── Tier filter — maps query tier values to rank range predicates ── */

export type TierRankRange = { min: number; max: number | null };

export const TIER_RANK_RANGES: Record<string, TierRankRange> = {
  champion: { min: 1,  max: 1    },
  top10:    { min: 1,  max: 10   },
  top25:    { min: 1,  max: 25   },
  rising:   { min: 26, max: null },
  all:      { min: 1,  max: null },
} as const;

