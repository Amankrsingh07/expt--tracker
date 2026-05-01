"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const toast = useToast();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?unread=1", {
        credentials: "include",
      });

      if (!res.ok) return;

      const json = await res.json();
      setUnreadCount((json.notifications || []).length);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?unread=0", {
        credentials: "include",
      });

      if (!res.ok) return;

      const json = await res.json();
      setNotifications(json.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 15000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open) {
      fetchAll();
    }
  }, [open, fetchAll]);

  const markRead = async (id) => {
    id = Number(id);

    if (!Number.isInteger(id) || id <= 0) {
      toast.push({
        title: "Error",
        message: "Invalid notification id",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Failed to mark read", json);

        toast.push({
          title: "Error",
          message: json.error || "Failed to mark notification as read",
          type: "error",
        });

        fetchUnreadCount();
        return;
      }

      setNotifications((prev) =>
        prev.map((n) => (Number(n.id) === id ? { ...n, read: true } : n))
      );

      fetchUnreadCount();
      fetchAll();
    } catch (err) {
      console.error("Mark read error:", err);

      toast.push({
        title: "Error",
        message: err.message || "Failed to mark notification",
        type: "error",
      });

      fetchUnreadCount();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label="Notifications"
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Notifications</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {unreadCount} unread
            </div>
          </div>

          <div className="max-h-64 overflow-auto space-y-2">
            {notifications.length === 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-2 rounded border ${
                  n.read
                    ? "bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700"
                    : "bg-white dark:bg-slate-800/60 border-indigo-100 dark:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold text-sm">{n.title}</div>

                    {n.body && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {n.body}
                      </div>
                    )}
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs text-indigo-600 hover:underline ml-2"
                    >
                      Mark
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {n.createdAt
                    ? new Date(n.createdAt).toLocaleString()
                    : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}   