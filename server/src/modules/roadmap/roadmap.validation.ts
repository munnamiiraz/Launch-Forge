import { z } from "zod";
import { ROADMAP_FIELD, ROADMAP_STATUSES } from "./roadmap.constants";

/* ─────────────────────────────────────────────────────────────────
   URL params
   ──────────────────────────────────────────────────────────────── */

export const roadmapIdParamSchema = z.object({
  /** Used in GET /api/roadmap/:roadmapId */
  roadmapId: z
    .string("Roadmap ID is required.")
    .cuid("Roadmap ID must be a valid CUID."),
});

export const roadmapItemIdParamSchema = z.object({
  /** Used in PATCH /api/roadmap/:id */
  id: z
    .string("Roadmap item ID is required.")
    .cuid("Roadmap item ID must be a valid CUID."),
});

/* ─────────────────────────────────────────────────────────────────
   POST /api/roadmap  — create a roadmap item
   Requires authentication; roadmapId + workspaceId come from the body
   so callers identify which roadmap to append to.
   ──────────────────────────────────────────────────────────────── */

export const createRoadmapItemSchema = z.object({
  roadmapId: z
    .string("Roadmap ID is required.")
    .cuid("Roadmap ID must be a valid CUID."),

  workspaceId: z
    .string("Workspace ID is required.")
    .cuid("Workspace ID must be a valid CUID."),

  title: z
    .string("Title is required.")
    .trim()
    .min(
      ROADMAP_FIELD.TITLE_MIN,
      `Title must be at least ${ROADMAP_FIELD.TITLE_MIN} characters.`,
    )
    .max(
      ROADMAP_FIELD.TITLE_MAX,
      `Title must not exceed ${ROADMAP_FIELD.TITLE_MAX} characters.`,
    ),

  description: z
    .string()
    .trim()
    .max(
      ROADMAP_FIELD.DESCRIPTION_MAX,
      `Description must not exceed ${ROADMAP_FIELD.DESCRIPTION_MAX} characters.`,
    )
    .optional(),

  status: z
    .enum(ROADMAP_STATUSES, {
      message: `status must be one of: ${ROADMAP_STATUSES.join(", ")}.`,
    })
    .default("PLANNED"),

  /**
   * ISO-8601 date string; coerced to Date.
   * Must be in the future — you can't set an ETA in the past.
   */
  eta: z
    .string()
    .datetime({ message: "eta must be a valid ISO-8601 datetime string." })
    .transform((v) => new Date(v))
    .refine(
      (d) => d > new Date(),
      "eta must be a future date.",
    )
    .optional(),
});

/* ─────────────────────────────────────────────────────────────────
   GET /api/roadmap/:roadmapId  — query params
   ──────────────────────────────────────────────────────────────── */

export const getRoadmapQuerySchema = z.object({
  status: z
    .enum(ROADMAP_STATUSES, {
      message: `status must be one of: ${ROADMAP_STATUSES.join(", ")}.`,
    })
    .optional(),
});

/* ─────────────────────────────────────────────────────────────────
   PATCH /api/roadmap/:id  — partial update
   All fields are optional; at least one must be present.
   ──────────────────────────────────────────────────────────────── */

export const updateRoadmapItemSchema = z
  .object({
    workspaceId: z
      .string("Workspace ID is required.")
      .cuid("Workspace ID must be a valid CUID."),

    title: z
      .string()
      .trim()
      .min(
        ROADMAP_FIELD.TITLE_MIN,
        `Title must be at least ${ROADMAP_FIELD.TITLE_MIN} characters.`,
      )
      .max(
        ROADMAP_FIELD.TITLE_MAX,
        `Title must not exceed ${ROADMAP_FIELD.TITLE_MAX} characters.`,
      )
      .optional(),

    description: z
      .string()
      .trim()
      .max(
        ROADMAP_FIELD.DESCRIPTION_MAX,
        `Description must not exceed ${ROADMAP_FIELD.DESCRIPTION_MAX} characters.`,
      )
      .nullable()   // null explicitly clears the field
      .optional(),

    status: z
      .enum(ROADMAP_STATUSES, {
        message: `status must be one of: ${ROADMAP_STATUSES.join(", ")}.`,
      })
      .optional(),

    eta: z
      .string()
      .datetime({ message: "eta must be a valid ISO-8601 datetime string." })
      .transform((v) => new Date(v))
      .nullable()   // null explicitly clears the ETA
      .optional(),

    sortOrder: z
      .number()
      .int("sortOrder must be a whole number.")
      .min(0, "sortOrder must be non-negative.")
      .optional(),
  })
  .refine(
    (data) => {
      const updateFields = Object.keys(data).filter((k) => k !== "workspaceId");
      return updateFields.length > 0;
    },
    { message: "At least one field must be provided to update." },
  );

/* ─────────────────────────────────────────────────────────────────
   Inferred DTOs
   ──────────────────────────────────────────────────────────────── */

export type CreateRoadmapItemDto  = z.infer<typeof createRoadmapItemSchema>;
export type GetRoadmapQueryDto    = z.infer<typeof getRoadmapQuerySchema>;
export type UpdateRoadmapItemDto  = z.infer<typeof updateRoadmapItemSchema>;