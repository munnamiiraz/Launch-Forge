import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { adminUsersService }    from "./admin-user.service";
import { ADMIN_USERS_MESSAGES } from "./admin-user.constants";
import { UsersListQuery }       from "./admin-user.interface";

export const adminUsersController = {

  /* ── GET /api/admin/users ────────────────────────────────────── */

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminUsersService.getUsers({
        requestingUserId: req.user!.id,
        query:            req.query as unknown as UsersListQuery,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_USERS_MESSAGES.LIST_FETCHED,
        data:    result.data,
        meta:    result.meta,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/users/stats ──────────────────────────────── */

  async getUsersStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminUsersService.getUsersStats({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_USERS_MESSAGES.STATS_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/users/:userId ────────────────────────────── */

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminUsersService.getUserById({
        requestingUserId: req.user!.id,
        targetUserId:     req.params.userId as string,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_USERS_MESSAGES.USER_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── PATCH /api/admin/users/:userId/suspend ──────────────────── */

  async suspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminUsersService.suspendUser({
        requestingUserId: req.user!.id,
        targetUserId:     req.params.userId as string,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_USERS_MESSAGES.SUSPENDED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── PATCH /api/admin/users/:userId/reactivate ───────────────── */

  async reactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminUsersService.reactivateUser({
        requestingUserId: req.user!.id,
        targetUserId:     req.params.userId as string,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_USERS_MESSAGES.REACTIVATED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── DELETE /api/admin/users/:userId ─────────────────────────── */

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminUsersService.deleteUser({
        requestingUserId: req.user!.id,
        targetUserId:     req.params.userId as string,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_USERS_MESSAGES.DELETED,
      });
    } catch (e) { next(e); }
  },

  /* ── PATCH /api/admin/users/:userId/promote ──────────────────── */

  async promoteToAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminUsersService.promoteToAdmin({
        requestingUserId: req.user!.id,
        targetUserId:     req.params.userId as string,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_USERS_MESSAGES.PROMOTED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── PATCH /api/admin/users/:userId/demote ───────────────────── */

  async demoteFromAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminUsersService.demoteFromAdmin({
        requestingUserId: req.user!.id,
        targetUserId:     req.params.userId as string,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_USERS_MESSAGES.DEMOTED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── POST /api/admin/users/invite ────────────────────────────── */

  async inviteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminUsersService.inviteUser({
        requestingUserId: req.user!.id,
        email:            req.body.email,
        role:             req.body.role,
      });
      res.status(status.CREATED).json({
        success: true,
        message: ADMIN_USERS_MESSAGES.INVITED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── POST /api/admin/users/bulk/suspend ──────────────────────── */

  async bulkSuspend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { count } = await adminUsersService.bulkSuspend({
        requestingUserId: req.user!.id,
        userIds:          req.body.userIds,
      });
      res.status(status.OK).json({
        success: true,
        message: `${count} ${ADMIN_USERS_MESSAGES.BULK_SUSPENDED}`,
        data:    { count },
      });
    } catch (e) { next(e); }
  },

  /* ── POST /api/admin/users/bulk/delete ───────────────────────── */

  async bulkDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { count } = await adminUsersService.bulkDelete({
        requestingUserId: req.user!.id,
        userIds:          req.body.userIds,
      });
      res.status(status.OK).json({
        success: true,
        message: `${count} ${ADMIN_USERS_MESSAGES.BULK_DELETED}`,
        data:    { count },
      });
    } catch (e) { next(e); }
  },
};