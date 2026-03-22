import { randomBytes } from "crypto";
import { INVITE_CODE } from "./invite.constant";

/* ── Invite code generation ──────────────────────────────────────── */

/**
 * Generate a cryptographically random invite code.
 *
 * Uses the same unambiguous alphabet as the referral code generator
 * (no 0/O, 1/I/l confusion) so codes are easy to type if needed.
 *
 * Length 10 from a 32-char alphabet = 32^10 ≈ 1.1 quadrillion combos.
 * At 1 million new codes/day it would take ~3,000 years to saturate.
 *
 * Example output: "A3FX92KD9T"
 */
export function generateInviteCode(): string {
  const bytes = randomBytes(INVITE_CODE.LENGTH);
  return Array.from(bytes)
    .map((b) => INVITE_CODE.ALPHABET[b % INVITE_CODE.ALPHABET.length])
    .join("");
}

/* ── URL builders ────────────────────────────────────────────────── */

/**
 * Build the full shareable invite URL.
 *
 * Pattern: {FRONTEND_URL}/explore/{waitlistSlug}/{inviteCode}
 * Example: "https://launchforge.app/explore/my-waitlist/A3FX92KD9T"
 */
export function buildInviteUrl(waitlistSlug: string, inviteCode: string): string {
  const base =
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://launchforge.app";

  const normalisedBase = base.replace(/\/+$/, "");
  return `${normalisedBase}/explore/${waitlistSlug}/${inviteCode}`;
}

/**
 * Build a standalone referral URL for a subscriber's own share link.
 * Used in the JoinViaInviteResult so the new joiner can immediately
 * start referring others.
 *
 * Pattern: {FRONTEND_URL}/explore/{waitlistSlug}/{referralCode}
 * The invite code IS the subscriber's referralCode.
 */
export function buildReferralUrl(waitlistSlug: string, referralCode: string): string {
  return buildInviteUrl(waitlistSlug, referralCode);
}

/* ── Name masking ────────────────────────────────────────────────── */

/**
 * Mask a real name for public display on invite detail pages.
 *
 * "Sarah Kim"    → "Sarah K."
 * "Marcus"       → "Marcus"
 * "Ada Lovelace" → "Ada L."
 */
export function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${parts[0]} ${lastInitial}.`;
}

/* ── Position derivation ─────────────────────────────────────────── */

/**
 * Derive a 1-based queue position for a subscriber ID from an
 * already-sorted list of { id } objects.
 *
 * The canonical order is (referralsCount DESC, createdAt ASC).
 * Falls back to the last position if the ID isn't found (shouldn't happen
 * in practice but prevents a crash if called in a race condition).
 */
export function derivePosition(
  orderedSubscribers: { id: string }[],
  targetId: string,
): number {
  const idx = orderedSubscribers.findIndex((s) => s.id === targetId);
  return idx === -1 ? orderedSubscribers.length : idx + 1;
}
