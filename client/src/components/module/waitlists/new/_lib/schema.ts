import { z } from "zod";
import { FIELD_LIMITS } from "../_types";

export const createWaitlistFormSchema = z.object({
  name: z
    .string("Waitlist name is required.")
    .trim()
    .min(FIELD_LIMITS.NAME_MIN, `Name must be at least ${FIELD_LIMITS.NAME_MIN} characters.`)
    .max(FIELD_LIMITS.NAME_MAX, `Name must not exceed ${FIELD_LIMITS.NAME_MAX} characters.`),

  slug: z
    .string("Slug is required.")
    .trim()
    .toLowerCase()
    .min(FIELD_LIMITS.SLUG_MIN, `Slug must be at least ${FIELD_LIMITS.SLUG_MIN} characters.`)
    .max(FIELD_LIMITS.SLUG_MAX, `Slug must not exceed ${FIELD_LIMITS.SLUG_MAX} characters.`)
    .regex(
      FIELD_LIMITS.SLUG_PATTERN,
      "Slug may only contain lowercase letters, numbers, and hyphens (e.g. my-waitlist).",
    ),

  description: z
    .string()
    .trim()
    .max(
      FIELD_LIMITS.DESCRIPTION_MAX,
      `Description must not exceed ${FIELD_LIMITS.DESCRIPTION_MAX} characters.`,
    )
    .optional()
    .or(z.literal("")),

  isOpen: z.boolean().default(true),

  endDate: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type CreateWaitlistFormSchema = z.infer<typeof createWaitlistFormSchema>;
