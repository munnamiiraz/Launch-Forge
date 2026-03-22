import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { feedbackService }    from "./feedback.service";
import { FEEDBACK_MESSAGES }  from "./feedback.constants";
import { GetFeedbackQuery }   from "./feedback.interface";

export const feedbackController = {

  /* ──────────────────────────────────────────────────────────────
     POST /api/feedback
     ────────────────────────────────────────────────────────────── */

  async submitFeedback(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // All fields already validated and sanitised by validateRequest
      const { boardId, title, description, authorEmail, authorName } = req.body;

      const result = await feedbackService.submitFeedback({
        boardId,
        title,
        description,
        authorEmail,
        authorName,
      });

      res.status(status.CREATED).json({
        success: true,
        message: FEEDBACK_MESSAGES.SUBMITTED,
        data:    result,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/feedback/:boardId
     ────────────────────────────────────────────────────────────── */

  async getFeedback(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const boardId = req.params.boardId;

      // Query params coerced + validated by validateRequest
      const query = req.query as unknown as GetFeedbackQuery;

      const result = await feedbackService.getFeedback({ boardId: boardId as string, query });

      res.status(status.OK).json({
        success: true,
        message: FEEDBACK_MESSAGES.FETCHED,
        board:   result.board,
        data:    result.data,
        meta:    result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  /* ──────────────────────────────────────────────────────────────
     POST /api/feedback/:id/vote
     ────────────────────────────────────────────────────────────── */

  async voteFeedback(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const featureRequestId = req.params.id;
      const { voterEmail }   = req.body;

      const result = await feedbackService.voteFeedback({
        featureRequestId: featureRequestId as string,
        voterEmail: voterEmail as string,
      });

      const message = result.voted
        ? FEEDBACK_MESSAGES.VOTED
        : FEEDBACK_MESSAGES.ALREADY_VOTED;

      res.status(status.OK).json({
        success: true,
        message,
        data:    result,
      });
    } catch (error) {
      next(error);
    }
  },
};