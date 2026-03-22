import { z } from "zod";
import {
  SUBSCRIBER_PAGINATION,
  LEADERBOARD_CONFIG,
  SUBSCRIBER_SORT_FIELDS,
  SORT_ORDERS,
  SUBSCRIBER_DEFAULT_SORT,
} from "./subscriber.constants";

/* ── Shared param: :id (waitlist ID) ─────────────────────────────── */

export const waitlistIdParamSchema = z.object({
  id: z
    .string("Waitlist id param is required.")
    .cuid("Waitlist id must be a valid CUID."),
});

/* ── GET /api/waitlists/:id/subscribers ──────────────────────────── */

export const getSubscribersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : SUBSCRIBER_PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().int().min(1, "Page must be at least 1.")),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : SUBSCRIBER_PAGINATION.DEFAULT_LIMIT))
    .pipe(
      z.number()
        .int()
        .min(1, "Limit must be at least 1.")
        .max(
          SUBSCRIBER_PAGINATION.MAX_LIMIT,
          `Limit must not exceed ${SUBSCRIBER_PAGINATION.MAX_LIMIT}.`,
        ),
    ),

  search: z
    .string()
    .trim()
    .optional(),

  isConfirmed: z
    .string()
    .optional()
    .transform((v) => {
      if (v === "true")  return true;
      if (v === "false") return false;
      return undefined;
    }),

  sortBy: z
    .enum(SUBSCRIBER_SORT_FIELDS, {
      message: `sortBy must be one of: ${SUBSCRIBER_SORT_FIELDS.join(", ")}.`,
    })
    .default(SUBSCRIBER_DEFAULT_SORT.FIELD),

  sortOrder: z
    .enum(SORT_ORDERS, {
      message: "sortOrder must be 'asc' or 'desc'.",
    })
    .default(SUBSCRIBER_DEFAULT_SORT.ORDER),
});

/* ── GET /api/waitlists/:id/leaderboard ──────────────────────────── */

export const getLeaderboardQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : LEADERBOARD_CONFIG.DEFAULT_LIMIT))
    .pipe(
      z.number()
        .int()
        .min(1, "Limit must be at least 1.")
        .max(
          LEADERBOARD_CONFIG.MAX_LIMIT,
          `Limit must not exceed ${LEADERBOARD_CONFIG.MAX_LIMIT}.`,
        ),
    ),
});

export type WaitlistIdParamDto        = z.infer<typeof waitlistIdParamSchema>;
export type GetSubscribersQueryDto    = z.infer<typeof getSubscribersQuerySchema>;
export type GetLeaderboardQueryDto    = z.infer<typeof getLeaderboardQuerySchema>;