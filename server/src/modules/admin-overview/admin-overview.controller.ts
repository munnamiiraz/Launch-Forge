import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { adminOverviewService }    from "./admin-overview.service";
import { ADMIN_OVERVIEW_MESSAGES } from "./admin-overview.constants";
import { GrowthQuery }             from "./admin-overview.interface";

export const adminOverviewController = {

  /* ── GET /api/admin/overview/kpis ────────────────────────────── */

  async getKpis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminOverviewService.getKpis({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_OVERVIEW_MESSAGES.KPIS_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/overview/revenue ─────────────────────────── */

  async getRevenueTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminOverviewService.getRevenueTrend({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_OVERVIEW_MESSAGES.REVENUE_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/overview/growth?range=30d ────────────────── */

  async getUserGrowth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminOverviewService.getUserGrowth({
        requestingUserId: req.user!.id,
        query:            req.query as unknown as GrowthQuery,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_OVERVIEW_MESSAGES.GROWTH_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/overview/plans ───────────────────────────── */

  async getPlanBreakdown(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminOverviewService.getPlanBreakdown({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_OVERVIEW_MESSAGES.PLANS_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/overview/sources ─────────────────────────── */

  async getSignupSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminOverviewService.getSignupSources({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_OVERVIEW_MESSAGES.SOURCES_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/overview/activity ────────────────────────── */

  async getRecentActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminOverviewService.getRecentActivity({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_OVERVIEW_MESSAGES.ACTIVITY_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/overview/health ──────────────────────────── */

  async getSystemHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminOverviewService.getSystemHealth({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_OVERVIEW_MESSAGES.HEALTH_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/overview/top-waitlists ───────────────────── */

  async getTopWaitlists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminOverviewService.getTopWaitlists({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_OVERVIEW_MESSAGES.WAITLISTS_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/overview/recent-users ────────────────────── */

  async getRecentUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminOverviewService.getRecentUsers({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_OVERVIEW_MESSAGES.USERS_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },
};