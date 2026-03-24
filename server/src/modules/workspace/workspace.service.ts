import status from "http-status";
import { prisma }   from "../../lib/prisma";
import AppError     from "../../errorHelpers/AppError";
import {
  CreateWorkspacePayload,
  GetWorkspacesPayload,
  GetWorkspacePayload,
  UpdateWorkspacePayload,
  DeleteWorkspacePayload,
  GetDashboardOverviewPayload,
  AddMemberPayload,
  RemoveMemberPayload,
  GetMembersPayload,
  WorkspaceItem,
  PaginatedWorkspaces,
  PaginatedMembers,
  MemberRow,
} from "./workspace.interface";
import { WORKSPACE_MESSAGES } from "./workspace.constant";
import {
  normaliseWorkspacePagination,
  normaliseMemberPagination,
  buildWorkspacePaginationMeta,
  buildMemberPaginationMeta,
  toWorkspaceItem,
} from "./workspace.utils";

/* ── Shared Prisma select for workspace rows ─────────────────────── */
const WORKSPACE_SELECT = {
  id:        true,
  name:      true,
  slug:      true,
  logo:      true,
  plan:      true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: { id: true, name: true, email: true },
  },
  _count: {
    select: {
      members:   { where: { deletedAt: null } },
      waitlists: { where: { deletedAt: null } },
    },
  },
} as const;

