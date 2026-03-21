import type { LeaderboardTier } from "../../_types";

/* ─────────────────────────────────────────────────────────────────
   Full leaderboard entry — richer than the summary TopReferrer
   ──────────────────────────────────────────────────────────────── */

export interface LeaderboardEntry {
  rank:            number;
  tier:            LeaderboardTier;
  id:              string;
  name:            string;
  email:           string;
  referralCode:    string;
  referralUrl:     string;
  directReferrals: number;
  chainReferrals:  number;
  sharePercent:    number;
  queuePosition:   number;
  isConfirmed:     boolean;
  joinedAt:        string;
  referredBy:      ReferredByInfo | null;
  referralPreview: ReferralPreviewEntry[];
}

export interface ReferredByInfo {
  id:    string;
  name:  string;
  email: string;
  rank:  number | null;
}

export interface ReferralPreviewEntry {
  id:       string;
  name:     string;
  joinedAt: string;
}

export interface LeaderboardSummary {
  totalSubscribers:       number;
  totalReferrals:         number;
  activeReferrers:        number;
  avgReferralsPerReferrer: number;
  topReferralCount:       number;
  newestSubscriberAt:     string | null;
}

export interface LeaderboardPaginationMeta {
  total:          number;
  page:           number;
  limit:          number;
  totalPages:     number;
  hasNextPage:    boolean;
  hasPreviousPage: boolean;
}

export interface LeaderboardResponse {
  data:    LeaderboardEntry[];
  meta:    LeaderboardPaginationMeta;
  summary: LeaderboardSummary;
}

/* ─────────────────────────────────────────────────────────────────
   Waitlist info for the page header
   ──────────────────────────────────────────────────────────────── */

export interface WaitlistInfo {
  id:          string;
  workspaceId: string; // Parent ID needed for leaderboard routing
  name:        string;
  slug:        string;
  isOpen:      boolean;
  description: string | null;
}

/* ─────────────────────────────────────────────────────────────────
   Query params — matches the backend API exactly
   ──────────────────────────────────────────────────────────────── */

export type TierFilter   = LeaderboardTier | "all";
export type CountMode    = "all" | "confirmed";

export interface LeaderboardQueryParams {
  page:      number;
  limit:     number;
  tier:      TierFilter;
  search:    string;
  countMode: CountMode;
}