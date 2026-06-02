"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Header({ userName }: { userName?: string }) {
  var router = useRouter();
  var handleLogout = async function() { await signOut({ redirect: false }); router.push("/login"); router.refresh(); };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">🌱 WellConnect</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">{userName ? "Hello, " + userName.split(" ")[0] : ""}</span>
        <button onClick={handleLogout} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}