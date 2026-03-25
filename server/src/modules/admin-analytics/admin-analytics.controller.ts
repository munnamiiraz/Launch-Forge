import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { adminAnalyticsService }   from "./admin-analytics.service";
import { ADMIN_ANALYTICS_MESSAGES } from "./admin-analytics.constants";
import { EngagementTimelinePayload } from "./admin-analytics.interface";

export const adminAnalyticsController = {

  /* ── GET /api/admin/analytics/engagement ─────────────────────── */

  async getEngagementStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminAnalyticsService.getEngagementStats({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_ANALYTICS_MESSAGES.ENGAGEMENT_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/analytics/engagement/timeline?range= ─────── */

  async getEngagementTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminAnalyticsService.getEngagementTimeline({
        requestingUserId: req.user!.id,
        range:            req.query.range as EngagementTimelinePayload["range"],
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_ANALYTICS_MESSAGES.TIMELINE_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/analytics/features ───────────────────────── */

  async getFeatureAdoption(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminAnalyticsService.getFeatureAdoption({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_ANALYTICS_MESSAGES.FEATURES_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/analytics/subscribers ────────────────────── */

  async getPlatformSubscribers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminAnalyticsService.getPlatformSubscribers({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_ANALYTICS_MESSAGES.SUBSCRIBERS_FETCHED,
        data:    result.timeline,
        stats:   result.stats,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/analytics/waitlists ──────────────────────── */

  async getWaitlistHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminAnalyticsService.getWaitlistHealth({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_ANALYTICS_MESSAGES.WAITLISTS_FETCHED,
        data:    result.buckets,
        stats:   result.stats,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/analytics/referrals ──────────────────────── */

  async getReferralNetwork(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminAnalyticsService.getReferralNetwork({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_ANALYTICS_MESSAGES.REFERRALS_FETCHED,
        data:    result.timeline,
        stats:   result.stats,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/analytics/feedback ───────────────────────── */

  async getFeedbackHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminAnalyticsService.getFeedbackHealth({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_ANALYTICS_MESSAGES.FEEDBACK_FETCHED,
        data: {
          statusBreakdown: result.statusBreakdown,
          timeline:        result.timeline,
        },
        stats: result.stats,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/analytics/roadmap ────────────────────────── */

  async getRoadmapProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminAnalyticsService.getRoadmapProgress({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_ANALYTICS_MESSAGES.ROADMAP_FETCHED,
        data:    result.progress,
        stats:   result.stats,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/analytics/changelog ──────────────────────── */

  async getChangelogTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminAnalyticsService.getChangelogTimeline({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_ANALYTICS_MESSAGES.CHANGELOG_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },

  /* ── GET /api/admin/analytics/heatmap ────────────────────────── */

  async getWorkspaceHeatmap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminAnalyticsService.getWorkspaceHeatmap({
        requestingUserId: req.user!.id,
      });
      res.status(status.OK).json({
        success: true,
        message: ADMIN_ANALYTICS_MESSAGES.HEATMAP_FETCHED,
        data,
      });
    } catch (e) { next(e); }
  },
};