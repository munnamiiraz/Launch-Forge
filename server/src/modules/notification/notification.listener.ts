import { appEvents, EVENTS } from "../../lib/events";
import { notificationService } from "./notification.service";
import { prisma } from "../../lib/prisma";

/**
 * Global listener for system events that should trigger notifications.
 */
export const initNotificationListeners = () => {
  // 1. Listen for new subscribers
  appEvents.on(EVENTS.SUBSCRIBER.CREATED, async (data: { waitlistId: string, subscriber: any }) => {
    try {
      // Find the workspace owner
      const waitlist = await prisma.waitlist.findUnique({
        where: { id: data.waitlistId },
        include: { workspace: true }
      });

      if (waitlist?.workspace?.ownerId) {
        await notificationService.createNotification({
          userId:      waitlist.workspace.ownerId,
          workspaceId: waitlist.workspaceId,
          type:        "SUCCESS",
          title:       "New Subscriber! 🎉",
          message:     `${data.subscriber.email} just joined your waitlist "${waitlist.name}".`,
          link:        `/admin/workspaces/${waitlist.workspaceId}/waitlists/${waitlist.id}/subscribers`
        });
      }
    } catch (error) {
      console.error("[NotificationListener] Error handling subscriber.created:", error);
    }
  });

  // 2. Listen for security bans
  appEvents.on(EVENTS.SYSTEM.SECURITY_SHIELD_BAN, async (data: { ip: string, reason: string }) => {
    try {
      // Notify all SUPER_ADMINS or system owners? 
      // For now, let's notify the primary system admin (first user with ADMIN role)
      const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" }
      });

      if (admin) {
        await notificationService.createNotification({
          userId:  admin.id,
          type:    "WARNING",
          title:   "Security Shield Active 🛡️",
          message: `IP ${data.ip} has been automatically banned. Reason: ${data.reason}`,
          link:    `/admin/audit-logs`
        });
      }
    } catch (error) {
      console.error("[NotificationListener] Error handling security_shield_ban:", error);
    }
  });

  console.log("🔔 [Notification System] Listeners initialized.");
};
