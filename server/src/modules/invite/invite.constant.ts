/* ── Response messages ───────────────────────────────────────────── */

export const INVITE_MESSAGES = {
  /* Success */
  CREATED:          "Invite link generated successfully.",
  FETCHED:          "Invite details fetched successfully.",
  JOINED:           "You have successfully joined the waitlist!",
  ALREADY_JOINED:   "You are already on this waitlist. Here is your existing referral link.",

  /* Errors */
  NOT_FOUND:        "This invite link is invalid or no longer exists.",
  WAITLIST_CLOSED:  "This waitlist is no longer accepting new signups.",
  WAITLIST_NOT_FOUND: "The waitlist associated with this invite no longer exists.",
  SUBSCRIBER_NOT_FOUND:
    "You must be on this waitlist to generate an invite link.",
  UNAUTHORIZED:
    "You are not a member of this workspace.",

  /* Fraud / edge cases */
  SELF_INVITE:
    "You cannot join a waitlist through your own invite link.",
} as const;

/* ── Invite code config ──────────────────────────────────────────── */

export const INVITE_CODE = {
  /**
   * Length of the generated invite code.
   * 10 chars from a 32-char alphabet → ~1 quadrillion combinations.
   * Keeps URLs short while making brute-force infeasible.
   */
  LENGTH: 10,

  /**
   * Human-readable alphabet — removes ambiguous chars (0/O, 1/I/l).
   * Same alphabet used by the existing referral code generator.
   */
  ALPHABET: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",

  /**
   * How many collision-retry attempts before we give up.
   * Probability of needing even one retry is negligible at this length.
   */
  MAX_RETRIES: 5,
} as const;

/* ── Invite URL config ───────────────────────────────────────────── */

export const INVITE_URL = {
  /**
   * Base of the invite URL.
   * Full URL pattern: {BASE}/{inviteCode}
   *
   * e.g. https://launchforge.app/invite/A3FX92KD9T
   *
   * This is separate from the referral URL (/ref/{code}) so invite links
   * and standalone referral links remain independently routable.
   */
  BASE: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/invite`
    : "https://launchforge.app/invite",
} as const;

/* ── Pagination (for future invite history endpoint) ─────────────── */

export const INVITE_PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
} as const;

/* ── Join field constraints ──────────────────────────────────────── */

export const INVITE_JOIN_FIELD = {
  NAME_MIN:  2,
  NAME_MAX:  80,
  EMAIL_MAX: 254,
} as const;