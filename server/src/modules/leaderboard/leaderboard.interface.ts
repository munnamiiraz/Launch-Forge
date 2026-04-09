import { Subscriber } from "../../generated/client";

/* ── Query inputs ────────────────────────────────────────────────── */

export interface GetLeaderboardQuery {
  page?:       number;
  limit?:      number;
  /** Filter to a specific tier */
  tier?:       LeaderboardTier;
  /** Only return entries whose name/email matches */
  search?:     string;
  /** "all" (default) | "confirmed" — only count confirmed referrals */
  countMode?:  ReferralCountMode;
}

export type LeaderboardTier    = "champion" | "top10" | "top25" | "rising" | "all";
export type ReferralCountMode  = "all" | "confirmed";

/* ── Service-layer payloads ──────────────────────────────────────── */

export interface GetLeaderboardPayload {
  waitlistId:       string;
  workspaceId:      string;
  requestingUserId: string;
  query:            GetLeaderboardQuery;
}

export interface GetLeaderboardPayloadWithSlug {
  waitlistSlug:     string;
  requestingUserId: string;
  query:            GetLeaderboardQuery;
}

export interface GetPublicLeaderboardPayload {
  waitlistSlug: string;
  query:       GetPublicLeaderboardQuery;
}

export interface GetPublicLeaderboardPayload {
  waitlistSlug: string;
  query:       GetPublicLeaderboardQuery;
}

export interface GetPublicLeaderboardQuery {
  page?:  number;
  limit?: number;
  tier?:  LeaderboardTier;
  search?: string;
}

export interface PaginatedPublicLeaderboard {
  data:    PublicLeaderboardEntry[];
  meta:    LeaderboardPaginationMeta;
  summary: LeaderboardSummary;
}

export interface PublicLeaderboardEntry {
  rank:           number;
  tier:           LeaderboardTier;
  id:             string;
  name:           string;
  email:          string;
  referralCode:  string;
  referralUrl:   string;
  directReferrals: number;
  chainReferrals:  number;
  sharePercent:    number;
  queuePosition:   number;
  isConfirmed:    boolean;
  joinedAt:       Date;
  referredBy:     any;
  referralPreview: any[];
}

/* ── Per-entry shapes ────────────────────────────────────────────── */

export interface LeaderboardEntry {
  /** 1-based global rank across the entire waitlist */
  rank:              number;
  /** Visual tier badge */
  tier:              LeaderboardTier;

  id:                string;
  name:              string;
  email:             string;
  referralCode:      string;
  referralUrl:       string;

  /** Total number of people this subscriber directly recruited */
  directReferrals:   number;
  /** Total referrals in their entire downstream chain (direct + indirect) */
  chainReferrals:    number;
  /** Percentage of all referrals on this waitlist this person is responsible for */
  sharePercent:      number;

  /** Subscriber's own queue position (by referralsCount DESC, createdAt ASC) */
  queuePosition:     number;

  isConfirmed:       boolean;
  joinedAt:          Date;

  /** The person who referred this subscriber, if any */
  referredBy:        ReferredByInfo | null;

  /** Up to 3 direct referrals shown as a preview chain */
  referralPreview:   ReferralPreviewEntry[];
}

/** Minimal leaderboard entry for /:waitlistSlug route */
export interface MinimalLeaderboardEntry {
  rank:            number;
  tier:             LeaderboardTier;
  id:              string;
  name:            string;
  email:           string;
  directReferrals: number;
  chainReferrals:  number;
  sharePercent:   number;
  queuePosition:  number;
}

export interface ReferredByInfo {
  id:            string;
  name:          string;
  email:         string;
  rank:          number | null;   // null if referrer has 0 referrals (not on leaderboard)
}

export interface ReferralPreviewEntry {
  id:        string;
  name:      string;
  joinedAt:  Date;
}

/* ── Summary stats returned alongside the page ───────────────────── */

export interface LeaderboardSummary {
  totalSubscribers:     number;
  totalReferrals:       number;
  /** Subscribers with at least 1 referral */
  activeReferrers:      number;
  /** Mean referrals per subscriber who has at least 1 referral */
  avgReferralsPerReferrer: number;
  /** Highest referral count on this waitlist */
  topReferralCount:     number;
  /** Subscriber who joined most recently (for "Latest" badge) */
  newestSubscriberAt:   Date | null;
}

/* ── Paginated response wrapper ──────────────────────────────────── */

export interface PaginatedLeaderboard {
  data:    LeaderboardEntry[];
  meta:    LeaderboardPaginationMeta;
  summary: LeaderboardSummary;
}

export interface LeaderboardPaginationMeta {
  total:           number;
  page:            number;
  limit:           number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

/* ── Internal DB row types (not exported to client) ─────────────── */

export type RawSubscriberRow = Pick<
  Subscriber,
  | "id"
  | "name"
  | "email"
  | "referralCode"
  | "referralsCount"
  | "referredById"
  | "isConfirmed"
  | "createdAt"
>;