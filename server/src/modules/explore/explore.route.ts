import { Router } from "express";
import { exploreController }  from "./explore.controller";
import { validateParams }     from "../../middlewares/validateParams";
import {
  exploreSlugParamSchema,
} from "./explore.validation";

const router = Router();
router
  .route("/waitlists")
  .get(
    exploreController.getExploreWaitlists,
  );

router
  .route("/waitlists/:slug")
  .get(
    validateParams(exploreSlugParamSchema),
    exploreController.getExploreWaitlistBySlug,
  );

export const exploreRouter = router;
