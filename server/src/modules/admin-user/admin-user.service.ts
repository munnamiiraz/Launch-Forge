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
import { withCache } from "../../lib/redis";

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

function toAdminUser(raw: any): AdminUser {
  const payment = raw.payments?.status === "PAID" ? raw.payments : null;
  const plan    = (payment?.planType as "PRO" | "GROWTH") ?? "FREE";
  const planMode= (payment?.planMode as "MONTHLY" | "YEARLY") ?? null;

  const waitlists = raw.ownedWorkspaces.reduce((s: number, ws: any) => s + ws._count.waitlists, 0);
  const subscribers = raw.ownedWorkspaces.reduce((s: number, ws: any) => s + ws.waitlists.reduce((w: number, wl: any) => w + wl._count.subscribers, 0), 0);
  const totalReferrals = raw.ownedWorkspaces.reduce((s: number, ws: any) => s + ws.waitlists.reduce((w: number, wl: any) => w + wl.subscribers.reduce((r: number, sub: any) => r + sub.referralsCount, 0), 0), 0);

  return {
    id: raw.id, name: raw.name, email: raw.email, image: raw.image,
    role: raw.role as "USER" | "ADMIN", status: raw.status as "ACTIVE" | "SUSPENDED" | "INACTIVE",
    plan, planMode, mrrContrib: calcMrrContrib(payment?.planType ?? null, payment?.planMode ?? null),
    waitlists, subscribers, totalReferrals, createdAt: raw.createdAt.toISOString(),
    lastActiveAt: raw.sessions[0]?.createdAt.toISOString() ?? null,
    emailVerified: raw.emailVerified, isDeleted: raw.isDeleted,
  };
}

/* ──────────────────────────────────────────────────────────────
   Raw implementation methods
   ────────────────────────────────────────────────────────────── */

async function getUsersRaw(payload: GetUsersPayload): Promise<PaginatedUsers> {
  await assertAdmin(payload.requestingUserId);
  const { query } = payload;
  const { page, limit, skip } = normaliseUsersPagination(query);
  const where = buildUsersWhere(query);
  const sortField = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";
  const orderBy = buildUserOrderBy(sortField, sortOrder);

  const total = await prisma.user.count({ where });
  const rawUsers = await prisma.user.findMany({ where, orderBy, skip, take: limit, select: USER_SELECT });

  let users = rawUsers.map(toAdminUser);
  if (sortField === "subscribers") {
    users = users.sort((a,b)=> sortOrder==="desc" ? b.subscribers - a.subscribers : a.subscribers - b.subscribers);
  } else if (sortField === "lastActiveAt") {
    users = users.sort((a,b)=> {
      const at=a.lastActiveAt?new Date(a.lastActiveAt).getTime():0, bt=b.lastActiveAt?new Date(b.lastActiveAt).getTime():0;
      return sortOrder==="desc" ? bt-at : at-bt;
    });
  }
  return { data: users, meta: buildUsersPaginationMeta(total, page, limit) };
}

async function getUsersStatsRaw(payload: AdminUsersBasePayload): Promise<UsersPageStats> {
  await assertAdmin(payload.requestingUserId);
  const today = new Date(); today.setHours(0,0,0,0);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate()-7);

  const [total, active, suspended, deleted, pro, growth, newToday, newWeek] = await prisma.$transaction([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.user.count({ where: { isDeleted: false, status: "ACTIVE" } }),
    prisma.user.count({ where: { isDeleted: false, status: "SUSPENDED" } }),
    prisma.user.count({ where: { isDeleted: true } }),
    prisma.payment.count({ where: { status: "PAID", planType: "PRO" } }),
    prisma.payment.count({ where: { status: "PAID", planType: "GROWTH" } }),
    prisma.user.count({ where: { isDeleted: false, createdAt: { gte: today } } }),
    prisma.user.count({ where: { isDeleted: false, createdAt: { gte: weekAgo } } }),
  ]);

  const paid = pro+growth;
  return { total, active, suspended, deleted, paid, free: total-paid, pro, growth, newToday, newWeek };
}

/* ──────────────────────────────────────────────────────────────
   Exported Service with Redis Caching
   ────────────────────────────────────────────────────────────── */

