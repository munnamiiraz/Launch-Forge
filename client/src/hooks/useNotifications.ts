"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner"; // Assuming sonner is used for toasts

export interface Notification {
  id:          string;
  type:        "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  title:       string;
  message:     string;
  isRead:      boolean;
  link?:       string;
  createdAt:   string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/notifications/my");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
        setUnreadCount(json.data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Setup SSE Stream
    const eventSource = new EventSource("/api/v1/notifications/stream");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "CONNECTED") return;

      // New notification received
      const newNotification = data as Notification;
      
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show a toast
      toast(newNotification.title, {
        description: newNotification.message,
        action: newNotification.link ? {
          label: "View",
          onClick: () => window.location.href = newNotification.link!
        } : undefined
      });
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/v1/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    refresh: fetchNotifications
  };
};
