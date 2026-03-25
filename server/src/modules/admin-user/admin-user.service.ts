import status    from "http-status";
import { prisma } from "../../lib/prisma";
import AppError   from "../../errorHelpers/AppError";

import {
  GetUsersPayload,
  GetUserByIdPayload,
  UserMutationPayload,
  InviteUserPayload,
  BulkActionPayload,
  AdminUsersBasePayload,
  AdminUser,
  PaginatedUsers,
  UsersPageStats,
} from "./admin-user.interface";

import { ADMIN_USERS_MESSAGES } from "./admin-user.constants";

import {
  normaliseUsersPagination,
  buildUsersPaginationMeta,
  buildUsersWhere,
  buildUserOrderBy,
  calcMrrContrib,
} from "./admin-user.utils";

/* ── Shared Prisma select for a user row ─────────────────────────── */

const USER_SELECT = {
  id:            true,
  name:          true,
  email:         true,
  image:         true,
  role:          true,
  status:        true,
  createdAt:     true,
  isDeleted:     true,
  emailVerified: true,
  payments: {
    select: { planType: true, planMode: true, status: true },
  },
  sessions: {
    orderBy: { createdAt: "desc" as const },
    take:    1,
    select:  { createdAt: true },
  },
  ownedWorkspaces: {
    where:  { deletedAt: null as null },
    select: {
      _count: { select: { waitlists: { where: { deletedAt: null as null } } } },
      waitlists: {
        where:  { deletedAt: null as null },
        select: {
          _count:      { select: { subscribers: { where: { deletedAt: null as null } } } },
          subscribers: {
            where:  { deletedAt: null as null },
            select: { referralsCount: true },
          },
        },
      },
    },
  },
} as const;

/* ── Admin guard ─────────────────────────────────────────────────── */

async function assertAdmin(userId: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where:  { id: userId, isDeleted: false },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") {
    throw new AppError(status.FORBIDDEN, ADMIN_USERS_MESSAGES.FORBIDDEN);
  }
}

/* ── Shape mapper ────────────────────────────────────────────────── */

function toAdminUser(raw: {
  id:            string;
  name:          string;
  email:         string;
  image:         string | null;
  role:          string;
  status:        string;
  createdAt:     Date;
  isDeleted:     boolean;
  emailVerified: boolean;
  payments:      { planType: string; planMode: string; status: string } | null;
  sessions:      { createdAt: Date }[];
  ownedWorkspaces: {
    _count: { waitlists: number };
    waitlists: {
      _count: { subscribers: number };
      subscribers: { referralsCount: number }[];
    }[];
  }[];
}): AdminUser {
  const payment = raw.payments?.status === "PAID" ? raw.payments : null;
  const plan    = (payment?.planType as "PRO" | "GROWTH") ?? "FREE";
  const planMode= (payment?.planMode as "MONTHLY" | "YEARLY") ?? null;

  const waitlists = raw.ownedWorkspaces.reduce(
    (s, ws) => s + ws._count.waitlists, 0,
  );

  const subscribers = raw.ownedWorkspaces.reduce(
    (s, ws) =>
      s + ws.waitlists.reduce((w, wl) => w + wl._count.subscribers, 0),
    0,
  );

  const totalReferrals = raw.ownedWorkspaces.reduce(
    (s, ws) =>
      s + ws.waitlists.reduce(
        (w, wl) => w + wl.subscribers.reduce((r, sub) => r + sub.referralsCount, 0),
        0,
      ),
    0,
  );

  return {
    id:             raw.id,
    name:           raw.name,
    email:          raw.email,
    image:          raw.image,
    role:           raw.role as "USER" | "ADMIN",
    status:         raw.status as "ACTIVE" | "SUSPENDED" | "INACTIVE",
    plan,
    planMode,
    mrrContrib:     calcMrrContrib(payment?.planType ?? null, payment?.planMode ?? null),
    waitlists,
    subscribers,
    totalReferrals,
    createdAt:      raw.createdAt.toISOString(),
    lastActiveAt:   raw.sessions[0]?.createdAt.toISOString() ?? null,
    emailVerified:  raw.emailVerified,
    isDeleted:      raw.isDeleted,
  };
}

