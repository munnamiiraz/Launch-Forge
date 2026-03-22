import { Router } from "express";
import { subscriberController }      from "./subscriber.controller";
import { validateRequest, validateQuery } from "../../middlewares/validateRequest";
import { validateParams }            from "../../middlewares/validateParams";
import { checkAuth }                 from "../../middlewares/checkAuth";
import {
  waitlistIdParamSchema,
  getSubscribersQuerySchema,
  getLeaderboardQuerySchema,
} from "./subscriber.validation";
import { Role } from "../../constraint/index";

const router = Router({ mergeParams: true });
//TODO:
router
  .route("/:id/subscribers")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(waitlistIdParamSchema),
    // validateQuery(getSubscribersQuerySchema),
    subscriberController.getSubscribers,
  );

router
  .route("/:id/leaderboard")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(waitlistIdParamSchema),
    validateQuery(getLeaderboardQuerySchema),
    subscriberController.getLeaderboard,
  );

export const subscriberRouter = router;