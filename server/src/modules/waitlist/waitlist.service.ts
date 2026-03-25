import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  CreateWaitlistPayload,
  GetWaitlistsPayload,
  PaginatedWaitlists,
  WaitlistItem,
} from "./waitlist.interface";
import {
  WAITLIST_MESSAGES,
  WAITLIST_PLAN_LIMITS,
} from "./waitlist.constants";
import { normalisePagination, buildPaginationMeta } from "./waitlist.utils";

export const waitlistService = {
  /* ── POST /api/waitlists ─────────────────────────────────────── */

  async createWaitlist(payload: CreateWaitlistPayload): Promise<WaitlistItem> {
    const { workspaceId, requestingUserId, ...data } = payload;
    console.log(payload);
    /* 1. Verify the caller is a member of the workspace ─────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
      include: { workspace: true },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, WAITLIST_MESSAGES.UNAUTHORIZED);
    }

    const workspace = membership.workspace;

    /* 2. Enforce plan waitlist limits ───────────────────────────── */
    const planLimit = WAITLIST_PLAN_LIMITS[workspace.plan] ?? 1;

    if (planLimit !== Infinity) {
      const existingCount = await prisma.waitlist.count({
        // Archived waitlists do not count against "active" plan limits.
        where: { workspaceId, deletedAt: null, archivedAt: null },
      });

      if (existingCount >= planLimit) {
        throw new AppError(status.PAYMENT_REQUIRED, WAITLIST_MESSAGES.PLAN_LIMIT);
      }
    }

    /* 3. Check slug uniqueness within the workspace ─────────────── */
    const slugTaken = await prisma.waitlist.findUnique({
      where: {
        workspaceId_slug: { workspaceId, slug: data.slug },
      },
    });

    if (slugTaken) {
      throw new AppError(status.CONFLICT, WAITLIST_MESSAGES.SLUG_TAKEN);
    }

    /* 4. Create the waitlist ─────────────────────────────────────── */
    const waitlist = await prisma.waitlist.create({
      data: {
        workspaceId,
        name:        data.name,
        slug:        data.slug,
        description: data.description,
        logoUrl:     data.logoUrl,
        theme:       data.theme,
        isOpen:      data.isOpen ?? true,
        endDate:     data.endDate,
      },
      select: {
        id:          true,
        name:        true,
        slug:        true,
        description: true,
        logoUrl:     true,
        isOpen:      true,
        archivedAt:  true,
        createdAt:   true,
        updatedAt:   true,
        _count: { select: { subscribers: true } },
      },
    });

    return waitlist;
  },

  /* ── GET /api/waitlists ──────────────────────────────────────── */

  async getWaitlists(payload: GetWaitlistsPayload): Promise<PaginatedWaitlists> {
    const { workspaceId, requestingUserId, query } = payload;

    /* 1. Verify membership ───────────────────────────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, WAITLIST_MESSAGES.UNAUTHORIZED);
    }

    /* 2. Build filters ──────────────────────────────────────────── */
    const { page, limit, skip } = normalisePagination(query);

    const where = {
      workspaceId,
      deletedAt: null,
      ...(query.includeArchived ? {} : { archivedAt: null }),
      ...(query.search
        ? {
            OR: [
              { name:        { contains: query.search, mode: "insensitive" as const } },
              { slug:        { contains: query.search, mode: "insensitive" as const } },
              { description: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(query.isOpen !== undefined ? { isOpen: query.isOpen } : {}),
    };

    /* 3. Parallel count + data fetch ─────────────────────────────── */
    const [total, waitlists] = await prisma.$transaction([
      prisma.waitlist.count({ where }),
      prisma.waitlist.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id:          true,
          name:        true,
          slug:        true,
          description: true,
          logoUrl:     true,
          isOpen:      true,
          archivedAt:  true,
          createdAt:   true,
          updatedAt:   true,
          _count: { select: { subscribers: true } },
        },
      }),
    ]);

    return {
      data: waitlists,
      meta: buildPaginationMeta(total, page, limit),
    };
  },

};

import {
  GetWaitlistByIdPayload,
  DeleteWaitlistPayload,
  UpdateWaitlistStatusPayload,
  ArchiveWaitlistPayload,
  WaitlistDetail,
  DeletedWaitlistAck,
} from "./waitlist.interface";
import { WAITLIST_BY_ID_MESSAGES } from "./waitlist.constants";
import {
  assertWaitlistBelongsToWorkspace,
  CrossWorkspaceAccessError,
  isWorkspaceOwner,
} from "./waitlist.utils";

/** Prisma select reused by both service methods to keep projections consistent. */
const WAITLIST_DETAIL_SELECT = {
  id:          true,
  workspaceId: true,
  name:        true,
  slug:        true,
  description: true,
  logoUrl:     true,
  theme:       true,
  isOpen:      true,
  archivedAt:  true,
  createdAt:   true,
  updatedAt:   true,
  _count: { select: { subscribers: true } },
} as const;

export const waitlistByIdService = {
  /* ── GET /api/workspaces/:workspaceId/waitlists/:id ──────────── */

  async getWaitlistById(
    payload: GetWaitlistByIdPayload,
  ): Promise<WaitlistDetail> {
    const { waitlistId, workspaceId, requestingUserId } = payload;

    /* 1. Verify workspace membership ─────────────────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, WAITLIST_BY_ID_MESSAGES.UNAUTHORIZED);
    }

    /* 2. Fetch the waitlist (non-deleted) ────────────────────────── */
    const waitlist = await prisma.waitlist.findUnique({
      where: { id: waitlistId, deletedAt: null },
      select: WAITLIST_DETAIL_SELECT,
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, WAITLIST_BY_ID_MESSAGES.NOT_FOUND);
    }

    /* 3. IDOR guard — confirm it belongs to the URL's workspace ──── */
    try {
      assertWaitlistBelongsToWorkspace(waitlist, workspaceId);
    } catch (err) {
      if (err instanceof CrossWorkspaceAccessError) {
        // Surface as 404, not 403 — never confirm the resource exists
        throw new AppError(status.NOT_FOUND, WAITLIST_BY_ID_MESSAGES.NOT_FOUND);
      }
      throw err;
    }

    return waitlist;
  },

  /* ── GET /api/v1/waitlists/by-id/:id ─────────────────────────── */

  async getWaitlistByIdOnly(
    payload: { waitlistId: string; requestingUserId: string },
  ): Promise<WaitlistDetail> {
    const { waitlistId, requestingUserId } = payload;

    // Try finding by ID first, then fallback to slug
    const waitlist = await prisma.waitlist.findFirst({
      where: {
         OR: [
            { id: waitlistId, deletedAt: null },
            { slug: waitlistId, deletedAt: null }
         ]
      },
      select: WAITLIST_DETAIL_SELECT,
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, WAITLIST_BY_ID_MESSAGES.NOT_FOUND);
    }

    // Verify membership in the waitlist's workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { 
          workspaceId: waitlist.workspaceId, 
          userId:      requestingUserId 
        },
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, WAITLIST_BY_ID_MESSAGES.UNAUTHORIZED);
    }

    return waitlist;
  },

  /* ── DELETE /api/workspaces/:workspaceId/waitlists/:id ───────── */

  async deleteWaitlist(
    payload: DeleteWaitlistPayload,
  ): Promise<DeletedWaitlistAck> {
    const { waitlistId, workspaceId, requestingUserId } = payload;

    /* 1. Verify workspace membership + fetch role in one query ───── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, WAITLIST_BY_ID_MESSAGES.UNAUTHORIZED);
    }

    /* 2. Only OWNER may delete a waitlist ───────────────────────── */
    if (!isWorkspaceOwner(membership.role)) {
      throw new AppError(status.FORBIDDEN, WAITLIST_BY_ID_MESSAGES.FORBIDDEN);
    }

    /* 3. Fetch waitlist — verify existence + cross-workspace ─────── */
    const waitlist = await prisma.waitlist.findUnique({
      where: { id: waitlistId, deletedAt: null },
      select: {
        id:          true,
        workspaceId: true,
        name:        true,
        logoUrl:     true,
        _count: { select: { subscribers: { where: { deletedAt: null } } } },
      },
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, WAITLIST_BY_ID_MESSAGES.NOT_FOUND);
    }

    try {
      assertWaitlistBelongsToWorkspace(waitlist, workspaceId);
    } catch (err) {
      if (err instanceof CrossWorkspaceAccessError) {
        throw new AppError(status.NOT_FOUND, WAITLIST_BY_ID_MESSAGES.NOT_FOUND);
      }
      throw err;
    }

    /* 4. Block deletion if active subscribers remain ─────────────── */
    if (waitlist._count.subscribers > 0) {
      throw new AppError(
        status.CONFLICT,
        WAITLIST_BY_ID_MESSAGES.HAS_SUBSCRIBERS,
      );
    }

    /* 5. Soft-delete ─────────────────────────────────────────────── */
    const deletedAt = new Date();

    await prisma.waitlist.update({
      where: { id: waitlistId },
      data:  { deletedAt },
    });

    // Best-effort cleanup for Cloudinary logo.
    if (waitlist.logoUrl && waitlist.logoUrl.includes("cloudinary")) {
      try {
        const { deleteFileFromCloudinary } = await import("../../config/cloudinary.config");
        await deleteFileFromCloudinary(waitlist.logoUrl);
      } catch {
        // Don't fail the request if cleanup fails.
      }
    }

    return {
      id:        waitlist.id,
      name:      waitlist.name,
      deletedAt,
    };
  },

  /* ── PATCH /api/v1/waitlists/:workspaceId/:id/status ──────────── */

  async updateWaitlistStatus(
    payload: UpdateWaitlistStatusPayload,
  ): Promise<Pick<WaitlistDetail, "id" | "isOpen" | "archivedAt" | "updatedAt">> {
    const { waitlistId, workspaceId, requestingUserId, isOpen } = payload;

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
      select: { role: true },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, WAITLIST_BY_ID_MESSAGES.UNAUTHORIZED);
    }

    if (!isWorkspaceOwner(membership.role)) {
      throw new AppError(status.FORBIDDEN, WAITLIST_BY_ID_MESSAGES.FORBIDDEN);
    }

    const waitlist = await prisma.waitlist.findUnique({
      where: { id: waitlistId, deletedAt: null },
      select: { id: true, workspaceId: true, archivedAt: true },
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, WAITLIST_BY_ID_MESSAGES.NOT_FOUND);
    }

    try {
      assertWaitlistBelongsToWorkspace(waitlist, workspaceId);
    } catch (err) {
      if (err instanceof CrossWorkspaceAccessError) {
        throw new AppError(status.NOT_FOUND, WAITLIST_BY_ID_MESSAGES.NOT_FOUND);
      }
      throw err;
    }

    if (waitlist.archivedAt && isOpen) {
      throw new AppError(status.BAD_REQUEST, WAITLIST_BY_ID_MESSAGES.CANNOT_OPEN_ARCHIVED);
    }

    const updated = await prisma.waitlist.update({
      where: { id: waitlistId },
      data:  { isOpen },
      select: { id: true, isOpen: true, archivedAt: true, updatedAt: true },
    });

    return updated;
  },

  /* ── PATCH /api/v1/waitlists/:workspaceId/:id/archive ─────────── */

  async setWaitlistArchived(
    payload: ArchiveWaitlistPayload,
  ): Promise<Pick<WaitlistDetail, "id" | "isOpen" | "archivedAt" | "updatedAt">> {
    const { waitlistId, workspaceId, requestingUserId, archived } = payload;

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
      select: { role: true },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, WAITLIST_BY_ID_MESSAGES.UNAUTHORIZED);
    }

    if (!isWorkspaceOwner(membership.role)) {
      throw new AppError(status.FORBIDDEN, WAITLIST_BY_ID_MESSAGES.FORBIDDEN);
    }

    const waitlist = await prisma.waitlist.findUnique({
      where: { id: waitlistId, deletedAt: null },
      select: { id: true, workspaceId: true },
    });

    if (!waitlist) {
      throw new AppError(status.NOT_FOUND, WAITLIST_BY_ID_MESSAGES.NOT_FOUND);
    }

    try {
      assertWaitlistBelongsToWorkspace(waitlist, workspaceId);
    } catch (err) {
      if (err instanceof CrossWorkspaceAccessError) {
        throw new AppError(status.NOT_FOUND, WAITLIST_BY_ID_MESSAGES.NOT_FOUND);
      }
      throw err;
    }

    const data = archived
      ? { archivedAt: new Date(), isOpen: false }
      : { archivedAt: null };

    const updated = await prisma.waitlist.update({
      where: { id: waitlistId },
      data,
      select: { id: true, isOpen: true, archivedAt: true, updatedAt: true },
    });

    return updated;
  },
};