export const adminUsersService = {

  /* ──────────────────────────────────────────────────────────────
     GET /api/admin/users
     ──────────────────────────────────────────────────────────────
     Paginated user list with search, status/plan/role filters,
     sortable columns. Matches the UsersTable exactly.
     ────────────────────────────────────────────────────────────── */

  async getUsers(payload: GetUsersPayload): Promise<PaginatedUsers> {
    await assertAdmin(payload.requestingUserId);

    const { query }           = payload;
    const { page, limit, skip } = normaliseUsersPagination(query);
    const where               = buildUsersWhere(query);
    const sortField           = query.sortBy    ?? "createdAt";
    const sortOrder           = query.sortOrder ?? "desc";
    const orderBy             = buildUserOrderBy(sortField, sortOrder);

    const total    = await prisma.user.count({ where });
    const rawUsers = await prisma.user.findMany({
      where,
      orderBy,
      skip,
      take:   limit,
      select: USER_SELECT,
    });

    let users = rawUsers.map(toAdminUser);

    /*
     * For "subscribers" sort — Prisma can't ORDER BY nested aggregate
     * across multiple relation hops. Sort in-process after fetch.
     * For "lastActiveAt" — sort by session.createdAt in-process.
     * This is acceptable at admin scale (max ~100 rows per page).
     */
    if (sortField === "subscribers") {
      users = users.sort((a, b) =>
        sortOrder === "desc"
          ? b.subscribers - a.subscribers
          : a.subscribers - b.subscribers,
      );
    } else if (sortField === "lastActiveAt") {
      users = users.sort((a, b) => {
        const aTime = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
        const bTime = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
        return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
      });
    }

    return {
      data: users,
      meta: buildUsersPaginationMeta(total, page, limit),
    };
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/admin/users/stats
     ──────────────────────────────────────────────────────────────
     The 4 stat cards at the top of the page:
     Total users, Active, Suspended, Paid users.
     Also includes counts for the tab badges and plan pills.
     ────────────────────────────────────────────────────────────── */

  async getUsersStats(payload: AdminUsersBasePayload): Promise<UsersPageStats> {
    await assertAdmin(payload.requestingUserId);

    const today   = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

    const total     = await prisma.user.count({ where: { isDeleted: false } });
    const active    = await prisma.user.count({ where: { isDeleted: false, status: "ACTIVE" } });
    const suspended = await prisma.user.count({ where: { isDeleted: false, status: "SUSPENDED" } });
    const deleted   = await prisma.user.count({ where: { isDeleted: true } });
    const pro       = await prisma.payment.count({ where: { status: "PAID", planType: "PRO" } });
    const growth    = await prisma.payment.count({ where: { status: "PAID", planType: "GROWTH" } });
    const newToday  = await prisma.user.count({ where: { isDeleted: false, createdAt: { gte: today } } });
    const newWeek   = await prisma.user.count({ where: { isDeleted: false, createdAt: { gte: weekAgo } } });

    const paid = pro + growth;
    const free = total - paid;

    return {
      total,
      active,
      suspended,
      deleted,
      paid,
      free,
      pro,
      growth,
      newToday,
      newWeek,
    };
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/admin/users/:userId
     ──────────────────────────────────────────────────────────────
     Full detail for the UserDetailDrawer side panel.
     ────────────────────────────────────────────────────────────── */

  async getUserById(payload: GetUserByIdPayload): Promise<AdminUser> {
    await assertAdmin(payload.requestingUserId);

    const raw = await prisma.user.findUnique({
      where:  { id: payload.targetUserId },
      select: USER_SELECT,
    });

    if (!raw) {
      throw new AppError(status.NOT_FOUND, ADMIN_USERS_MESSAGES.NOT_FOUND);
    }

    return toAdminUser(raw);
  },

  /* ──────────────────────────────────────────────────────────────
     PATCH /api/admin/users/:userId/suspend
     Set status = "SUSPENDED".
     ────────────────────────────────────────────────────────────── */

  async suspendUser(payload: UserMutationPayload): Promise<AdminUser> {
    await assertAdmin(payload.requestingUserId);

    /* Prevent self-suspension */
    if (payload.targetUserId === payload.requestingUserId) {
      throw new AppError(status.BAD_REQUEST, ADMIN_USERS_MESSAGES.CANNOT_SELF);
    }

    const user = await prisma.user.findUnique({
      where:  { id: payload.targetUserId },
      select: { id: true, isDeleted: true, status: true },
    });

    if (!user)           throw new AppError(status.NOT_FOUND,  ADMIN_USERS_MESSAGES.NOT_FOUND);
    if (user.isDeleted)  throw new AppError(status.GONE,       ADMIN_USERS_MESSAGES.ALREADY_DELETED);

    await prisma.user.update({
      where: { id: payload.targetUserId },
      data:  { status: "SUSPENDED" },
    });

    return this.getUserById(payload);
  },

  /* ──────────────────────────────────────────────────────────────
     PATCH /api/admin/users/:userId/reactivate
     Set status = "ACTIVE".
     ────────────────────────────────────────────────────────────── */

  async reactivateUser(payload: UserMutationPayload): Promise<AdminUser> {
    await assertAdmin(payload.requestingUserId);

    const user = await prisma.user.findUnique({
      where:  { id: payload.targetUserId },
      select: { id: true, isDeleted: true },
    });

    if (!user)          throw new AppError(status.NOT_FOUND, ADMIN_USERS_MESSAGES.NOT_FOUND);
    if (user.isDeleted) throw new AppError(status.GONE,      ADMIN_USERS_MESSAGES.ALREADY_DELETED);

    await prisma.user.update({
      where: { id: payload.targetUserId },
      data:  { status: "ACTIVE" },
    });

    return this.getUserById(payload);
  },

  /* ──────────────────────────────────────────────────────────────
     DELETE /api/admin/users/:userId
     Soft-delete. Sets isDeleted = true + deletedAt.
     ────────────────────────────────────────────────────────────── */

  async deleteUser(payload: UserMutationPayload): Promise<void> {
    await assertAdmin(payload.requestingUserId);

    if (payload.targetUserId === payload.requestingUserId) {
      throw new AppError(status.BAD_REQUEST, ADMIN_USERS_MESSAGES.CANNOT_SELF);
    }

    const user = await prisma.user.findUnique({
      where:  { id: payload.targetUserId },
      select: { id: true, isDeleted: true },
    });

    if (!user)          throw new AppError(status.NOT_FOUND, ADMIN_USERS_MESSAGES.NOT_FOUND);
    if (user.isDeleted) throw new AppError(status.GONE,      ADMIN_USERS_MESSAGES.ALREADY_DELETED);

    await prisma.user.update({
      where: { id: payload.targetUserId },
      data:  { isDeleted: true, deletedAt: new Date(), status: "SUSPENDED" },
    });
  },

  /* ──────────────────────────────────────────────────────────────
     PATCH /api/admin/users/:userId/promote
     Set role = "ADMIN".
     ────────────────────────────────────────────────────────────── */

  async promoteToAdmin(payload: UserMutationPayload): Promise<AdminUser> {
    await assertAdmin(payload.requestingUserId);

    const user = await prisma.user.findUnique({
      where:  { id: payload.targetUserId },
      select: { id: true, isDeleted: true, role: true },
    });

    if (!user)          throw new AppError(status.NOT_FOUND, ADMIN_USERS_MESSAGES.NOT_FOUND);
    if (user.isDeleted) throw new AppError(status.GONE,      ADMIN_USERS_MESSAGES.ALREADY_DELETED);

    await prisma.user.update({
      where: { id: payload.targetUserId },
      data:  { role: "ADMIN" },
    });

    return this.getUserById(payload);
  },

  /* ──────────────────────────────────────────────────────────────
     PATCH /api/admin/users/:userId/demote
     Set role = "USER".
     ────────────────────────────────────────────────────────────── */

  async demoteFromAdmin(payload: UserMutationPayload): Promise<AdminUser> {
    await assertAdmin(payload.requestingUserId);

    if (payload.targetUserId === payload.requestingUserId) {
      throw new AppError(status.BAD_REQUEST, ADMIN_USERS_MESSAGES.CANNOT_SELF);
    }

    const user = await prisma.user.findUnique({
      where:  { id: payload.targetUserId },
      select: { id: true, isDeleted: true },
    });

    if (!user)          throw new AppError(status.NOT_FOUND, ADMIN_USERS_MESSAGES.NOT_FOUND);
    if (user.isDeleted) throw new AppError(status.GONE,      ADMIN_USERS_MESSAGES.ALREADY_DELETED);

    await prisma.user.update({
      where: { id: payload.targetUserId },
      data:  { role: "USER" },
    });

    return this.getUserById(payload);
  },

  /* ──────────────────────────────────────────────────────────────
     POST /api/admin/users/invite
     Send an invitation (creates a pending Verification record).
     ────────────────────────────────────────────────────────────── */

  async inviteUser(payload: InviteUserPayload): Promise<{ email: string; role: string }> {
    await assertAdmin(payload.requestingUserId);

    const { email, role } = payload;

    /* Check the email isn't already registered */
    const existing = await prisma.user.findUnique({
      where:  { email },
      select: { id: true },
    });

    if (existing) {
      throw new AppError(status.CONFLICT, ADMIN_USERS_MESSAGES.ALREADY_EXISTS);
    }

    /*
     * Create a Verification record as the invite token.
     * identifier = email, value = intended role.
     * Expires in 7 days.
     *
     * Your Better-Auth or email service should then send an invite
     * email with a link containing this token.
     * Replace the stub below with your real email dispatch call.
     */
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.verification.upsert({
      where: {
        // identifier + value combo is not unique by default —
        // use a stable id pattern to avoid duplicates
        id: `invite-${email}`,
      },
      update: { value: role, expiresAt, updatedAt: new Date() },
      create: {
        id:         `invite-${email}`,
        identifier: email,
        value:      role,
        expiresAt,
        createdAt:  new Date(),
        updatedAt:  new Date(),
      },
    });

    /*
     * TODO: dispatch invite email via your email provider.
     * e.g. await sendInviteEmail({ to: email, role, token: `invite-${email}` });
     */

    return { email, role };
  },

  /* ──────────────────────────────────────────────────────────────
     POST /api/admin/users/bulk/suspend
     Suspend multiple users in one call.
     ────────────────────────────────────────────────────────────── */

  async bulkSuspend(payload: BulkActionPayload): Promise<{ count: number }> {
    await assertAdmin(payload.requestingUserId);

    /* Never suspend the requesting admin themselves */
    const ids = payload.userIds.filter((id) => id !== payload.requestingUserId);

    const { count } = await prisma.user.updateMany({
      where: {
        id:        { in: ids },
        isDeleted: false,
        status:    { not: "SUSPENDED" },
      },
      data: { status: "SUSPENDED" },
    });

    return { count };
  },

  /* ──────────────────────────────────────────────────────────────
     POST /api/admin/users/bulk/delete
     Soft-delete multiple users.
     ────────────────────────────────────────────────────────────── */

  async bulkDelete(payload: BulkActionPayload): Promise<{ count: number }> {
    await assertAdmin(payload.requestingUserId);

    const ids = payload.userIds.filter((id) => id !== payload.requestingUserId);

    const { count } = await prisma.user.updateMany({
      where: {
        id:        { in: ids },
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status:    "SUSPENDED",
      },
    });

    return { count };
  },
};