export const workspaceService = {

  /* ──────────────────────────────────────────────────────────────
     POST /api/workspaces
     Create a new workspace. The requesting user becomes the owner
     AND is automatically added as a WorkspaceMember (OWNER role).
     ────────────────────────────────────────────────────────────── */

  async createWorkspace(
    payload: CreateWorkspacePayload,
  ): Promise<WorkspaceItem> {
    const { requestingUserId, name, slug, logo } = payload;

    /* 1. Verify the user exists ──────────────────────────────────── */
    const user = await prisma.user.findUnique({
      where:  { id: requestingUserId, isDeleted: false },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.USER_NOT_FOUND);
    }

    /* 2. Slug must be globally unique ───────────────────────────── */
    const slugConflict = await prisma.workspace.findUnique({
      where:  { slug },
      select: { id: true },
    });

    if (slugConflict) {
      throw new AppError(status.CONFLICT, WORKSPACE_MESSAGES.SLUG_TAKEN);
    }

    /* 3. Create workspace + owner membership atomically ─────────── */
    const workspace = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: {
          name,
          slug,
          logo: logo ?? null,
          ownerId: requestingUserId,
        },
        select: WORKSPACE_SELECT,
      });

      // Auto-add owner as a member with OWNER role
      await tx.workspaceMember.create({
        data: {
          workspaceId: ws.id,
          userId:      requestingUserId,
          role:        "OWNER",
        },
      });

      return ws;
    });

    return toWorkspaceItem(workspace);
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces
     List all workspaces the requesting user is a member of.
     Supports search (name / slug) and pagination.
     ────────────────────────────────────────────────────────────── */

  async getWorkspaces(
    payload: GetWorkspacesPayload,
  ): Promise<PaginatedWorkspaces> {
    const { requestingUserId, query } = payload;

    const { page, limit, skip } = normaliseWorkspacePagination(query);

    /*
     * Strategy: fetch WorkspaceMember records for the user, then join
     * to Workspace. This lets us naturally scope the list to only
     * workspaces the user belongs to without a subquery.
     */
    const memberWhere = {
      userId:    requestingUserId,
      deletedAt: null,
      workspace: {
        deletedAt: null,
        ...(query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: "insensitive" as const } },
                { slug: { contains: query.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
    };

    const sortField = query.sortBy    ?? "createdAt";
    const sortOrder = query.sortOrder ?? "desc";

    const [total, memberships] = await prisma.$transaction([
      prisma.workspaceMember.count({ where: memberWhere }),
      prisma.workspaceMember.findMany({
        where:   memberWhere,
        orderBy: { workspace: { [sortField]: sortOrder } },
        skip,
        take:    limit,
        select: {
          workspace: { select: WORKSPACE_SELECT },
        },
      }),
    ]);

    return {
      data: memberships.map((m) => toWorkspaceItem(m.workspace)),
      meta: buildWorkspacePaginationMeta(total, page, limit),
    };
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/dashboard/overview
     Fetch aggregate stats for all workspaces owned by or joined by
     the requesting user.
     ────────────────────────────────────────────────────────────── */

  async getDashboardOverview(
    payload: GetDashboardOverviewPayload,
  ) {
    const { requestingUserId, workspaceId } = payload;

    // 1. Get all workspaces the user is a member of
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: requestingUserId, deletedAt: null },
      select: { workspaceId: true },
    });
    
    let workspaceIds = memberships.map(m => m.workspaceId);

    // If a specific workspaceId is requested, Filter to only that one
    // (and verify the user is actually a member of it)
    if (workspaceId) {
       if (!workspaceIds.includes(workspaceId)) {
          throw new AppError(status.FORBIDDEN, "You do not have access to this workspace.");
       }
       workspaceIds = [workspaceId];
    }

    // 2. Fetch waitlists with their subscriber counts and top 3 referrers
    const waitlists = await prisma.waitlist.findMany({
      where: { workspaceId: { in: workspaceIds }, deletedAt: null },
      select: {
         id: true,
         name: true,
         slug: true,
         isOpen: true,
         createdAt: true,
         _count: {
            select: {
               subscribers: { where: { deletedAt: null } }
            }
         },
         subscribers: {
            where: { deletedAt: null, referralsCount: { gt: 0 } },
            orderBy: [{ referralsCount: "desc" }, { createdAt: "asc" }],
            take: 3,
            select: {
               id: true,
               name: true,
               email: true,
               referralsCount: true,
               isConfirmed: true,
               createdAt: true,
            }
         }
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Stats aggregation per waitlist
    // We fetch aggregate stats for referrals for each waitlist to show on cards
    const waitlistStats = await Promise.all(waitlists.map(async (w) => {
       const referralsAggr = await prisma.subscriber.aggregate({
          _sum: { referralsCount: true },
          _count: { id: true },
          where: { waitlistId: w.id, deletedAt: null, referralsCount: { gt: 0 } }
       });
       
       const totalReferrals = referralsAggr._sum.referralsCount || 0;
       const activeReferrers = referralsAggr._count.id || 0;
       
       return {
          id: w.id,
          totalReferrals,
          activeReferrers,
          avgReferrals: activeReferrers > 0 ? totalReferrals / activeReferrers : 0,
       };
    }));

    const statsMap = new Map(waitlistStats.map(s => [s.id, s]));

    // 4. Global Stats
    const totalWaitlists = waitlists.length;
    const totalSubscribers = await prisma.subscriber.count({
      where: { waitlist: { workspaceId: { in: workspaceIds } }, deletedAt: null },
    });
    const totalReferrals = waitlistStats.reduce((sum, s) => sum + s.totalReferrals, 0);

    // Build standard return format
    const formattedWaitlists = waitlists.map(w => {
       const s = statsMap.get(w.id)!;
       return {
          id: w.id,
          name: w.name,
          slug: w.slug,
          isOpen: w.isOpen,
          subscribers: w._count.subscribers,
          totalReferrals: s.totalReferrals,
          activeReferrers: s.activeReferrers,
          avgReferrals: s.avgReferrals,
          topReferrers: w.subscribers.map((r, i) => ({
             rank: i + 1,
             name: r.name,
             email: r.email,
             directReferrals: r.referralsCount,
             isConfirmed: r.isConfirmed,
             joinedAt: r.createdAt.toISOString(),
          })),
          createdAt: w.createdAt.toISOString().split("T")[0],
       };
    });

    return {
      stats: {
        totalSubscribers,
        totalWaitlists,
        totalReferrals,
        conversionRate: totalSubscribers > 0 ? (totalReferrals / totalSubscribers) * 100 : 0,
      },
      waitlists: formattedWaitlists,
    };
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/:workspaceId
     Fetch a single workspace. The requesting user must be a member.
     ────────────────────────────────────────────────────────────── */

  async getWorkspace(
    payload: GetWorkspacePayload,
  ): Promise<WorkspaceItem> {
    const { workspaceId, requestingUserId } = payload;

    /* 1. Membership guard ───────────────────────────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, WORKSPACE_MESSAGES.UNAUTHORIZED);
    }

    /* 2. Fetch workspace ─────────────────────────────────────────── */
    const workspace = await prisma.workspace.findUnique({
      where:  { id: workspaceId, deletedAt: null },
      select: WORKSPACE_SELECT,
    });

    if (!workspace) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.NOT_FOUND);
    }

    return toWorkspaceItem(workspace);
  },

  /* ──────────────────────────────────────────────────────────────
     PATCH /api/workspaces/:workspaceId
     Update workspace name, slug, or logo.
     Only the workspace owner may update.
     ────────────────────────────────────────────────────────────── */

  async updateWorkspace(
    payload: UpdateWorkspacePayload,
  ): Promise<WorkspaceItem> {
    const { workspaceId, requestingUserId, name, slug, logo } = payload;

    /* 1. Fetch workspace and verify ownership ────────────────────── */
    const workspace = await prisma.workspace.findUnique({
      where:  { id: workspaceId, deletedAt: null },
      select: { id: true, ownerId: true, slug: true },
    });

    if (!workspace) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.NOT_FOUND);
    }

    if (workspace.ownerId !== requestingUserId) {
      throw new AppError(status.FORBIDDEN, WORKSPACE_MESSAGES.OWNER_ONLY);
    }

    /* 2. If changing slug, check global uniqueness ───────────────── */
    if (slug && slug !== workspace.slug) {
      const conflict = await prisma.workspace.findUnique({
        where:  { slug },
        select: { id: true },
      });

      if (conflict) {
        throw new AppError(status.CONFLICT, WORKSPACE_MESSAGES.SLUG_TAKEN);
      }
    }

    /* 3. Apply update ───────────────────────────────────────────── */
    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(name !== undefined ? { name }  : {}),
        ...(slug !== undefined ? { slug }  : {}),
        ...(logo !== undefined ? { logo }  : {}),
      },
      select: WORKSPACE_SELECT,
    });

    return toWorkspaceItem(updated);
  },

  /* ──────────────────────────────────────────────────────────────
     DELETE /api/workspaces/:workspaceId
     Soft-delete the workspace.
     Only the workspace owner may delete.
     ────────────────────────────────────────────────────────────── */

  async deleteWorkspace(
    payload: DeleteWorkspacePayload,
  ): Promise<void> {
    const { workspaceId, requestingUserId } = payload;
    /* 1. Fetch + ownership check ─────────────────────────────────── */
    const workspace = await prisma.workspace.findUnique({
      where:  { id: workspaceId, deletedAt: null },
      select: { id: true, ownerId: true },
    });

    if (!workspace) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.NOT_FOUND);
    }

    if (workspace.ownerId !== requestingUserId) {
      throw new AppError(status.FORBIDDEN, WORKSPACE_MESSAGES.OWNER_ONLY);
    }

    /* 2. Soft-delete — cascades are handled at the DB/Prisma level ─ */
    await prisma.workspace.update({
      where: { id: workspaceId },
      data:  { deletedAt: new Date() },
    });
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/workspaces/:workspaceId/members
     List all active members of a workspace.
     Any workspace member may view the list.
     ────────────────────────────────────────────────────────────── */

  async getMembers(
    payload: GetMembersPayload,
  ): Promise<PaginatedMembers> {
    const { workspaceId, requestingUserId, query } = payload;

    /* 1. Verify workspace exists ─────────────────────────────────── */
    const workspace = await prisma.workspace.findUnique({
      where:  { id: workspaceId, deletedAt: null },
      select: { id: true },
    });

    if (!workspace) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.NOT_FOUND);
    }

    /* 2. Verify requester is a member ───────────────────────────── */
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: requestingUserId },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!membership) {
      throw new AppError(status.FORBIDDEN, WORKSPACE_MESSAGES.UNAUTHORIZED);
    }

    /* 3. Fetch members ──────────────────────────────────────────── */
    const { page, limit, skip } = normaliseMemberPagination(query);

    const where = { workspaceId, deletedAt: null };

    const [total, members] = await prisma.$transaction([
      prisma.workspaceMember.count({ where }),
      prisma.workspaceMember.findMany({
        where,
        orderBy: { joinedAt: "asc" },
        skip,
        take:    limit,
        select: {
          id:       true,
          role:     true,
          joinedAt: true,
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      }),
    ]);

    const data: MemberRow[] = members.map((m) => ({
      id:       m.id,
      role:     m.role,
      joinedAt: m.joinedAt,
      user:     m.user,
    }));

    return {
      data,
      meta: buildMemberPaginationMeta(total, page, limit),
    };
  },

  /* ──────────────────────────────────────────────────────────────
     POST /api/workspaces/:workspaceId/members
     Add a user to a workspace by email.
     Only the workspace owner may add members.
     ────────────────────────────────────────────────────────────── */

  async addMember(
    payload: AddMemberPayload,
  ): Promise<MemberRow> {
    const { workspaceId, requestingUserId, email } = payload;

    /* 1. Fetch workspace + ownership check ───────────────────────── */
    const workspace = await prisma.workspace.findUnique({
      where:  { id: workspaceId, deletedAt: null },
      select: { id: true, ownerId: true },
    });

    if (!workspace) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.NOT_FOUND);
    }

    if (workspace.ownerId !== requestingUserId) {
      throw new AppError(status.FORBIDDEN, WORKSPACE_MESSAGES.OWNER_ONLY);
    }

    /* 2. Resolve user by email ───────────────────────────────────── */
    const targetUser = await prisma.user.findUnique({
      where:  { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true, image: true, isDeleted: true },
    });

    if (!targetUser || targetUser.isDeleted) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.USER_NOT_FOUND);
    }

    /* 3. Check for existing active membership ────────────────────── */
    const existing = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: targetUser.id },
      },
      select: { id: true, deletedAt: true },
    });

    if (existing && !existing.deletedAt) {
      throw new AppError(status.CONFLICT, WORKSPACE_MESSAGES.ALREADY_MEMBER);
    }

    /* 4. Create (or re-activate) the membership ─────────────────── */
    let member;

    if (existing && existing.deletedAt) {
      /*
       * Previously removed member — restore their record rather than
       * creating a duplicate so join history is preserved.
       */
      member = await prisma.workspaceMember.update({
        where: { id: existing.id },
        data:  { deletedAt: null, role: "MEMBER", joinedAt: new Date() },
        select: {
          id: true, role: true, joinedAt: true,
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      });
    } else {
      member = await prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId: targetUser.id,
          role:   "MEMBER",
        },
        select: {
          id: true, role: true, joinedAt: true,
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      });
    }

    return {
      id:       member.id,
      role:     member.role,
      joinedAt: member.joinedAt,
      user:     member.user,
    };
  },

  /* ──────────────────────────────────────────────────────────────
     DELETE /api/workspaces/:workspaceId/members/:memberId
     Remove a member from a workspace (soft-delete).
     Only the workspace owner may remove members.
     The owner themselves cannot be removed.
     ────────────────────────────────────────────────────────────── */

  async removeMember(
    payload: RemoveMemberPayload,
  ): Promise<void> {
    const { workspaceId, requestingUserId, memberId } = payload;

    /* 1. Fetch workspace + ownership check ───────────────────────── */
    const workspace = await prisma.workspace.findUnique({
      where:  { id: workspaceId, deletedAt: null },
      select: { id: true, ownerId: true },
    });

    if (!workspace) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.NOT_FOUND);
    }

    if (workspace.ownerId !== requestingUserId) {
      throw new AppError(status.FORBIDDEN, WORKSPACE_MESSAGES.OWNER_ONLY);
    }

    /* 2. Resolve the membership record ──────────────────────────── */
    const member = await prisma.workspaceMember.findUnique({
      where:  { id: memberId, workspaceId, deletedAt: null },
      select: { id: true, userId: true },
    });

    if (!member) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.MEMBER_NOT_FOUND);
    }

    /* 3. Prevent removing the owner ─────────────────────────────── */
    if (member.userId === workspace.ownerId) {
      throw new AppError(status.BAD_REQUEST, WORKSPACE_MESSAGES.CANNOT_REMOVE_OWNER);
    }

    /* 4. Soft-delete the membership ─────────────────────────────── */
    await prisma.workspaceMember.update({
      where: { id: memberId },
      data:  { deletedAt: new Date() },
    });
  },
};