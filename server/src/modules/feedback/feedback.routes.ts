import { Router } from "express";
import { feedbackController }            from "./feedback.controller";
import { validateRequest, validateQuery }               from "../../middlewares/validateRequest";
import { validateParams }                from "../../middlewares/validateParams";
import {
  submitFeedbackSchema,
  getFeedbackQuerySchema,
  voteSchema,
  feedbackBoardIdParamSchema,
  featureRequestIdParamSchema,
} from "./feedback.validation";

/**
 * Feedback routes — NO authentication required.
 * These are public-facing endpoints consumed by the feedback board widget.
 *
 * Mount in app.ts:
 *
 *   import { feedbackRouter } from "./modules/feedback/route";
 *   app.use("/api/feedback", feedbackRouter);
 *
 * Resulting routes:
 *   POST  /api/feedback                    → submit a feature request
 *   GET   /api/feedback/:boardId           → list all feedback for a board
 *   POST  /api/feedback/:id/vote           → upvote a feature request
 *
 * Rate-limiting should be applied at the reverse proxy or via a
 * rate-limit middleware mounted before this router, particularly
 * on POST /vote to prevent ballot stuffing.
 */
const router = Router();

/* POST /api/feedback */
router
  .route("/")
  .post(
    validateRequest(submitFeedbackSchema),
    feedbackController.submitFeedback,
  );

/* GET /api/feedback/:boardId */
router
  .route("/:boardId")
  .get(
    validateParams(feedbackBoardIdParamSchema),
    validateQuery(getFeedbackQuerySchema),
    feedbackController.getFeedback,
  );

/* POST /api/feedback/:id/vote */
router
  .route("/:id/vote")
  .post(
    validateParams(featureRequestIdParamSchema),
    validateRequest(voteSchema),
    feedbackController.voteFeedback,
  );

export const feedbackRouter = router;