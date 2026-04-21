import { EventEmitter } from "events";

/**
 * Global Event Bus for the application.
 * Allows decoupling of services (e.g., SubscriberService doesn't need to know about NotificationService).
 */
class AppEventEmitter extends EventEmitter {}

export const appEvents = new AppEventEmitter();

// Event Constants
export const EVENTS = {
  NOTIFICATION : {
    CREATED : "notification.created",
  },
  SUBSCRIBER : {
    CREATED : "subscriber.created",
  },
  WORKSPACE : {
    MEMBER_ADDED : "workspace.member_added",
  },
  SYSTEM : {
    SECURITY_SHIELD_BAN : "system.security_shield_ban",
  }
};
