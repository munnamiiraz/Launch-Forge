import { prisma } from "../../lib/prisma";
import { appEvents, EVENTS } from "../../lib/events";

export const notificationService = {
  /**
   * Creates a notification in the database and broadcasts it to real-time listeners.
   */
  async createNotification(data: {
    userId:      string;
    workspaceId?: string;
    type:        string;
    title:       string;
    message:     string;
    link?:       string;
  }) {
    const notification = await prisma.notification.create({
      data,
    });

    // Broadcast to real-time SSE stream
    appEvents.emit(EVENTS.NOTIFICATION.CREATED, notification);
    
    return notification;
  },

  /**
   * Fetches the latest notifications for a user.
   */
  async getUserNotifications(userId: string, limit: number = 20) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  /**
   * Marks a notification as read.
   */
  async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  },

  /**
   * Marks all notifications as read for a user.
   */
  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  /**
   * Gets unread count for the badge.
   */
  async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
};
