import { Router } from "express";
import { notificationController } from "./notification.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

// Real-time stream (Auth protected)
router.get("/stream", authMiddleware, notificationController.stream);

// Fetch & Manage
router.get("/my", authMiddleware, notificationController.getMyNotifications);
router.patch("/:id/read", authMiddleware, notificationController.markRead);
router.post("/read-all", authMiddleware, notificationController.markAllRead);

export const notificationRouter = router;
