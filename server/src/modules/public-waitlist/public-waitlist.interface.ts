import { Waitlist, Subscriber } from "../../generated/client";

/* ── Service-layer payloads ──────────────────────────────────────── */

export interface GetPublicWaitlistPayload {
  slug: string;
}

export interface JoinWaitlistPayload {
  slug:        string;
  name:        string;
  email:       string;
  /** Optional referral code from the URL: ?ref=XXXXXXXX */
  referralCode?: string;
}

export interface GetSubscriberPositionPayload {
  slug: string;
  email: string;
}

export interface SubscriberPositionResult {
  position: number;
  referralCount: number;
  referralUrl: string;
  totalInQueue: number;
}

/* ── Response shapes ─────────────────────────────────────────────── */

/**
 * Public-safe waitlist data — no internal IDs, no workspaceId,
 * no theme blob with any sensitive config. Only what the
 * sign-up page needs to render.
 */
export interface PublicWaitlistPageData {
  /** Waitlist ID for fetching related data like prizes */
  id:               string;
  name:             string;
  slug:             string;
  description:      string | null;
  logoUrl:          string | null;
  isOpen:           boolean;
  /** End date of the waitlist (when it closes) */
  endDate:          string | null;
  totalSubscribers: number;
  /** Top 5 referrers for the public leaderboard widget */
  topReferrers:     PublicLeaderboardEntry[];
}

export interface PublicLeaderboardEntry {
  /** Masked name: "Sarah K." — first name + last initial only */
  maskedName:    string;
  referralCount: number;
  /** 1-based rank */
  rank:          number;
}

/**
 * Returned after a successful join.
 * Contains the referral link so the user can start sharing immediately.
 */
export interface JoinConfirmation {
  /** Queue position (1-based, derived from ORDER BY referralsCount DESC, createdAt ASC) */
  position:        number;
  referralCode:    string;
  referralUrl:     string;
  totalInQueue:    number;
  /** Whether this email was already on the list (idempotent re-join) */
  alreadyJoined:   boolean;
}

/* ── Internal query result (not exported to client) ─────────────── */

export type SubscriberRow = Pick<
  Subscriber,
  | "id"
  | "waitlistId"
  | "name"
  | "email"
  | "referralCode"
  | "referredById"
  | "referralsCount"
  | "isConfirmed"
  | "createdAt"
>;