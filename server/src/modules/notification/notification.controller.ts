import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { notificationService } from "./notification.service";
import { appEvents, EVENTS } from "../../lib/events";

export const notificationController = {
  /**
   * SSE Stream: Real-time notifications
   */
  async stream(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(status.UNAUTHORIZED).end();
    }

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Event listener for new notifications
    const onNotification = (notification: any) => {
      // Only send if it matches the current user
      if (notification.userId === userId) {
        res.write(`data: ${JSON.stringify(notification)}\n\n`);
      }
    };

    appEvents.on(EVENTS.NOTIFICATION.CREATED, onNotification);

    // Initial heart beat to keep connection alive
    res.write('data: {"type": "CONNECTED"}\n\n');

    // Handle client disconnect
    req.on("close", () => {
      appEvents.off(EVENTS.NOTIFICATION.CREATED, onNotification);
    });
  },

  /**
   * Get all notifications for user
   */
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const notifications = await notificationService.getUserNotifications(userId);
      res.status(status.OK).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark notification as read
   */
  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      await notificationService.markAsRead(id as string, userId);
      res.status(status.OK).json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark all as read
   */
  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await notificationService.markAllAsRead(userId);
      res.status(status.OK).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  }
};
