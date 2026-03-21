import { z } from "zod";
import {
  PUBLIC_SUBSCRIBER_FIELD,
  REFERRAL,
} from "./public-waitlist.constants";
import { WAITLIST_SLUG } from "../waitlist/waitlist.constants";

/* ── URL param: :slug ────────────────────────────────────────────── */

export const publicWaitlistSlugParamSchema = z.object({
  slug: z
    .string("Waitlist slug is required.")
    .trim()
    .toLowerCase()
    .min(WAITLIST_SLUG.MIN_LENGTH, `Slug must be at least ${WAITLIST_SLUG.MIN_LENGTH} characters.`)
    .max(WAITLIST_SLUG.MAX_LENGTH, `Slug must not exceed ${WAITLIST_SLUG.MAX_LENGTH} characters.`)
    .regex(WAITLIST_SLUG.PATTERN, WAITLIST_SLUG.PATTERN_MSG),
});

/* ── POST /api/public/waitlist/:slug/join ────────────────────────── */

export const joinWaitlistSchema = z.object({
  name: z
    .string("Name is required.")
    .trim()
    .min(
      PUBLIC_SUBSCRIBER_FIELD.NAME_MIN,
      `Name must be at least ${PUBLIC_SUBSCRIBER_FIELD.NAME_MIN} characters.`,
    )
    .max(
      PUBLIC_SUBSCRIBER_FIELD.NAME_MAX,
      `Name must not exceed ${PUBLIC_SUBSCRIBER_FIELD.NAME_MAX} characters.`,
    ),

  email: z
    .string("Email address is required.")
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address.")
    .max(
      PUBLIC_SUBSCRIBER_FIELD.EMAIL_MAX,
      `Email must not exceed ${PUBLIC_SUBSCRIBER_FIELD.EMAIL_MAX} characters.`,
    ),

  /**
   * Optional referral code passed as ?ref=XXXXXXXX in the URL
   * or forwarded from the sign-up form as a hidden field.
   * Validated as exactly CODE_LENGTH alphanumeric characters.
   */
  referralCode: z
    .string()
    .trim()
    .toUpperCase()
    .length(
      REFERRAL.CODE_LENGTH,
      `Referral code must be exactly ${REFERRAL.CODE_LENGTH} characters.`,
    )
    .regex(
      /^[A-Z0-9]+$/,
      "Referral code may only contain uppercase letters and digits.",
    )
    .optional(),
});

export type PublicWaitlistSlugParamDto = z.infer<typeof publicWaitlistSlugParamSchema>;
export type JoinWaitlistDto            = z.infer<typeof joinWaitlistSchema>;