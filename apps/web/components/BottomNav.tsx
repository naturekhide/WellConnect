"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, MessageCircle, BookOpen, User, Menu, Camera, Film, Bell, Bookmark, Search, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function BottomNav() {
  var pathname = usePathname();
  var { dark, toggle } = useTheme();
  var [showMore, setShowMore] = useState(false);
  var [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(function() {
    fetchUnread();
    var interval = setInterval(fetchUnread, 60000);
    return function() { clearInterval(interval); };
  }, []);

  var fetchUnread = async function() {
    try {
      var r = await fetch("/api/notifications");
      if (r.ok) {
        var data = await r.json();
        setUnreadNotifs(data.unreadCount || 0);
      }
    } catch (e) {}
  };

  var isActive = function(path: string) {
    if (path === "/feed" && (pathname === "/feed" || pathname === "/")) return true;
    return pathname === path || pathname.startsWith(path + "/");
  };

  var mainTabs = [
    { href: "/feed", icon: Home, label: "Feed" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/wellness", icon: BookOpen, label: "Wellness" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  var moreTabs = [
    { href: "/stories", icon: Camera, label: "Stories" },
    { href: "/reels", icon: Film, label: "Reels" },
    { href: "/groups", icon: function() { return <span style={{ fontSize: 16 }}>👥</span>; }, label: "Groups" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
    { href: "/notifications", icon: Bell, label: "Notifications", badge: unreadNotifs },
  ];

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={function() { setShowMore(false); }}>
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[280px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden" onClick={function(e: any) { e.stopPropagation(); }}>
            <div className="grid grid-cols-3 gap-1 p-3">
              {moreTabs.map(function(tab: any) {
                var Icon = tab.icon;
                var active = isActive(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={function() { setShowMore(false); }}
                    className={"flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-colors relative " +
                      (active ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}
                  >
                    {typeof Icon === "function" ? <Icon /> : <Icon className="h-5 w-5" />}
                    <span className="text-[10px] font-medium">{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                        {tab.badge > 9 ? "9+" : tab.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 p-3 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Dark Mode</span>
              <button onClick={toggle} className={"relative w-10 h-6 rounded-full transition-colors " + (dark ? "bg-emerald-500" : "bg-gray-300")}>
                <span className={"absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform " + (dark ? "translate-x-4" : "")}></span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-around max-w-2xl mx-auto">
          {mainTabs.map(function(tab: any) {
            var Icon = tab.icon;
            var active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={"flex flex-col items-center gap-0.5 py-2 px-3 min-w-[60px] transition-colors relative " +
                  (active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300")}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {active && <div className="absolute -top-px w-8 h-0.5 rounded-full bg-emerald-500"></div>}
              </Link>
            );
          })}
          <button
            onClick={function() { setShowMore(!showMore); }}
            className={"flex flex-col items-center gap-0.5 py-2 px-3 min-w-[60px] transition-colors " +
              (showMore ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300")}
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
            {showMore && <div className="absolute -top-px w-8 h-0.5 rounded-full bg-emerald-500"></div>}
          </button>
        </div>
      </div>
    </>
  );
}