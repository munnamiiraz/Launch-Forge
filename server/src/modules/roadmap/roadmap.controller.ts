import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { roadmapService }   from "./roadmap.service";
import { ROADMAP_MESSAGES } from "./roadmap.constants";
import { GetRoadmapQuery, RoadmapStatus }  from "./roadmap.interface";

export const roadmapController = {

  /* ──────────────────────────────────────────────────────────────
     POST /api/roadmap
     ────────────────────────────────────────────────────────────── */

  async createRoadmapItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requestingUserId = req.user!.id;

      // All fields validated and sanitised by validateRequest
      const {
        roadmapId,
        workspaceId,
        title,
        description,
        status,
        eta,
      } = req.body;

      const result = await roadmapService.createRoadmapItem({
        roadmapId,
        workspaceId,
        requestingUserId,
        title,
        description,
        status,
        eta,
      });

      res.status(status.CREATED).json({
        success: true,
        message: ROADMAP_MESSAGES.ITEM_CREATED,
        data:    result,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/roadmap/:roadmapId
     ────────────────────────────────────────────────────────────── */

  async getRoadmap(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { roadmapId } = req.params;

      // Query params already coerced by validateRequest
      const query = req.query as unknown as GetRoadmapQuery;

      const result = await roadmapService.getRoadmap({ roadmapId: roadmapId as string, query });

      res.status(status.OK).json({
        success: true,
        message: ROADMAP_MESSAGES.FETCHED,
        roadmap: result.roadmap,
        data:    result.items,
        groups:  result.groups,
        counts:  result.counts,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ──────────────────────────────────────────────────────────────
     PATCH /api/roadmap/:id
     ────────────────────────────────────────────────────────────── */

  async updateRoadmapItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const itemId           = req.params.id;
      const requestingUserId = req.user!.id;

      const {
        workspaceId,
        title,
        description,
        status: itemStatus,
        eta,
        sortOrder,
      } = req.body;

      const result = await roadmapService.updateRoadmapItem({
        itemId: itemId as string,
        workspaceId: workspaceId as string,
        requestingUserId: requestingUserId as string,
        title: title as string,
        description: description as string | undefined,
        status: itemStatus as RoadmapStatus,
        eta: eta as Date | undefined,
        sortOrder: sortOrder as number | undefined,
      });

      res.status(status.OK).json({
        success: true,
        message: ROADMAP_MESSAGES.ITEM_UPDATED,
        data:    result,
      });
    } catch (error) {
      next(error);
    }
  },
};