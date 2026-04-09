/* ─────────────────────────────────────────────────────────────────
   Response messages
   ──────────────────────────────────────────────────────────────── */

export const ROADMAP_MESSAGES = {
  ITEM_CREATED:      "Roadmap item created successfully.",
  FETCHED:           "Roadmap fetched successfully.",
  ITEM_UPDATED:      "Roadmap item updated successfully.",
  ROADMAP_NOT_FOUND: "Roadmap not found or is not publicly accessible.",
  ITEM_NOT_FOUND:    "Roadmap item not found.",
  ROADMAP_PRIVATE:   "This roadmap is private.",
  UNAUTHORIZED:      "You are not a member of this workspace.",
  FORBIDDEN:         "You do not have permission to update this roadmap item.",
  ITEM_BELONGS_TO_DIFFERENT_ROADMAP:
    "This roadmap item does not belong to the specified workspace.",
} as const;

import type { Prisma } from "../../generated/client";

/* ─────────────────────────────────────────────────────────────────
   Field constraints
   ──────────────────────────────────────────────────────────────── */

export const ROADMAP_FIELD = {
  TITLE_MIN:        3,
  TITLE_MAX:        200,
  DESCRIPTION_MAX:  3000,
} as const;

/* ─────────────────────────────────────────────────────────────────
   RoadmapStatus values — mirrors Prisma enum
   ──────────────────────────────────────────────────────────────── */

export const ROADMAP_STATUSES = [
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

/* ─────────────────────────────────────────────────────────────────
   Sort order defaults
   Items are ordered by sortOrder ASC, then createdAt ASC as tiebreaker.
   This matches the schema's sortOrder Int @default(0) field.
   ──────────────────────────────────────────────────────────────── */

export const ROADMAP_ITEM_ORDER_BY = [
  { sortOrder: "asc" },
  { createdAt: "asc" },
] satisfies Prisma.RoadmapItemOrderByWithRelationInput[];

/* ─────────────────────────────────────────────────────────────────
   sortOrder assignment strategy
   New items are appended to the end of their roadmap by default.
   The service fetches the current max sortOrder and adds this step.
   ──────────────────────────────────────────────────────────────── */

export const SORT_ORDER_STEP = 10 as const;