export const adminUsersService = {
  getUsers:      withCache("admin:users:list", 1800, getUsersRaw),
  getUsersStats: withCache("admin:users:stats", 1800, getUsersStatsRaw),

  async getUserById(payload: GetUserByIdPayload): Promise<AdminUser> {
    await assertAdmin(payload.requestingUserId);
    const raw = await prisma.user.findUnique({ where: { id: payload.targetUserId }, select: USER_SELECT });
    if (!raw) throw new AppError(status.NOT_FOUND, ADMIN_USERS_MESSAGES.NOT_FOUND);
    return toAdminUser(raw);
  },

  async suspendUser(payload: UserMutationPayload): Promise<AdminUser> {
    await assertAdmin(payload.requestingUserId);
    if (payload.targetUserId === payload.requestingUserId) throw new AppError(status.BAD_REQUEST, ADMIN_USERS_MESSAGES.CANNOT_SELF);
    const user = await prisma.user.findUnique({ where: { id: payload.targetUserId }, select: { id: true, isDeleted: true } });
    if (!user) throw new AppError(status.NOT_FOUND, ADMIN_USERS_MESSAGES.NOT_FOUND);
    if (user.isDeleted) throw new AppError(status.GONE, ADMIN_USERS_MESSAGES.ALREADY_DELETED);
    await prisma.user.update({ where: { id: payload.targetUserId }, data: { status: "SUSPENDED" } });
    return this.getUserById(payload);
  },

  async reactivateUser(payload: UserMutationPayload): Promise<AdminUser> {
    await assertAdmin(payload.requestingUserId);
    const user = await prisma.user.findUnique({ where: { id: payload.targetUserId }, select: { id: true, isDeleted: true } });
    if (!user) throw new AppError(status.NOT_FOUND, ADMIN_USERS_MESSAGES.NOT_FOUND);
    if (user.isDeleted) throw new AppError(status.GONE, ADMIN_USERS_MESSAGES.ALREADY_DELETED);
    await prisma.user.update({ where: { id: payload.targetUserId }, data: { status: "ACTIVE" } });
    return this.getUserById(payload);
  },

  async deleteUser(payload: UserMutationPayload): Promise<void> {
    await assertAdmin(payload.requestingUserId);
    if (payload.targetUserId === payload.requestingUserId) throw new AppError(status.BAD_REQUEST, ADMIN_USERS_MESSAGES.CANNOT_SELF);
    const user = await prisma.user.findUnique({ where: { id: payload.targetUserId }, select: { id: true, isDeleted: true } });
    if (!user) throw new AppError(status.NOT_FOUND, ADMIN_USERS_MESSAGES.NOT_FOUND);
    if (user.isDeleted) throw new AppError(status.GONE, ADMIN_USERS_MESSAGES.ALREADY_DELETED);
    await prisma.user.update({ where: { id: payload.targetUserId }, data: { isDeleted: true, deletedAt: new Date(), status: "SUSPENDED" } });
  },

  async promoteToAdmin(payload: UserMutationPayload): Promise<AdminUser> {
    await assertAdmin(payload.requestingUserId);
    const user = await prisma.user.findUnique({ where: { id: payload.targetUserId }, select: { id: true, isDeleted: true } });
    if (!user) throw new AppError(status.NOT_FOUND, ADMIN_USERS_MESSAGES.NOT_FOUND);
    if (user.isDeleted) throw new AppError(status.GONE, ADMIN_USERS_MESSAGES.ALREADY_DELETED);
    await prisma.user.update({ where: { id: payload.targetUserId }, data: { role: "ADMIN" } });
    return this.getUserById(payload);
  },

  async demoteFromAdmin(payload: UserMutationPayload): Promise<AdminUser> {
    await assertAdmin(payload.requestingUserId);
    if (payload.targetUserId === payload.requestingUserId) throw new AppError(status.BAD_REQUEST, ADMIN_USERS_MESSAGES.CANNOT_SELF);
    const user = await prisma.user.findUnique({ where: { id: payload.targetUserId }, select: { id: true, isDeleted: true } });
    if (!user) throw new AppError(status.NOT_FOUND, ADMIN_USERS_MESSAGES.NOT_FOUND);
    if (user.isDeleted) throw new AppError(status.GONE, ADMIN_USERS_MESSAGES.ALREADY_DELETED);
    await prisma.user.update({ where: { id: payload.targetUserId }, data: { role: "USER" } });
    return this.getUserById(payload);
  },

  async inviteUser(payload: InviteUserPayload): Promise<{ email: string; role: string }> {
    await assertAdmin(payload.requestingUserId);
    const { email, role } = payload;
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) throw new AppError(status.CONFLICT, ADMIN_USERS_MESSAGES.ALREADY_EXISTS);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.verification.upsert({ where: { id: `invite-${email}` }, update: { value: role, expiresAt, updatedAt: new Date() }, create: { id: `invite-${email}`, identifier: email, value: role, expiresAt, createdAt: new Date(), updatedAt: new Date() } });
    return { email, role };
  },

  async bulkSuspend(payload: BulkActionPayload): Promise<{ count: number }> {
    await assertAdmin(payload.requestingUserId);
    const ids = payload.userIds.filter((id) => id !== payload.requestingUserId);
    return prisma.user.updateMany({ where: { id: { in: ids }, isDeleted: false, status: { not: "SUSPENDED" } }, data: { status: "SUSPENDED" } });
  },

  async bulkDelete(payload: BulkActionPayload): Promise<{ count: number }> {
    await assertAdmin(payload.requestingUserId);
    const ids = payload.userIds.filter((id) => id !== payload.requestingUserId);
    return prisma.user.updateMany({ where: { id: { in: ids }, isDeleted: false }, data: { isDeleted: true, deletedAt: new Date(), status: "SUSPENDED" } });
  },
};