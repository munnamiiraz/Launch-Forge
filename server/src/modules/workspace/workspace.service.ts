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
  CheckSlugAvailabilityPayload,
} from "./workspace.interface";
import { WORKSPACE_MESSAGES } from "./workspace.constant";
import {
  normaliseWorkspacePagination,
  normaliseMemberPagination,
  buildWorkspacePaginationMeta,
  buildMemberPaginationMeta,
  toWorkspaceItem,
} from "./workspace.utils";
import { withCache } from "../../lib/redis/with-cache";

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

    const user = await prisma.user.findUnique({
      where:  { id: requestingUserId, isDeleted: false },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.USER_NOT_FOUND);
    }

    const WORKSPACE_PLAN_LIMITS: Record<string, number> = {
      FREE:    1,
      STARTER: 1,
      PRO:     Infinity,
      GROWTH:  Infinity,
    };

    const existingWorkspaces = await prisma.workspace.findMany({
      where: { ownerId: requestingUserId, deletedAt: null },
      select: { plan: true },
    });

    const highestPlan = existingWorkspaces.reduce((best, ws) => {
      const planRank: Record<string, number> = { FREE: 0, STARTER: 1, PRO: 2, GROWTH: 3 };
      return (planRank[ws.plan] ?? 0) > (planRank[best] ?? 0) ? ws.plan : best;
    }, "FREE" as string);

    const wsLimit = WORKSPACE_PLAN_LIMITS[highestPlan] ?? 1;

    if (wsLimit !== Infinity && existingWorkspaces.length >= wsLimit) {
      throw new AppError(
        status.PAYMENT_REQUIRED,
        "Your current plan allows only " + wsLimit + " workspace" + (wsLimit !== 1 ? "s" : "") + ". Please upgrade to create more.",
      );
    }

    const slugConflict = await prisma.workspace.findUnique({
      where:  { slug },
      select: { id: true },
    });

    if (slugConflict) {
      throw new AppError(status.CONFLICT, WORKSPACE_MESSAGES.SLUG_TAKEN);
    }

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

  async checkSlugAvailability(
    payload: CheckSlugAvailabilityPayload,
  ): Promise<{ available: boolean }> {
    const { slug } = payload;
    const existing = await prisma.workspace.findUnique({
      where:  { slug },
      select: { id: true },
    });
    return { available: !existing };
  },

  async getWorkspaces(
    payload: GetWorkspacesPayload,
  ): Promise<PaginatedWorkspaces> {
    const { requestingUserId, query } = payload;
    const { page, limit, skip } = normaliseWorkspacePagination(query);

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

    const [total, memberships] = await Promise.all([
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
     ────────────────────────────────────────────────────────────── */

  getDashboardOverview: withCache(
    (payload: GetDashboardOverviewPayload) => 
      `owner:${payload.ownerEmail || "system"}:workspace-${payload.workspaceId || "all"}:dashboard:overview`,
    300,
    async (payload: GetDashboardOverviewPayload) => {
      const { requestingUserId, workspaceId, includeArchived } = payload;

      const memberships = await prisma.workspaceMember.findMany({
        where: { userId: requestingUserId, deletedAt: null },
        select: { workspaceId: true },
      });
      
      let workspaceIds = memberships.map(m => m.workspaceId);

      if (workspaceId && workspaceId !== "undefined") {
        if (!workspaceIds.includes(workspaceId)) {
           throw new AppError(status.FORBIDDEN, "You do not have access to this workspace.");
        }
        workspaceIds = [workspaceId];
      }

      const waitlists = await prisma.waitlist.findMany({
        where: {
          workspaceId: { in: workspaceIds },
          deletedAt: null,
          ...(includeArchived ? {} : { archivedAt: null }),
        },
        select: {
           id: true,
           name: true,
           slug: true,
           logoUrl: true,
           isOpen: true,
           archivedAt: true,
           createdAt: true,
           _count: {
              select: {
                 subscribers: { where: { deletedAt: null } }
              }
           },
           subscribers: {
              where: { deletedAt: null, referralsCount: { gt: 0 } },
              orderBy: [{ referralsCount: "desc" }, { createdAt: "asc" }],
              take: 5,
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

      const totalWaitlists = waitlists.length;
      const totalSubscribers = await prisma.subscriber.count({
        where: { waitlist: { workspaceId: { in: workspaceIds } }, deletedAt: null },
      });
      const totalReferrals = waitlistStats.reduce((sum, s) => sum + s.totalReferrals, 0);

      const formattedWaitlists = waitlists.map(w => {
         const s = statsMap.get(w.id)!;
         return {
            id: w.id,
            name: w.name,
            slug: w.slug,
            logoUrl: w.logoUrl,
            isOpen: w.isOpen,
            archivedAt: w.archivedAt ? w.archivedAt.toISOString() : null,
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
    }
  ),

  async getWorkspace(
    payload: GetWorkspacePayload,
  ): Promise<WorkspaceItem> {
    const { workspaceId, requestingUserId } = payload;
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
    const workspace = await prisma.workspace.findUnique({
      where:  { id: workspaceId, deletedAt: null },
      select: WORKSPACE_SELECT,
    });
    if (!workspace) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.NOT_FOUND);
    }
    return toWorkspaceItem(workspace);
  },

  async updateWorkspace(
    payload: UpdateWorkspacePayload,
  ): Promise<WorkspaceItem> {
    const { workspaceId, requestingUserId, name, slug, logo } = payload;
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
    if (slug && slug !== workspace.slug) {
      const conflict = await prisma.workspace.findUnique({
        where:  { slug },
        select: { id: true },
      });
      if (conflict) {
        throw new AppError(status.CONFLICT, WORKSPACE_MESSAGES.SLUG_TAKEN);
      }
    }
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

  async deleteWorkspace(
    payload: DeleteWorkspacePayload,
  ): Promise<void> {
    const { workspaceId, requestingUserId } = payload;
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
    await prisma.workspace.update({
      where: { id: workspaceId },
      data:  { deletedAt: new Date() },
    });
  },

  async getMembers(
    payload: GetMembersPayload,
  ): Promise<PaginatedMembers> {
    const { workspaceId, requestingUserId, query } = payload;
    const workspace = await prisma.workspace.findUnique({
      where:  { id: workspaceId, deletedAt: null },
      select: { id: true },
    });
    if (!workspace) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.NOT_FOUND);
    }
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

  async addMember(
    payload: AddMemberPayload,
  ): Promise<MemberRow> {
    const { workspaceId, requestingUserId, email } = payload;
    const workspace = await prisma.workspace.findUnique({
      where:  { id: workspaceId, deletedAt: null },
      select: { id: true, ownerId: true, plan: true },
    });
    if (!workspace) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.NOT_FOUND);
    }
    if (workspace.ownerId !== requestingUserId) {
      throw new AppError(status.FORBIDDEN, WORKSPACE_MESSAGES.OWNER_ONLY);
    }
    const TEAM_MEMBER_LIMITS: Record<string, number> = {
      FREE: 1, STARTER: 1, PRO: 5, GROWTH: Infinity,
    };
    const memberLimit = TEAM_MEMBER_LIMITS[workspace.plan] ?? 1;
    if (memberLimit !== Infinity) {
      const currentMemberCount = await prisma.workspaceMember.count({
        where: { workspaceId, deletedAt: null },
      });
      if (currentMemberCount >= memberLimit) {
        throw new AppError(
          status.PAYMENT_REQUIRED,
          `Your ${workspace.plan} plan allows up to ${memberLimit} team member${memberLimit !== 1 ? "s" : ""}. Please upgrade to add more members.`,
        );
      }
    }
    const targetUser = await prisma.user.findUnique({
      where:  { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true, image: true, isDeleted: true },
    });
    if (!targetUser || targetUser.isDeleted) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.USER_NOT_FOUND);
    }
    const existing = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: targetUser.id },
      },
      select: { id: true, deletedAt: true },
    });
    if (existing && !existing.deletedAt) {
      throw new AppError(status.CONFLICT, WORKSPACE_MESSAGES.ALREADY_MEMBER);
    }
    let member;
    if (existing && existing.deletedAt) {
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

  async removeMember(
    payload: RemoveMemberPayload,
  ): Promise<void> {
    const { workspaceId, requestingUserId, memberId } = payload;
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
    const member = await prisma.workspaceMember.findUnique({
      where:  { id: memberId, workspaceId, deletedAt: null },
      select: { id: true, userId: true },
    });
    if (!member) {
      throw new AppError(status.NOT_FOUND, WORKSPACE_MESSAGES.MEMBER_NOT_FOUND);
    }
    if (member.userId === workspace.ownerId) {
      throw new AppError(status.BAD_REQUEST, WORKSPACE_MESSAGES.CANNOT_REMOVE_OWNER);
    }
    await prisma.workspaceMember.update({
      where: { id: memberId },
      data:  { deletedAt: new Date() },
    });
  },
};
