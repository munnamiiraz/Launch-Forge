/* ── Response messages ───────────────────────────────────────────── */

export const PUBLIC_WAITLIST_MESSAGES = {
  PAGE_FETCHED:      "Waitlist page fetched successfully.",
  JOINED:            "You have successfully joined the waitlist!",
  ALREADY_JOINED:    "You are already on this waitlist.",
  NOT_FOUND:         "This waitlist does not exist or is no longer available.",
  CLOSED:            "This waitlist is currently closed to new signups.",
  INVALID_REFERRAL:  "The referral code provided is invalid or has expired.",
} as const;

/* ── Referral config ─────────────────────────────────────────────── */

export const REFERRAL = {
  /** Length of the auto-generated referral code (nanoid-style) */
  CODE_LENGTH: 8,

  /** How many characters of the code to use in the public URL */
  URL_PARAM:   "ref",

  /**
   * Base URL template for referral links.
   * In production this comes from env; this is the fallback pattern.
   */
  BASE_URL:    "https://launchforge.app/ref",
} as const;

/* ── Public leaderboard ──────────────────────────────────────────── */

export const LEADERBOARD = {
  /** Maximum number of top referrers shown on the public page */
  TOP_N: 5,
} as const;

/* ── Subscriber field constraints ────────────────────────────────── */

export const PUBLIC_SUBSCRIBER_FIELD = {
  NAME_MIN:  2,
  NAME_MAX:  80,
  EMAIL_MAX: 254,   // RFC 5321 maximum
} as const;

/* ── Rate-limit hint (enforced at infra level, constant here for docs) */

export const JOIN_RATE_LIMIT = {
  /**
   * Maximum join attempts per IP per hour.
   * Actual enforcement is done by your reverse proxy / rate-limit middleware.
   * This constant is referenced in error messages so the value is one source of truth.
   */
  PER_HOUR: 10,
} as const;