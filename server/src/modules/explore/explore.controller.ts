import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { exploreService }   from "./explore.service";
import { EXPLORE_MESSAGES } from "./explore.constant";
import { ExploreQuery }     from "./explore.interface";

export const exploreController = {

  /* ── GET /api/explore/waitlists ──────────────────────────────── */

  async getExploreWaitlists(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query = req.query as unknown as ExploreQuery;

      const result = await exploreService.getExploreWaitlists({ query });

      res.status(status.OK).json({
        success: true,
        message: EXPLORE_MESSAGES.LIST_FETCHED,
        data:    result.data,
        meta:    result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ── GET /api/explore/waitlists/:slug ────────────────────────── */

  async getExploreWaitlistBySlug(
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { slug } = req.params;

      const data = await exploreService.getExploreWaitlistBySlug({ slug: slug as string });

      res.status(status.OK).json({
        success: true,
        message: EXPLORE_MESSAGES.LIST_FETCHED,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};