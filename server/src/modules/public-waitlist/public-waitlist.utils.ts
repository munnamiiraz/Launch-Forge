import { randomBytes } from "crypto";
import { REFERRAL, LEADERBOARD } from "./public-waitlist.constants";
import { SubscriberRow, PublicLeaderboardEntry } from "./public-waitlist.interface";

/**
 * Generate a cryptographically random referral code.
 * Produces CODE_LENGTH uppercase alphanumeric characters.
 * Uses Node's crypto module — no external dependency needed.
 *
 * Example output: "A3FX92KD"
 */
export function generateReferralCode(): string {
  const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // removed ambiguous chars (0, O, 1, I)
  const bytes    = randomBytes(REFERRAL.CODE_LENGTH);

  return Array.from(bytes)
    .map((b) => ALPHABET[b % ALPHABET.length])
    .join("");
}

/**
 * Build the full shareable referral URL for a given code.
 *
 * Pattern: {FRONTEND_URL}/explore/{waitlistSlug}/{referralCode}
 * Example: "https://launchforge.app/explore/my-waitlist/A3FX92KD"
 */
export function buildReferralUrl(waitlistSlug: string, referralCode: string): string {
  const base =
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://launchforge.app";

  const normalisedBase = base.replace(/\/+$/, "");
  return `${normalisedBase}/explore/${waitlistSlug}/${referralCode}`;
}

/**
 * Mask a subscriber's real name for the public leaderboard.
 * Preserves the first name and reduces the last name to its initial.
 *
 * "Sarah Kim"    → "Sarah K."
 * "Marcus"       → "Marcus"         (single name — returned as-is)
 * "Ada Lovelace" → "Ada L."
 */
export function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

/**
 * Derive a subscriber's 1-based queue position from the full ordered list.
 * Position = index in the list sorted by (referralsCount DESC, createdAt ASC).
 *
 * This is intentionally calculated in-process after the DB query so the service
 * owns the ordering logic rather than relying on a fragile DB row_number().
 */
export function derivePosition(
  orderedSubscribers: Pick<SubscriberRow, "id">[],
  targetId: string,
): number {
  const idx = orderedSubscribers.findIndex((s) => s.id === targetId);
  return idx === -1 ? orderedSubscribers.length : idx + 1; // fallback: last position
}

/**
 * Build the top-N leaderboard entries from a list of subscribers
 * already sorted by (referralsCount DESC).
 * Filters out entries with zero referrals to avoid a meaningless leaderboard.
 */
export function buildLeaderboard(
  subscribers: Pick<SubscriberRow, "id" | "name" | "referralsCount">[],
): PublicLeaderboardEntry[] {
  return subscribers
    .filter((s) => s.referralsCount > 0)
    .slice(0, LEADERBOARD.TOP_N)
    .map((s, i) => ({
      maskedName:    maskName(s.name),
      referralCount: s.referralsCount,
      rank:          i + 1,
    }));
}

/**
 * Resolve a referrer subscriber ID from a referral code.
 * Returns null when no code is provided so the service can branch cleanly.
 */
export function resolveReferrerId(
  referrers: Pick<SubscriberRow, "id" | "referralCode">[],
  referralCode: string | undefined,
): string | null {
  if (!referralCode) return null;
  return referrers.find((r) => r.referralCode === referralCode)?.id ?? null;
}
