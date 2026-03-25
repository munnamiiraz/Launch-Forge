import { Router } from "express";
import { prizeController }     from "./pricemoney.controller";
import { validateRequest }     from "../../middlewares/validateRequest";
import { validateParams }      from "../../middlewares/validateParams";
import { checkAuth }           from "../../middlewares/checkAuth";
import { checkPlanFeature }    from "../../middlewares/checkPlanFeature";
import {
  createPrizeSchema,
  updatePrizeSchema,
  prizeParamSchema,
  waitlistIdParamSchema,
} from "./pricemoney.validation";
import { Role } from "../../constraint/index";

/**
 * Routes:
 *   POST   /api/prizes                            → create prize            (OWNER only, Pro+)
 *   PATCH  /api/prizes/:id                        → update prize            (OWNER only, Pro+)
 *   DELETE /api/prizes/:id                        → delete prize            (OWNER only, Pro+)
 *   GET    /api/prizes/waitlist/:waitlistId        → get all prizes          (workspace member, Pro+)
 *   GET    /api/prizes/public/:waitlistId          → get active prizes       (no auth — public)
 */
const router = Router();

const planGate = checkPlanFeature("prizeAnnouncements");

/* POST /api/prizes */
router
  .route("/")
  .post(
    checkAuth(Role.OWNER, Role.ADMIN),
    planGate,
    validateRequest(createPrizeSchema),
    prizeController.createPrize,
  );

/* PATCH /api/prizes/:id */
router
  .route("/:id")
  .patch(
    checkAuth(Role.OWNER, Role.ADMIN),
    planGate,
    validateParams(prizeParamSchema),
    validateRequest(updatePrizeSchema),
    prizeController.updatePrize,
  )
/* DELETE /api/prizes/:id */
  .delete(
    checkAuth(Role.OWNER, Role.ADMIN),
    planGate,
    validateParams(prizeParamSchema),
    prizeController.deletePrize,
  );

/* GET /api/prizes/waitlist/:waitlistId  — authenticated, plan-gated */
router
  .route("/waitlist/:waitlistId")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    planGate,
    validateParams(waitlistIdParamSchema),
    prizeController.getPrizes,
  );

/* GET /api/prizes/public/:waitlistId  — no auth, no plan gate (public) */
router
  .route("/public/:waitlistId")
  .get(
    validateParams(waitlistIdParamSchema),
    prizeController.getPublicPrizes,
  );

export const prizeRouter = router;