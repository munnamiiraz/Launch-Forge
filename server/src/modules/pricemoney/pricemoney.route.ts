import { Router } from "express";
import { prizeController }     from "./pricemoney.controller";
import { validateRequest }     from "../../middlewares/validateRequest";
import { validateParams }      from "../../middlewares/validateParams";
import { checkAuth }           from "../../middlewares/checkAuth";
import {
  createPrizeSchema,
  updatePrizeSchema,
  prizeParamSchema,
  waitlistIdParamSchema,
} from "./pricemoney.validation";
import { Role } from "../../constraint/index";

/**
 * Mount in app.ts:
 *
 *   import { prizeRouter } from "./modules/prize/route";
 *   app.use("/api/prizes", prizeRouter);
 *
 * Routes:
 *   POST   /api/prizes                            → create prize            (OWNER only)
 *   PATCH  /api/prizes/:id                        → update prize            (OWNER only)
 *   DELETE /api/prizes/:id                        → delete prize            (OWNER only)
 *   GET    /api/prizes/waitlist/:waitlistId        → get all prizes          (workspace member)
 *   GET    /api/prizes/public/:waitlistId          → get active prizes       (no auth — public)
 *
 * Auth split:
 *   Write operations (POST, PATCH, DELETE) require OWNER role.
 *   Read by workspace members requires OWNER/ADMIN.
 *   Public read requires no auth.
 */
const router = Router();

/* POST /api/prizes */
router
  .route("/")
  .post(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateRequest(createPrizeSchema),
    prizeController.createPrize,
  );

/* PATCH /api/prizes/:id */
router
  .route("/:id")
  .patch(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(prizeParamSchema),
    validateRequest(updatePrizeSchema),
    prizeController.updatePrize,
  )
// TODO:
/* DELETE /api/prizes/:id */
  .delete(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(prizeParamSchema),
    // validateRequest(
    //   // Only workspaceId + waitlistId needed in body for DELETE
    //   require("zod").z.object({
    //     workspaceId: require("zod").z.string().cuid(),
    //     waitlistId:  require("zod").z.string().cuid(),
    //   }),
    // ),
    prizeController.deletePrize,
  );

/* GET /api/prizes/waitlist/:waitlistId  — authenticated */
router
  .route("/waitlist/:waitlistId")
  .get(
    checkAuth(Role.OWNER, Role.ADMIN),
    validateParams(waitlistIdParamSchema),
    prizeController.getPrizes,
  );

/* GET /api/prizes/public/:waitlistId  — no auth */
router
  .route("/public/:waitlistId")
  .get(
    validateParams(waitlistIdParamSchema),
    prizeController.getPublicPrizes,
  );

export const prizeRouter = router;