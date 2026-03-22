/**
 * Invite module — types and service payload shapes.
 *
 * An Invite is a lightweight record that encodes:
 *   - which waitlist you're inviting someone to
 *   - which subscriber sent the invite (createdById)
 *   - a short, unique invite code used in the shareable URL
 *
 * When a new user joins via an invite link:
 *   1. Their Subscriber record is created with referredById = invite.createdById
 *   2. The creator's referralsCount is incremented atomically
 *   3. The joiner receives their own unique referral link for further sharing
 *
 * This is the CORRECT data model because:
 *   - An invite maps 1:1 to a (subscriber, waitlist) pair
 *   - One subscriber can only have ONE active invite per waitlist
 *   - A single invite code can be used by MULTIPLE people (it's a link, not
 *     a single-use coupon — like a Discord invite link)
 *   - Every use of the invite credits the creator's referralsCount
 */

/* ── Service payload types ───────────────────────────────────────── */

/**
 * POST /api/invite
 * Create (or retrieve existing) invite link for a subscriber.
 */
export interface CreateInvitePayload {
  /** The waitlist being invited to */
  waitlistId: string;

  /** Subscriber ID of the person creating the invite.
   *  They must already be on the waitlist. */
  createdBySubscriberId: string;
}

/**
 * GET /api/invite/:inviteCode
 * Resolve an invite code to its metadata — used by the frontend
 * to render the waitlist page before the user fills in the join form.
 */
export interface GetInvitePayload {
  inviteCode: string;
}

/**
 * POST /api/invite/:inviteCode/join
 * A new user joins the waitlist through an invite link.
 */
export interface JoinViaInvitePayload {
  inviteCode: string;
  name:       string;
  email:      string;
}

/* ── Response shapes ─────────────────────────────────────────────── */

/**
 * Returned after creating an invite.
 * The subscriber shares inviteUrl to earn referral credits.
 */
export interface InviteCreatedResult {
  inviteCode:    string;
  inviteUrl:     string;

  /** The waitlist the invite is for */
  waitlist: {
    id:   string;
    name: string;
    slug: string;
  };

  /** Who created the invite (the subscriber who will get credited) */
  createdBy: {
    id:           string;
    name:         string;
    referralCode: string;
  };
}

/**
 * Returned when resolving an invite code (GET) — used by the
 * frontend to display waitlist info before the user joins.
 */
export interface InviteDetailsResult {
  inviteCode:       string;
  inviteUrl:        string;
  waitlist: {
    id:               string;
    name:             string;
    slug:             string;
    description:      string | null;
    logoUrl:          string | null;
    isOpen:           boolean;
    totalSubscribers: number;
  };
  createdBy: {
    /** Masked name: "Sarah K." — privacy safe */
    maskedName:    string;
    referralCount: number;
  };
}

/**
 * Returned after joining via invite.
 * Contains everything the success screen needs.
 */
export interface JoinViaInviteResult {
  /** Already on the list → true (idempotent) */
  alreadyJoined:  boolean;

  /** 1-based queue position */
  position:        number;
  totalInQueue:    number;

  /** The new subscriber's own referral link for further sharing */
  referralCode:    string;
  referralUrl:     string;

  /** The invite link they used (same inviteUrl, for display) */
  inviteUrl:       string;

  /** Waitlist context for the success screen */
  waitlist: {
    id:   string;
    name: string;
    slug: string;
  };
}

/* ── Internal DB row shape (not exported to client) ─────────────── */

/**
 * The shape we need when looking up an Invite from the DB.
 * Mapped to InviteRecord — a plain object, not a Prisma type, so
 * the service stays decoupled from generated client changes.
 *
 * NOTE: Invite is stored in the Subscriber table's referralCode field
 * for now — the invite code IS the referral code of the creating subscriber.
 *
 * This means:
 *   - No separate Invite table needed in the schema
 *   - inviteCode = subscriber.referralCode
 *   - inviteUrl = /invite/{subscriber.referralCode}
 *   - Joining via invite → referredById = subscriber.id
 *
 * This is intentional: the referralCode field is already globally unique,
 * has a DB index, and IS the canonical identifier for "this person's share link".
 * The /invite/ URL prefix simply gives it a better UX route than /ref/.
 */
export interface InviteRecord {
  id:             string;   // subscriber.id
  inviteCode:     string;   // subscriber.referralCode
  name:           string;   // subscriber.name
  referralsCount: number;   // subscriber.referralsCount
  waitlistId:     string;
  waitlist: {
    id:          string;
    name:        string;
    slug:        string;
    description: string | null;
    logoUrl:     string | null;
    isOpen:      boolean;
  };
}