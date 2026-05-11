"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header({ userName }: { userName?: string }) {
  var router = useRouter();
  var handleLogout = async function() { await signOut({ redirect: false }); router.push("/login"); router.refresh(); };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#f0f2f5] dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-green-600 dark:text-green-400">🌱 WellConnect</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">{userName ? "Hello, " + userName : ""}</span>
        <button onClick={handleLogout} className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500">Sign Out</button>
      </div>
    </div>
  );
}