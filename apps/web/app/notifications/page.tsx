"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  var router = useRouter();
  var [notifications, setNotifications] = useState<any[]>([]);
  var [unreadCount, setUnreadCount] = useState(0);
  var [isLoading, setIsLoading] = useState(true);

  useEffect(function() { fetchNotifications(); }, []);

  var fetchNotifications = async function() {
    try {
      var r = await fetch("/api/notifications");
      if (r.ok) {
        var d = await r.json();
        setNotifications(d.notifications || []);
        setUnreadCount(d.unreadCount || 0);
      }
    } catch (e) {}
    setIsLoading(false);
  };

  var markAsRead = async function(id: string) {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications(notifications.map(function(n: any) {
      return n.id === id ? { ...n, isRead: true } : n;
    }));
    setUnreadCount(unreadCount - 1);
  };

  var markAllAsRead = async function() {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications(notifications.map(function(n: any) {
      return { ...n, isRead: true };
    }));
    setUnreadCount(0);
  };

  var handleClick = function(notification: any) {
    if (!notification.isRead) markAsRead(notification.id);
    if (notification.link) router.push(notification.link);
  };

  var timeAgo = function(d: string) {
    var diff = Date.now() - new Date(d).getTime();
    var mins = Math.floor(diff / 60000);
    var hrs = Math.floor(diff / 3600000);
    var days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    if (hrs < 24) return hrs + "h ago";
    return days + "d ago";
  };

  var getIcon = function(type: string) {
    if (type === "MESSAGE" || type === "GROUP_MESSAGE") return "💬";
    if (type === "CALL") return "📞";
    if (type === "FOLLOW") return "👋";
    if (type === "REACTION") return "❤️";
    if (type === "COMMENT") return "💭";
    return "🔔";
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={function() { router.back(); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Notifications
              {unreadCount > 0 && <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-20 w-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map(function(n: any) {
              return (
                <button
                  key={n.id}
                  onClick={function() { handleClick(n); }}
                  className={"w-full flex items-start gap-3 px-4 py-3 rounded-2xl transition-all text-left " +
                    (n.isRead
                      ? "hover:bg-gray-50 dark:hover:bg-gray-900"
                      : "bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30")}
                >
                  <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {n.fromUser && (
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{n.fromUser.name}</span>
                      )}
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0"></span>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}