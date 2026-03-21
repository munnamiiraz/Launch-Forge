import { z } from "zod";
import {
  PRIZE_FIELD,
  PRIZE_TYPES,
  PRIZE_STATUSES,
} from "./pricemoney.constant";

/* ─────────────────────────────────────────────────────────────────
   Shared param schemas
   ──────────────────────────────────────────────────────────────── */

export const prizeParamSchema = z.object({
  id: z
    .string("Prize ID is required.")
    .cuid("Prize ID must be a valid CUID."),
});

export const waitlistIdParamSchema = z.object({
  waitlistId: z
    .string("Waitlist ID is required.")
    .cuid("Waitlist ID must be a valid CUID."),
});

/* ─────────────────────────────────────────────────────────────────
   Reusable rank-range refinement
   ──────────────────────────────────────────────────────────────── */

const rankRangeRefinement = (data: { rankFrom: number; rankTo: number }) =>
  data.rankFrom <= data.rankTo;

const rankRangeError = {
  message: "rankFrom must be less than or equal to rankTo.",
  path:    ["rankFrom"],
};

/* ─────────────────────────────────────────────────────────────────
   POST /api/prizes
   ──────────────────────────────────────────────────────────────── */

export const createPrizeSchema = z
  .object({
    waitlistId: z
      .string("Waitlist ID is required.")
      .cuid("Waitlist ID must be a valid CUID."),

    workspaceId: z
      .string("Workspace ID is required.")
      .cuid("Workspace ID must be a valid CUID."),

    title: z
      .string("Title is required.")
      .trim()
      .min(PRIZE_FIELD.TITLE_MIN, `Title must be at least ${PRIZE_FIELD.TITLE_MIN} characters.`)
      .max(PRIZE_FIELD.TITLE_MAX, `Title must not exceed ${PRIZE_FIELD.TITLE_MAX} characters.`),

    description: z
      .string()
      .trim()
      .max(PRIZE_FIELD.DESCRIPTION_MAX, `Description must not exceed ${PRIZE_FIELD.DESCRIPTION_MAX} characters.`)
      .optional(),

    prizeType: z.enum(PRIZE_TYPES, `prizeType must be one of: ${PRIZE_TYPES.join(", ")}.`),

    value: z
      .number()
      .positive("value must be a positive number.")
      .max(PRIZE_FIELD.VALUE_MAX, `value must not exceed ${PRIZE_FIELD.VALUE_MAX}.`)
      .optional(),

    currency: z
      .string()
      .trim()
      .toUpperCase()
      .length(PRIZE_FIELD.CURRENCY_LENGTH, "currency must be a 3-character ISO 4217 code (e.g. USD).")
      .optional(),

    rankFrom: z
      .number("rankFrom is required.")
      .int("rankFrom must be a whole number.")
      .min(PRIZE_FIELD.RANK_MIN, `rankFrom must be at least ${PRIZE_FIELD.RANK_MIN}.`)
      .max(PRIZE_FIELD.RANK_MAX, `rankFrom must not exceed ${PRIZE_FIELD.RANK_MAX}.`),

    rankTo: z
      .number("rankTo is required.")
      .int("rankTo must be a whole number.")
      .min(PRIZE_FIELD.RANK_MIN, `rankTo must be at least ${PRIZE_FIELD.RANK_MIN}.`)
      .max(PRIZE_FIELD.RANK_MAX, `rankTo must not exceed ${PRIZE_FIELD.RANK_MAX}.`),

    imageUrl: z
      .string()
      .trim()
      .url("imageUrl must be a valid URL.")
      .optional(),

    expiresAt: z
      .string()
      .datetime({ message: "expiresAt must be a valid ISO-8601 datetime string." })
      .transform((v) => new Date(v))
      .refine((d) => d > new Date(), "expiresAt must be a future date.")
      .optional(),
  })
  .refine(rankRangeRefinement, rankRangeError);

/* ─────────────────────────────────────────────────────────────────
   PATCH /api/prizes/:id
   ──────────────────────────────────────────────────────────────── */

export const updatePrizeSchema = z
  .object({
    workspaceId: z
      .string("Workspace ID is required.")
      .cuid("Workspace ID must be a valid CUID."),

    waitlistId: z
      .string("Waitlist ID is required.")
      .cuid("Waitlist ID must be a valid CUID."),

    title: z
      .string()
      .trim()
      .min(PRIZE_FIELD.TITLE_MIN, `Title must be at least ${PRIZE_FIELD.TITLE_MIN} characters.`)
      .max(PRIZE_FIELD.TITLE_MAX, `Title must not exceed ${PRIZE_FIELD.TITLE_MAX} characters.`)
      .optional(),

    description: z
      .string()
      .trim()
      .max(PRIZE_FIELD.DESCRIPTION_MAX, `Description must not exceed ${PRIZE_FIELD.DESCRIPTION_MAX} characters.`)
      .nullable()
      .optional(),

    prizeType: z
      .enum(PRIZE_TYPES, `prizeType must be one of: ${PRIZE_TYPES.join(", ")}.`)
      .optional(),

    value: z
      .number()
      .positive("value must be a positive number.")
      .max(PRIZE_FIELD.VALUE_MAX)
      .nullable()
      .optional(),

    currency: z
      .string()
      .trim()
      .toUpperCase()
      .length(PRIZE_FIELD.CURRENCY_LENGTH, "currency must be a 3-character ISO 4217 code.")
      .nullable()
      .optional(),

    rankFrom: z
      .number()
      .int("rankFrom must be a whole number.")
      .min(PRIZE_FIELD.RANK_MIN)
      .max(PRIZE_FIELD.RANK_MAX)
      .optional(),

    rankTo: z
      .number()
      .int("rankTo must be a whole number.")
      .min(PRIZE_FIELD.RANK_MIN)
      .max(PRIZE_FIELD.RANK_MAX)
      .optional(),

    imageUrl: z
      .string()
      .trim()
      .url("imageUrl must be a valid URL.")
      .nullable()
      .optional(),

    expiresAt: z
      .string()
      .datetime({ message: "expiresAt must be a valid ISO-8601 datetime string." })
      .transform((v) => new Date(v))
      .nullable()
      .optional(),

    status: z
      .enum(PRIZE_STATUSES, `status must be one of: ${PRIZE_STATUSES.join(", ")}.`)
      .optional(),
  })
  .refine(
    (data) => {
      if (data.rankFrom !== undefined && data.rankTo !== undefined) {
        return data.rankFrom <= data.rankTo;
      }
      return true;   // only validate if BOTH are provided simultaneously
    },
    rankRangeError,
  )
  .refine(
    (data) => {
      const updateFields = Object.keys(data).filter(
        (k) => k !== "workspaceId" && k !== "waitlistId",
      );
      return updateFields.length > 0;
    },
    { message: "At least one field must be provided to update." },
  );

/* ─────────────────────────────────────────────────────────────────
   Inferred DTOs
   ──────────────────────────────────────────────────────────────── */

export type CreatePrizeDto = z.infer<typeof createPrizeSchema>;
export type UpdatePrizeDto = z.infer<typeof updatePrizeSchema>;