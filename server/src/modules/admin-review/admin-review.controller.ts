import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { adminRevenueService }    from "./admin-review.service";
import { ADMIN_REVENUE_MESSAGES } from "./admin-review.constants";
import { TransactionsQuery }      from "./admin-review.interface";

export const adminRevenueController = {

  /* ── GET /api/admin/revenue/kpis ─────────────────────────────── */

  async getKpis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminRevenueService.getKpis({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_REVENUE_MESSAGES.KPIS_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/revenue/waterfall ────────────────────────── */

  async getMrrWaterfall(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminRevenueService.getMrrWaterfall({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_REVENUE_MESSAGES.WATERFALL_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/revenue/plans ────────────────────────────── */

  async getPlanRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminRevenueService.getPlanRevenue({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_REVENUE_MESSAGES.PLANS_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/revenue/churn ────────────────────────────── */

  async getChurnAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminRevenueService.getChurnAnalysis({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_REVENUE_MESSAGES.CHURN_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/revenue/cohorts ──────────────────────────── */

  async getCohortLtv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminRevenueService.getCohortLtv({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_REVENUE_MESSAGES.COHORT_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/revenue/countries ────────────────────────── */

  async getRevenueByCountry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminRevenueService.getRevenueByCountry({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_REVENUE_MESSAGES.COUNTRIES_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/revenue/transactions ─────────────────────── */

  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminRevenueService.getTransactions({
        requestingUserId: req.user!.id,
        query:            req.query as unknown as TransactionsQuery,
      });
      res.status(status.OK).json({
        success:      true,
        message:      ADMIN_REVENUE_MESSAGES.TRANSACTIONS_FETCHED,
        data:         result.data,
        meta:         result.meta,
        totalRevenue: result.totalRevenue,
      });
    } catch (e) { next(e); }
  },
};