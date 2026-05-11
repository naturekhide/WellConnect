"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Bell, Heart, MessageCircle, Users, Check, Mail } from "lucide-react";

export default function NotificationsPage() {
  var router = useRouter();
  var [notifications, setNotifications] = useState<any[]>([]);
  var [unreadCount, setUnreadCount] = useState(0);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");

  useEffect(function() { fetchNotifications(); fetchUserName(); }, []);

  var fetchUserName = async function() { var r = await fetch("/api/auth/session"); if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); } };
  var fetchNotifications = async function() { var r = await fetch("/api/notifications"); if (r.ok) { var d = await r.json(); setNotifications(d.notifications); setUnreadCount(d.unreadCount); } setIsLoading(false); };
  var markAsRead = async function(id?: string) { await fetch("/api/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { notificationId: id } : { markAll: true }) }); if (id) { setNotifications(notifications.map(function(n: any) { return n.id === id ? { ...n, isRead: true } : n; })); setUnreadCount(Math.max(0, unreadCount - 1)); } else { setNotifications(notifications.map(function(n: any) { return { ...n, isRead: true }; })); setUnreadCount(0); } };
  var handleClick = function(n: any) { if (!n.isRead) markAsRead(n.id); if (n.link) router.push(n.link); };
  var getIcon = function(type: string) { switch (type) { case "REACTION": return <Heart className="h-5 w-5 text-pink-500" />; case "COMMENT": return <MessageCircle className="h-5 w-5 text-blue-500" />; case "GROUP_JOIN": return <Users className="h-5 w-5 text-green-500" />; case "MESSAGE": return <Mail className="h-5 w-5 text-purple-500" />; default: return <Bell className="h-5 w-5 text-gray-500" />; } };
  var formatTimeAgo = function(d: string) { var diff = (Date.now() - new Date(d).getTime()) / 60000; if (diff < 1) return "just now"; if (diff < 60) return Math.floor(diff) + "m ago"; if (diff < 1440) return Math.floor(diff / 60) + "h ago"; return Math.floor(diff / 1440) + "d ago"; };

  if (isLoading) return <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"><Header userName={userName} /><div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"><Header userName={userName} /><main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>{unreadCount > 0 && <p className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} unread</p>}</div>{unreadCount > 0 && <button onClick={function() { markAsRead(); }} className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">✓ Mark all as read</button>}</div>
      {notifications.length === 0 ? <div className="rounded-2xl bg-white dark:bg-gray-800 p-12 text-center shadow-sm"><Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" /><p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">No notifications yet</p></div> : <div className="space-y-2">{notifications.map(function(n: any) { return <div key={n.id} onClick={function() { handleClick(n); }} className={"cursor-pointer rounded-xl p-4 shadow-sm transition-all hover:shadow-md " + (n.isRead ? "bg-white dark:bg-gray-800" : "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700")}><div className="flex items-start gap-4"><div className="mt-1">{getIcon(n.type)}</div><div className="flex-1"><p className="text-sm text-gray-900 dark:text-gray-100">{n.message}{n.fromUser && <span className="font-medium ml-1">{n.fromUser.name}{n.fromUser.username && <span className="text-gray-500 dark:text-gray-400 ml-1">@{n.fromUser.username}</span>}</span>}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(n.createdAt)}</p></div>{!n.isRead && <div className="h-2 w-2 rounded-full bg-green-600 flex-shrink-0 mt-2"></div>}</div></div>; })}</div>}
    </main></div>
  );
}