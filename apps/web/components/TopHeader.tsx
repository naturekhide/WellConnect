"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopHeader() {
    const pathname = usePathname();

    // Hide the header on login/register pages if you want
    if (pathname === "/login" || pathname === "/register") return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#2a2a2a] bg-[#0f0f0f]/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/home" className="flex items-center gap-2">
                    <span className="text-2xl">🌿</span>
                    <span className="text-lg font-bold text-white tracking-tight">
                        WellConnect
                    </span>
                </Link>

                {/* Bell Icon */}
                <Link 
                    href="/notifications" 
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#2a2a2a] ${
                        pathname === "/notifications" ? "bg-[#2a2a2a] text-white" : "text-gray-400"
                    }`}
                >
                    <span className="text-xl">🔔</span>
                </Link>
            </div>
        </header>
    );
}