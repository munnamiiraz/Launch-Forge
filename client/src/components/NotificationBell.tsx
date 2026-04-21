"use client";

import React, { useState } from "react";
import { Bell, Check, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, Notification } from "../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={togglePanel}
        className="relative p-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-slate-900"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Slide-over Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={togglePanel}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Notifications</h2>
                  <p className="text-xs text-slate-400">Stay updated with your workspaces</p>
                </div>
                <button
                  onClick={togglePanel}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Actions */}
              {notifications.length > 0 && unreadCount > 0 && (
                <div className="px-4 py-2 border-b border-slate-800/50 flex justify-end">
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all as read
                  </button>
                </div>
              )}

              {/* List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-slate-300 font-medium">All caught up!</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      No notifications yet. New events will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {notifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <button className="w-full py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
                  View full audit logs
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const isSecurity = notification.type === "WARNING" || notification.type === "ERROR";

  return (
    <div className={`p-4 transition-colors hover:bg-slate-800/40 relative group ${!notification.isRead ? "bg-indigo-500/5" : ""}`}>
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
      )}
      
      <div className="flex gap-3">
        <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          notification.type === "SUCCESS" ? "bg-emerald-500/10 text-emerald-500" :
          notification.type === "WARNING" ? "bg-amber-500/10 text-amber-500" :
          notification.type === "ERROR" ? "bg-rose-500/10 text-rose-500" :
          "bg-indigo-500/10 text-indigo-500"
        }`}>
          {notification.type === "SUCCESS" ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-semibold truncate ${!notification.isRead ? "text-white" : "text-slate-300"}`}>
              {notification.title}
            </h4>
            <span className="text-[10px] text-slate-500 whitespace-nowrap mt-0.5">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {notification.message}
          </p>
          
          {notification.link && (
            <a
              href={notification.link}
              className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Action required
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
