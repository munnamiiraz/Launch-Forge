import { z } from "zod";
import { WAITLIST_FIELD, WAITLIST_SLUG, WAITLIST_PAGINATION } from "./waitlist.constants";

/* ── POST /api/waitlists ─────────────────────────────────────────── */

export const createWaitlistSchema = z.object({
  name: z
    .string("Name is required.")
    .trim()
    .min(WAITLIST_FIELD.NAME_MIN, `Name must be at least ${WAITLIST_FIELD.NAME_MIN} characters.`)
    .max(WAITLIST_FIELD.NAME_MAX, `Name must not exceed ${WAITLIST_FIELD.NAME_MAX} characters.`),

  slug: z
    .string("Slug is required.")
    .trim()
    .toLowerCase()
    .min(WAITLIST_SLUG.MIN_LENGTH, `Slug must be at least ${WAITLIST_SLUG.MIN_LENGTH} characters.`)
    .max(WAITLIST_SLUG.MAX_LENGTH, `Slug must not exceed ${WAITLIST_SLUG.MAX_LENGTH} characters.`)
    .regex(WAITLIST_SLUG.PATTERN, WAITLIST_SLUG.PATTERN_MSG),

  description: z
    .string()
    .trim()
    .max(WAITLIST_FIELD.DESCRIPTION_MAX, `Description must not exceed ${WAITLIST_FIELD.DESCRIPTION_MAX} characters.`)
    .optional(),

  logoUrl: z
    .string()
    .trim()
    .url("Logo URL must be a valid URL.")
    .optional(),

  theme: z
    .string()
    .optional(),

  isOpen: z
    .boolean()
    .default(true),

  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

/* ── GET /api/waitlists — query params ──────────────────────────── */

export const getWaitlistsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : WAITLIST_PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().int().min(1, "Page must be at least 1.")),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : WAITLIST_PAGINATION.DEFAULT_LIMIT))
    .pipe(
      z.number()
        .int()
        .min(1, "Limit must be at least 1.")
        .max(WAITLIST_PAGINATION.MAX_LIMIT, `Limit must not exceed ${WAITLIST_PAGINATION.MAX_LIMIT}.`)
    ),

  search: z
    .string()
    .trim()
    .optional(),

  isOpen: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
});

/* ── Workspace ID param ──────────────────────────────────────────── */

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().cuid("Invalid workspace ID."),
});


/* ── URL params shared by both /:id endpoints ────────────────────── */

export const waitlistByIdParamSchema = z.object({
  workspaceId: z
    .string("workspaceId param is required.")
    .cuid("workspaceId must be a valid CUID."),

  id: z
    .string("Waitlist id param is required.")
    .cuid("Waitlist id must be a valid CUID."),
});

export type WaitlistByIdParamDto = z.infer<typeof waitlistByIdParamSchema>;

/*
 * No request body schemas are needed for GET or DELETE.
 * The validateRequest middleware is applied to params only.
 *
 * If you later add DELETE /api/waitlists/:id with a body
 * (e.g. { confirm: true }), add that schema here — not in
 * the parent validation.ts.
 */

export type CreateWaitlistDto    = z.infer<typeof createWaitlistSchema>;
export type GetWaitlistsQueryDto = z.infer<typeof getWaitlistsQuerySchema>;
