"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Camera, Film, Users, MessageCircle, Search, User, Bell, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";
import { Bookmark } from "lucide-react";

export default function Sidebar() {
  var router = useRouter();
  var pathname = usePathname();
  var { dark, toggle } = useTheme();
  var [unreadCount, setUnreadCount] = useState(0);
  var [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(function() {
    fetchUnread();
    var interval = setInterval(fetchUnread, 5000);
    return function() { clearInterval(interval); };
  }, []);

  var fetchUnread = async function() {
    try {
      var msgR = await fetch("/api/messages");
      var notifR = await fetch("/api/notifications");
      if (msgR.ok) {
        var data = await msgR.json();
        var total = data.reduce(function(s: number, c: any) { return s + (c.unreadCount || 0); }, 0);
        setUnreadCount(total);
      }
      if (notifR.ok) {
        var nData = await notifR.json();
        setUnreadNotifs(nData.unreadCount || 0);
      }
    } catch (e) {}
  };

  var isActive = function(path: string) { return pathname === path || pathname.startsWith(path + "/"); };

  var tabs = [
    { href: "/feed", icon: Home, label: "Feed" },
    { href: "/stories", icon: Camera, label: "Stories" },
    { href: "/reels", icon: Film, label: "Reels" },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/messages", icon: MessageCircle, label: "Messages", badge: unreadCount },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/notifications", icon: Bell, label: "Notifications", badge: unreadNotifs },
  ];

  return (
    <div className="w-16 bg-[#f0f2f5] dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 flex flex-col items-center py-3 gap-1 h-screen flex-shrink-0">
      {tabs.map(function(tab: any) {
        var Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={"relative p-3 rounded-lg transition-colors " + (isActive(tab.href) ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700")}
            title={tab.label}
          >
            <Icon className="h-5 w-5" />
            {tab.badge > 0 && (
              <span className="absolute -top-0 -right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {tab.badge > 9 ? "9+" : tab.badge}
              </span>
            )}
          </Link>
        );
      })}
      <div className="flex-1"></div>
      <button onClick={toggle} className="p-3 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title={dark ? "Light Mode" : "Dark Mode"}>
        {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </div>
  );
}