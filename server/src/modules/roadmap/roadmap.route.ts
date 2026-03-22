import { Router } from "express";
import { roadmapController }   from "./roadmap.controller";
import { validateRequest, validateQuery } from "../../middlewares/validateRequest";
import { validateParams }      from "../../middlewares/validateParams";
import { checkAuth }           from "../../middlewares/checkAuth";
import {
  createRoadmapItemSchema,
  getRoadmapQuerySchema,
  updateRoadmapItemSchema,
  roadmapIdParamSchema,
  roadmapItemIdParamSchema,
} from "./roadmap.validation";
import { Role } from "../../constraint/index";

/**
 * Mount in app.ts:
 *
 *   import { roadmapRouter } from "./modules/roadmap/route";
 *   app.use("/api/roadmap", roadmapRouter);
 *
 * Resulting routes:
 *   POST   /api/roadmap              → create roadmap item   (auth required)
 *   GET    /api/roadmap/:roadmapId   → get public roadmap    (no auth)
 *   PATCH  /api/roadmap/:id          → update roadmap item   (auth required)
 *
 * Auth split rationale:
 *   - POST / PATCH are workspace-member operations (private, write).
 *   - GET is publicly readable (matches isPublic gate in the service).
 */
const router = Router();

/* POST /api/roadmap */
router
  .route("/")
  .post(
    checkAuth(Role.USER, Role.ADMIN),
    validateRequest(createRoadmapItemSchema),
    roadmapController.createRoadmapItem,
  );

/* GET /api/roadmap/:roadmapId — public, no auth */
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
    validateParams(roadmapItemIdParamSchema),
    validateRequest(updateRoadmapItemSchema),
    roadmapController.updateRoadmapItem,
  );

export const roadmapRouter = router;