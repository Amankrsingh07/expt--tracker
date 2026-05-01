"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?unread=0", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const j = await res.json();
      setNotifications(j.notifications || []);
    } catch (err) {
      console.error(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      const res = await fetch('/api/notifications/mark-all', { method: 'PUT', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to mark all');
      await fetchNotifications();
    } catch (err) {
      console.error(err);
      alert('Failed to mark all notifications as read');
    }
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <Button onClick={markAllRead} disabled={notifications.length===0}>
            Mark all read
          </Button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-500">No notifications</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`p-3 rounded border ${n.read ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="font-semibold">{n.title}</div>
                {n.body && <div className="text-sm text-gray-600">{n.body}</div>}
                <div className="text-xs text-gray-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
