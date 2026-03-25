import { Router } from "express";
import { roadmapController }   from "./roadmap.controller";
import { validateRequest, validateQuery } from "../../middlewares/validateRequest";
import { validateParams }      from "../../middlewares/validateParams";
import { checkAuth }           from "../../middlewares/checkAuth";
import { checkPlanFeature }    from "../../middlewares/checkPlanFeature";
import {
  createRoadmapItemSchema,
  getRoadmapQuerySchema,
  updateRoadmapItemSchema,
  roadmapIdParamSchema,
  roadmapItemIdParamSchema,
} from "./roadmap.validation";
import { Role } from "../../constraint/index";

/**
 * Routes:
 *   POST   /api/roadmap              → create roadmap item   (auth required, Pro+)
 *   GET    /api/roadmap/:roadmapId   → get public roadmap    (no auth)
 *   PATCH  /api/roadmap/:id          → update roadmap item   (auth required, Pro+)
 */
const router = Router();

const planGate = checkPlanFeature("roadmap");

/* POST /api/roadmap */
router
  .route("/")
  .post(
    checkAuth(Role.USER, Role.ADMIN),
    planGate,
    validateRequest(createRoadmapItemSchema),
    roadmapController.createRoadmapItem,
  );

/* GET /api/roadmap/:roadmapId — public, no auth, no plan gate */
router
  .route("/:roadmapId")
  .get(
    validateParams(roadmapIdParamSchema),
    validateQuery(getRoadmapQuerySchema),
    roadmapController.getRoadmap,
  );

/* PATCH /api/roadmap/:id */
router
  .route("/:id")
  .patch(
    checkAuth(Role.USER, Role.ADMIN),
    planGate,
    validateParams(roadmapItemIdParamSchema),
    validateRequest(updateRoadmapItemSchema),
    roadmapController.updateRoadmapItem,
  );

export const roadmapRouter = router;