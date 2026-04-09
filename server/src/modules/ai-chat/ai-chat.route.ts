import { Router } from "express";
import { Role } from "../../constraint/index";
import { checkAuth } from "../../middlewares/checkAuth";
import { AiChatController } from "./ai-chat.controller";
import { AiInsightsController } from "./ai-insights.controller";
import { checkPlanFeature } from "../../middlewares/checkPlanFeature";

const router = Router();

// POST /api/v1/ai-chat — public chat endpoint
router.post("/chat", AiChatController.chat);

// Dashboard Insights (Pro/Growth only)
router.get(
  "/insights/:workspaceId",
  checkAuth(Role.OWNER),
  checkPlanFeature("aiInsights"),
  AiInsightsController.getDashboardInsights
);

export const AiChatRoutes = router;
