import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { analyticsService }   from "./owner-analytics.service";
import { ANALYTICS_MESSAGES } from "./owner-analytics.constants";
import { AnalyticsQuery }     from "./owner-analytics.interface";

export const analyticsController = {

  /* ── GET /api/workspaces/:workspaceId/analytics/summary ──────── */

  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getSummary({
        workspaceId:      req.params.workspaceId as string,
        requestingUserId: req.user!.id as string,
        query:            req.query as unknown as AnalyticsQuery,
      });
      res.status(status.OK).json({ success: true, message: ANALYTICS_MESSAGES.SUMMARY_FETCHED, data });
    } catch (e) { next(e); }
  },

  /* ── GET /api/workspaces/:workspaceId/analytics/growth ───────── */

  async getSubscriberGrowth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getSubscriberGrowth({
        workspaceId:      req.params.workspaceId as string,
        requestingUserId: req.user!.id as string,
        query:            req.query as unknown as AnalyticsQuery,
      });
      res.status(status.OK).json({ success: true, message: ANALYTICS_MESSAGES.GROWTH_FETCHED, data });
    } catch (e) { next(e); }
  },

  /* ── GET /api/workspaces/:workspaceId/analytics/funnel ───────── */

  async getReferralFunnel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getReferralFunnel({
        workspaceId:      req.params.workspaceId as string,
        requestingUserId: req.user!.id as string,
        query:            req.query as unknown as AnalyticsQuery,
      });
      res.status(status.OK).json({ success: true, message: ANALYTICS_MESSAGES.FUNNEL_FETCHED, data });
    } catch (e) { next(e); }
  },

  /* ── GET /api/workspaces/:workspaceId/analytics/kfactor ──────── */

  async getViralKFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getViralKFactor({
        workspaceId:      req.params.workspaceId as string,
        requestingUserId: req.user!.id as string,
        query:            req.query as unknown as AnalyticsQuery,
      });
      res.status(status.OK).json({ success: true, message: ANALYTICS_MESSAGES.KFACTOR_FETCHED, data });
    } catch (e) { next(e); }
  },

  /* â”€â”€ GET /api/workspaces/:workspaceId/analytics/confirmation â”€â”€â”€â”€â”€â”€â”€ */

  async getConfirmationRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getConfirmationRate({
        workspaceId:      req.params.workspaceId as string,
        requestingUserId: req.user!.id as string,
        query:            req.query as unknown as AnalyticsQuery,
      });
      res.status(status.OK).json({ success: true, message: ANALYTICS_MESSAGES.CONFIRMATION_FETCHED, data });
    } catch (e) { next(e); }
  },

  /* ── GET /api/workspaces/:workspaceId/analytics/referrers ─────── */

  async getTopReferrers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getTopReferrers({
        workspaceId:      req.params.workspaceId as string,
        requestingUserId: req.user!.id as string,
        query:            req.query as unknown as AnalyticsQuery,
      });
      res.status(status.OK).json({ success: true, message: ANALYTICS_MESSAGES.REFERRERS_FETCHED, data });
    } catch (e) { next(e); }
  },

  /* ── GET /api/workspaces/:workspaceId/analytics/waitlists ─────── */

  async getWaitlistComparison(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getWaitlistComparison({
        workspaceId:      req.params.workspaceId as string,
        requestingUserId: req.user!.id as string,
        query:            req.query as unknown as AnalyticsQuery,
      });
      res.status(status.OK).json({ success: true, message: ANALYTICS_MESSAGES.WAITLISTS_FETCHED, data });
    } catch (e) { next(e); }
  },

  /* ── GET /api/workspaces/:workspaceId/analytics/cohorts ──────── */

  async getCohortRetention(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getCohortRetention({
        workspaceId:      req.params.workspaceId as string,
        requestingUserId: req.user!.id as string,
        query:            req.query as unknown as AnalyticsQuery,
      });
      res.status(status.OK).json({ success: true, message: ANALYTICS_MESSAGES.COHORT_FETCHED, data });
    } catch (e) { next(e); }
  },

  /* ── GET /api/workspaces/:workspaceId/analytics/revenue ──────── */

  async getRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getRevenue({
        workspaceId:      req.params.workspaceId as string,
        requestingUserId: req.user!.id as string,
        query:            req.query as unknown as AnalyticsQuery,
      });
      res.status(status.OK).json({ success: true, message: ANALYTICS_MESSAGES.REVENUE_FETCHED, data });
    } catch (e) { next(e); }
  },

  /* ── GET /api/workspaces/:workspaceId/analytics/feedback ─────── */

  async getFeedbackActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getFeedbackActivity({
        workspaceId:      req.params.workspaceId as string,
        requestingUserId: req.user!.id as string,
        query:            req.query as unknown as AnalyticsQuery,
      });
      res.status(status.OK).json({ success: true, message: ANALYTICS_MESSAGES.FEEDBACK_FETCHED, data });
    } catch (e) { next(e); }
  },
};
