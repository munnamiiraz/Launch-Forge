import { z } from "zod";
import { LEADERBOARD_PAGINATION } from "./leaderboard.constants";

/* ── URL params ──────────────────────────────────────────────────── */

export const leaderboardParamSchema = z.object({
  id: z
    .string("Waitlist id is required.")
    .cuid("Waitlist id must be a valid CUID."),
});

/* ── GET /api/waitlists/:id/leaderboard/full ─────────────────────── */

export const getLeaderboardQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : LEADERBOARD_PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().int().min(1, "Page must be at least 1.")),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : LEADERBOARD_PAGINATION.DEFAULT_LIMIT))
    .pipe(
      z.number()
        .int()
        .min(1, "Limit must be at least 1.")
        .max(
          LEADERBOARD_PAGINATION.MAX_LIMIT,
          `Limit must not exceed ${LEADERBOARD_PAGINATION.MAX_LIMIT}.`,
        ),
    ),

  tier: z
    .enum(["champion", "top10", "top25", "rising", "all"] as const, {
      message: "tier must be one of: champion, top10, top25, rising, all.",
    })
    .default("all"),

  search: z
    .string()
    .trim()
    .optional(),

  countMode: z
    .enum(["all", "confirmed"] as const, {
      message: "countMode must be 'all' or 'confirmed'.",
    })
    .default("all"),
});

/* ── GET /api/leaderboard/:waitlistSlug (public) ─────────────────── */

export const getPublicLeaderboardQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(v => (v ? parseInt(v, 10) : LEADERBOARD_PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().int().min(1, "Page must be at least 1.")),

  limit: z
    .string()
    .optional()
    .transform(v => (v ? parseInt(v, 10) : LEADERBOARD_PAGINATION.DEFAULT_LIMIT))
    .pipe(
      z.number()
        .int()
        .min(1, "Limit must be at least 1.")
        .max(
          LEADERBOARD_PAGINATION.MAX_LIMIT,
          `Limit must not exceed ${LEADERBOARD_PAGINATION.MAX_LIMIT}.`,
        ),
    ),

  tier: z
    .enum(["champion", "top10", "top25", "rising", "all"] as const, {
      message: "tier must be one of: champion, top10, top25, rising, all.",
    })
    .default("all"),

  search: z.string().trim().optional(),

  // countMode intentionally excluded from the public surface
});

export const publicLeaderboardParamSchema = z.object({
  waitlistSlug: z
    .string("Waitlist slug is required.")
    .min(1, "Waitlist slug must not be empty."),
});

export type GetPublicLeaderboardQueryDto  = z.infer<typeof getPublicLeaderboardQuerySchema>;
export type PublicLeaderboardParamDto     = z.infer<typeof publicLeaderboardParamSchema>;

export type LeaderboardParamDto    = z.infer<typeof leaderboardParamSchema>;
export type GetLeaderboardQueryDto = z.infer<typeof getLeaderboardQuerySchema>;
