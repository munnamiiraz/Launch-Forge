import { z } from "zod";
import { INVITE_JOIN_FIELD } from "./invite.constant";

/* ── Shared param: :inviteCode ───────────────────────────────────── */

export const inviteCodeParamSchema = z.object({
  inviteCode: z
    .string("inviteCode param is required.")
    .min(6,  "Invalid invite code.")
    .max(20, "Invalid invite code.")
    .regex(/^[A-Z0-9]+$/, "Invite code must contain only uppercase letters and digits."),
});

/* ── POST /api/invite ────────────────────────────────────────────── */

export const createInviteSchema = z.object({
  waitlistId: z
    .string("waitlistId is required.")
    .cuid("waitlistId must be a valid CUID."),

  /**
   * The subscriber who is creating the invite.
   * This is the person who will be credited for every join that uses this link.
   *
   * Frontend flow:
   *   1. User is on the waitlist (they joined previously)
   *   2. They click "Get my invite link"
   *   3. Frontend sends their subscriberId so we can retrieve/create the invite
   */
  subscriberId: z
    .string("subscriberId is required.")
    .cuid("subscriberId must be a valid CUID."),
});

/* ── POST /api/invite/:inviteCode/join ───────────────────────────── */

export const joinViaInviteSchema = z.object({
  name: z
    .string("Name is required.")
    .trim()
    .min(
      INVITE_JOIN_FIELD.NAME_MIN,
      `Name must be at least ${INVITE_JOIN_FIELD.NAME_MIN} characters.`,
    )
    .max(
      INVITE_JOIN_FIELD.NAME_MAX,
      `Name must not exceed ${INVITE_JOIN_FIELD.NAME_MAX} characters.`,
    ),

  email: z
    .string("Email is required.")
    .trim()
    .toLowerCase()
    .email("Must be a valid email address.")
    .max(
      INVITE_JOIN_FIELD.EMAIL_MAX,
      `Email must not exceed ${INVITE_JOIN_FIELD.EMAIL_MAX} characters.`,
    ),
});

/* ── Inferred DTOs ───────────────────────────────────────────────── */

export type InviteCodeParamDto  = z.infer<typeof inviteCodeParamSchema>;
export type CreateInviteDto     = z.infer<typeof createInviteSchema>;
export type JoinViaInviteDto    = z.infer<typeof joinViaInviteSchema>;