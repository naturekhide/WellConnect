"use client";

/**
 * Copyright 2026 Ibrahim Aswad Nindow
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-green-600">
            🌱 WellConnect
          </Link>
          <nav className="hidden sm:flex items-center gap-4">
            <Link href="/feed" className="text-sm font-medium text-gray-700 hover:text-green-600">
              Feed
            </Link>
            <Link href="/groups" className="text-sm font-medium text-gray-700 hover:text-green-600">
              Groups
            </Link>
            <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-green-600">
              Profile
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:inline">
            Hello, {userName || "Friend"}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="flex sm:hidden justify-around border-t border-gray-100 py-2">
        <Link href="/feed" className="text-xs font-medium text-gray-700 hover:text-green-600">
          Feed
        </Link>
        <Link href="/groups" className="text-xs font-medium text-gray-700 hover:text-green-600">
          Groups
        </Link>
        <Link href="/profile" className="text-xs font-medium text-gray-700 hover:text-green-600">
          Profile
        </Link>
      </div>
    </header>
  );
}