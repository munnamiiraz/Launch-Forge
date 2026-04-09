import { z } from "zod";
import { EXPLORE_PAGINATION, EXPLORE_SORT_OPTIONS } from "./explore.constant";

/* ── GET /api/explore/waitlists ──────────────────────────────────── */

export const exploreQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : EXPLORE_PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().int().min(1, "Page must be at least 1.")),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : EXPLORE_PAGINATION.DEFAULT_LIMIT))
    .pipe(
      z.number().int()
        .min(1,  "Limit must be at least 1.")
        .max(EXPLORE_PAGINATION.MAX_LIMIT, `Limit must not exceed ${EXPLORE_PAGINATION.MAX_LIMIT}.`),
    ),

  search: z
    .string()
    .trim()
    .max(100, "Search term must not exceed 100 characters.")
    .optional(),

  sort: z
    .enum(EXPLORE_SORT_OPTIONS, `sort must be one of: ${EXPLORE_SORT_OPTIONS.join(", ")}.`)
    .optional()
    .default("trending"),

  openOnly: z
    .string()
    .optional()
    .transform((v) => v === "true")
    .pipe(z.boolean()),

  prizesOnly: z
    .string()
    .optional()
    .transform((v) => v === "true")
    .pipe(z.boolean()),

  category: z
    .string()
    .trim()
    .optional(),
});

/* ── GET /api/explore/waitlists/:slug ────────────────────────────── */

export const exploreSlugParamSchema = z.object({
  slug: z
    .string("Waitlist slug is required.")
    .trim()
    .toLowerCase()
    .min(2,  "Slug must be at least 2 characters.")
    .max(60, "Slug must not exceed 60 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, digits, and hyphens.",
    ),
});

/* ── Inferred DTOs ───────────────────────────────────────────────── */

export type ExploreQueryDto      = z.infer<typeof exploreQuerySchema>;
export type ExploreSlugParamDto  = z.infer<typeof exploreSlugParamSchema>;