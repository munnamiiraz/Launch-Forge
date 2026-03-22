import {
  RoadmapItemRow,
  RoadmapGroupedItems,
  RoadmapStatusCounts,
  GetRoadmapQuery,
  UpdateRoadmapItemPayload,
} from "./roadmap.interface";

/* ─────────────────────────────────────────────────────────────────
   Group items by status for Kanban-style column rendering
   ──────────────────────────────────────────────────────────────── */

export function groupItemsByStatus(
  items: RoadmapItemRow[],
): RoadmapGroupedItems {
  return {
    planned:    items.filter((i) => i.status === "PLANNED"),
    inProgress: items.filter((i) => i.status === "IN_PROGRESS"),
    completed:  items.filter((i) => i.status === "COMPLETED"),
  };
}

/* ─────────────────────────────────────────────────────────────────
   Count items per status
   ──────────────────────────────────────────────────────────────── */

export function buildStatusCounts(
  items: RoadmapItemRow[],
): RoadmapStatusCounts {
  const planned    = items.filter((i) => i.status === "PLANNED").length;
  const inProgress = items.filter((i) => i.status === "IN_PROGRESS").length;
  const completed  = items.filter((i) => i.status === "COMPLETED").length;

  return {
    planned,
    inProgress,
    completed,
    total: planned + inProgress + completed,
  };
}

/* ─────────────────────────────────────────────────────────────────
   Build the next sortOrder value for a newly appended item.
   Appending uses max(currentSortOrders) + STEP to leave gaps for
   future drag-and-drop reordering without a full re-index.
   ──────────────────────────────────────────────────────────────── */

export function nextSortOrder(
  maxCurrentSortOrder: number | null,
  step: number,
): number {
  if (maxCurrentSortOrder === null) return step;   // first item on this roadmap
  return maxCurrentSortOrder + step;
}

/* ─────────────────────────────────────────────────────────────────
   Build optional status filter for Prisma where clause
   ──────────────────────────────────────────────────────────────── */

export function buildStatusFilter(
  query: GetRoadmapQuery,
): object {
  if (!query.status) return {};
  return { status: query.status };
}

/* ─────────────────────────────────────────────────────────────────
   Build the Prisma data object for a PATCH update.
   Only fields explicitly present in the payload are included —
   this is a true partial update (undefined fields are NOT overwritten,
   null fields ARE written to clear the column).
   ──────────────────────────────────────────────────────────────── */

export function buildUpdateData(
  payload: Omit<UpdateRoadmapItemPayload, "itemId" | "workspaceId" | "requestingUserId">,
): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  if (payload.title       !== undefined) data.title       = payload.title;
  if (payload.description !== undefined) data.description = payload.description;   // null clears
  if (payload.status      !== undefined) data.status      = payload.status;
  if (payload.eta         !== undefined) data.eta         = payload.eta;           // null clears
  if (payload.sortOrder   !== undefined) data.sortOrder   = payload.sortOrder;

  return data;
}