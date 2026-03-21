import { Router } from "express";
import { exploreController }  from "./explore.controller";
import { validateQuery }      from "../../middlewares/validateRequest";
import { validateParams }     from "../../middlewares/validateParams";
import {
  exploreQuerySchema,
  exploreSlugParamSchema,
} from "./explore.validation";

/**
 * Mount in app.ts:
 *
 *   import { exploreRouter } from "./modules/explore/route";
 *   app.use("/api/explore", exploreRouter);
 *
 * ─────────────────────────────────────────────────────────────────
 * Routes — NO authentication required on any explore endpoint.
 * These are the public discovery surfaces for the /explore page.
 * ─────────────────────────────────────────────────────────────────
 *
 *  GET /api/explore/waitlists
 *    List all public waitlists. Supports:
 *      ?search=       — search name + description
 *      ?sort=         — trending | newest | most-joined | closing-soon
 *      ?openOnly=     — true → only isOpen waitlists
 *      ?prizesOnly=   — true → only waitlists with prizes
 *      ?page=1
 *      ?limit=12
 *
 *  GET /api/explore/waitlists/:slug
 *    Full card detail for a single waitlist.
 *    Used to populate the product detail sheet / waitlist page
 *    before the user joins.
 */
const router = Router();
//TODO:
router
  .route("/waitlists")
  .get(
    // validateQuery(exploreQuerySchema),
    exploreController.getExploreWaitlists,
  );

router
  .route("/waitlists/:slug")
  .get(
    validateParams(exploreSlugParamSchema),
    exploreController.getExploreWaitlistBySlug,
  );

export const exploreRouter = router;
