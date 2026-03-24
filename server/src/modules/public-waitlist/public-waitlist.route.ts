import { Router } from "express";
import { publicWaitlistController }    from "./public-waitlist.controller";
import { validateRequest }             from "../../middlewares/validateRequest";
import { validateParams }              from "../../middlewares/validateParams";
import {
  publicWaitlistSlugParamSchema,
  joinWaitlistSchema,
} from "./public-waitlist.validation";

/**
 * Public routes — NO authentication required.
 * These endpoints are consumed directly by the public waitlist sign-up page.
 *
 * Mount in app.ts:
 *
 *   import { publicWaitlistRouter } from "./modules/waitlist/public-waitlist/route";
 *   app.use("/api/public/waitlist", publicWaitlistRouter);
 *
 * Resulting routes:
 *   GET  /api/public/waitlist/:slug
 *   POST /api/public/waitlist/:slug/join
 *
 * Rate-limiting should be applied at the reverse proxy or via a rate-limit
 * middleware mounted before this router — not inside the route file.
 */
const router = Router();

router
  .route("/:slug")
  .get(
    validateParams(publicWaitlistSlugParamSchema),
    publicWaitlistController.getPublicWaitlist,
  );

router
  .route("/:slug/join")
  .post(
    validateParams(publicWaitlistSlugParamSchema),
    validateRequest(joinWaitlistSchema),
    publicWaitlistController.joinWaitlist,
  );

/**
 * Get subscriber's position in the waitlist by email
 * GET /api/public/waitlist/:slug/position?email=user@example.com
 */
router
  .route("/:slug/position")
  .get(
    validateParams(publicWaitlistSlugParamSchema),
    publicWaitlistController.getSubscriberPosition,
  );

export const publicWaitlistRouter = router;