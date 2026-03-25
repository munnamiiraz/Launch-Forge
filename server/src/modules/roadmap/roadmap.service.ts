import status from "http-status";
import { prisma }  from "../../lib/prisma";
import AppError    from "../../errorHelpers/AppError";
import {
  CreateRoadmapItemPayload,
  GetRoadmapPayload,
  UpdateRoadmapItemPayload,
  RoadmapPageResult,
  CreateRoadmapItemResult,
  UpdateRoadmapItemResult,
  RoadmapItemRow,
} from "./roadmap.interface";
import { ROADMAP_MESSAGES, ROADMAP_ITEM_ORDER_BY, SORT_ORDER_STEP } from "./roadmap.constants";
import {
  groupItemsByStatus,
  buildStatusCounts,
  nextSortOrder,
  buildStatusFilter,
  buildUpdateData,
} from "./roadmap.utils";
import { assertPlanFeature } from "../../middlewares/checkPlanFeature";

/* Shared Prisma select for a RoadmapItemRow */
const ROADMAP_ITEM_SELECT = {
  id:          true,
  title:       true,
  description: true,
  status:      true,
  sortOrder:   true,
  eta:         true,
  createdAt:   true,
  updatedAt:   true,
} as const;

export const roadmapService = {

  /* ──────────────────────────────────────────────────────────────
     POST /api/roadmap
     Create a new roadmap item inside an existing roadmap.
     Requires authentication — only workspace members may create items.
     ────────────────────────────────────────────────────────────── */

  async createRoadmapItem(
    payload: CreateRoadmapItemPayload,
  ): Promise<CreateRoadmapItemResult> {
    const {
      roadmapId,
      workspaceId,
      requestingUserId,
      title,
      description,
      status: itemStatus,
      eta,
    } = payload;

    /* 1. Plan gate — require Pro or higher ──────────────────────── */
    await assertPlanFeature(workspaceId, "roadmap");

    /* 2. Verify workspace membership ────────────────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, ROADMAP_MESSAGES.UNAUTHORIZED);
    }

    /* 2. Verify the roadmap exists and belongs to this workspace ─── */
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId, workspaceId, deletedAt: null },
      select: { id: true },
    });

    if (!roadmap) {
      throw new AppError(status.NOT_FOUND, ROADMAP_MESSAGES.ROADMAP_NOT_FOUND);
    }

    /* 3. Compute sortOrder — append after the current last item ─────
     *
     * We use an aggregate MAX query rather than fetching all items.
     * New item gets max + SORT_ORDER_STEP (default: 10), leaving
     * integer gaps so drag-and-drop reordering can insert between
     * existing items without a full re-index.
     * ────────────────────────────────────────────────────────────── */
    const aggregate = await prisma.roadmapItem.aggregate({
      where:  { roadmapId, deletedAt: null },
      _max:   { sortOrder: true },
    });

    const newSortOrder = nextSortOrder(
      aggregate._max.sortOrder,
      SORT_ORDER_STEP,
    );

    /* 4. Create the item ─────────────────────────────────────────── */
    const item = await prisma.roadmapItem.create({
      data: {
        roadmapId,
        title:       title.trim(),
        description: description?.trim() ?? null,
        status:      itemStatus ?? "PLANNED",
        sortOrder:   newSortOrder,
        eta:         eta ?? null,
      },
      select: {
        id:          true,
        title:       true,
        description: true,
        status:      true,
        sortOrder:   true,
        eta:         true,
        createdAt:   true,
      },
    });

    return {
      id:          item.id,
      title:       item.title,
      description: item.description,
      status:      item.status as CreateRoadmapItemResult["status"],
      sortOrder:   item.sortOrder,
      eta:         item.eta,
      createdAt:   item.createdAt,
    };
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/roadmap/:roadmapId
     Fetch public roadmap with all its items.
     No authentication required — public roadmaps are openly readable.
     ────────────────────────────────────────────────────────────── */

  async getRoadmap(
    payload: GetRoadmapPayload,
  ): Promise<RoadmapPageResult> {
    const { roadmapId, query } = payload;

    /* 1. Resolve the roadmap ─────────────────────────────────────── */
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId, deletedAt: null },
      select: {
        id:          true,
        name:        true,
        slug:        true,
        description: true,
        isPublic:    true,
      },
    });

    if (!roadmap) {
      throw new AppError(status.NOT_FOUND, ROADMAP_MESSAGES.ROADMAP_NOT_FOUND);
    }

    if (!roadmap.isPublic) {
      throw new AppError(status.FORBIDDEN, ROADMAP_MESSAGES.ROADMAP_PRIVATE);
    }

    /* 2. Fetch items — optionally filtered by status ─────────────── */
    const where = {
      roadmapId,
      deletedAt: null,
      ...buildStatusFilter(query),
    };

    const rawItems = await prisma.roadmapItem.findMany({
      where,
      orderBy: ROADMAP_ITEM_ORDER_BY,
      select:  ROADMAP_ITEM_SELECT,
    });

    /* Cast status to our union type */
    const items: RoadmapItemRow[] = rawItems.map((i) => ({
      ...i,
      status: i.status as RoadmapItemRow["status"],
    }));

    return {
      roadmap: {
        id:          roadmap.id,
        name:        roadmap.name,
        slug:        roadmap.slug,
        description: roadmap.description,
        isPublic:    roadmap.isPublic,
      },
      groups: groupItemsByStatus(items),
      items,
      counts: buildStatusCounts(items),
    };
  },

  /* ──────────────────────────────────────────────────────────────
     PATCH /api/roadmap/:id
     Partially update a roadmap item (status, title, ETA, sortOrder).
     Requires authentication — only workspace members may update.
     ────────────────────────────────────────────────────────────── */

  async updateRoadmapItem(
    payload: UpdateRoadmapItemPayload,
  ): Promise<UpdateRoadmapItemResult> {
    const { itemId, workspaceId, requestingUserId } = payload;

    /* 1. Plan gate — require Pro or higher ──────────────────────── */
    await assertPlanFeature(workspaceId, "roadmap");

    /* 2. Verify workspace membership ────────────────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, ROADMAP_MESSAGES.UNAUTHORIZED);
    }

    /* 2. Fetch the item with its parent roadmap in one query ─────── */
    const item = await prisma.roadmapItem.findUnique({
      where: { id: itemId, deletedAt: null },
      select: {
        id: true,
        roadmap: {
          select: { workspaceId: true, deletedAt: true },
        },
      },
    });

    if (!item) {
      throw new AppError(status.NOT_FOUND, ROADMAP_MESSAGES.ITEM_NOT_FOUND);
    }

    /* 3. Cross-workspace IDOR guard — verify item's roadmap belongs
     *    to the same workspace in the request.
     *    Surface as 404 to avoid confirming the item exists
     *    in a different workspace. ──────────────────────────────── */
    if (
      item.roadmap.workspaceId !== workspaceId ||
      item.roadmap.deletedAt   !== null
    ) {
      throw new AppError(status.NOT_FOUND, ROADMAP_MESSAGES.ITEM_NOT_FOUND);
    }

    /* 4. Build partial data object — only provided fields ────────── */
    const data = buildUpdateData({
      title:       payload.title,
      description: payload.description,
      status:      payload.status,
      eta:         payload.eta,
      sortOrder:   payload.sortOrder,
    });

    /* 5. Persist the update ─────────────────────────────────────── */
    const updated = await prisma.roadmapItem.update({
      where: { id: itemId },
      data,
      select: {
        id:          true,
        title:       true,
        description: true,
        status:      true,
        sortOrder:   true,
        eta:         true,
        updatedAt:   true,
      },
    });

    return {
      id:          updated.id,
      title:       updated.title,
      description: updated.description,
      status:      updated.status as UpdateRoadmapItemResult["status"],
      sortOrder:   updated.sortOrder,
      eta:         updated.eta,
      updatedAt:   updated.updatedAt,
    };
  },
};