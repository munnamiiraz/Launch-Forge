import { Subscriber } from "../../generated/client";

/* ── Query inputs ────────────────────────────────────────────────── */

export interface GetSubscribersQuery {
  page?:         number;
  limit?:        number;
  search?:       string;
  isConfirmed?:  boolean;
  sortBy?:       SubscriberSortField;
  sortOrder?:    SortOrder;
}

export type SubscriberSortField = "createdAt" | "referralsCount" | "name";
export type SortOrder           = "asc" | "desc";

export interface GetLeaderboardQuery {
  limit?: number;
}

/* ── Service-layer payloads ──────────────────────────────────────── */

export interface GetSubscribersPayload {
  waitlistId:        string;
  workspaceId:       string;
  requestingUserId:  string;
  query:             GetSubscribersQuery;
}

export interface GetLeaderboardPayload {
  waitlistId:        string;
  workspaceId:       string;
  requestingUserId:  string;
  query:             GetLeaderboardQuery;
}

/* ── Response shapes ─────────────────────────────────────────────── */

/**
 * Full subscriber row returned to workspace members (authenticated).
 * Includes email and real name — never exposed on public routes.
 */
export type SubscriberRow = Pick<
  Subscriber,
  | "id"
  | "name"
  | "email"
  | "referralCode"
  | "referralsCount"
  | "isConfirmed"
  | "createdAt"
> & {
  /** 1-based queue position derived from (referralsCount DESC, createdAt ASC) */
  position:          number;
  referredBy:        ReferredByInfo | null;
};

export interface ReferredByInfo {
  id:    string;
  name:  string;
  email: string;
}

export interface PaginatedSubscribers {
  data: SubscriberRow[];
  meta: SubscriberPaginationMeta;
}

export interface SubscriberPaginationMeta {
  total:            number;
  confirmed:        number;
  unconfirmed:      number;
  page:             number;
  limit:            number;
  totalPages:       number;
  hasNextPage:      boolean;
  hasPreviousPage:  boolean;
}

/**
 * Leaderboard entry — full detail for workspace members.
 * Unlike the public leaderboard, real name and email are included.
 */
export interface LeaderboardEntry {
  rank:           number;
  id:             string;
  name:           string;
  email:          string;
  referralCode:   string;
  referralsCount: number;
  /** Percentage share of total referrals on this waitlist */
  sharePercent:   number;
  joinedAt:       Date;
}

export interface LeaderboardResult {
  data:             LeaderboardEntry[];
  totalReferrals:   number;
  totalSubscribers: number;
}