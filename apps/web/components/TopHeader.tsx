"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function TopHeader() {
    const pathname = usePathname();

    if (pathname === "/login" || pathname === "/register") return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#2a2a2a] bg-[#0f0f0f]/90 backdrop-blur-md">
            <div className="relative mx-auto flex h-16 max-w-5xl items-center justify-between px-4">

                {/* Left side: Logo + Text */}
                <Link href="/dashboard" className="flex items-center gap-2 z-10">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={32}
                        height={32}
                        className="rounded-full"
                    />
                </Link>

                {/* Center: Bold Text (Absolute positioning to guarantee center) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Link href="/dashboard" className="pointer-events-auto">
                        <span className="text-xl font-extrabold text-white tracking-wide">
                            WellConnect
                        </span>
                    </Link>
                </div>

                {/* Right side: Bell Icon */}
                <Link
                    href="/notifications"
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#2a2a2a] ${pathname === "/notifications" ? "bg-[#2a2a2a] text-white" : "text-gray-400"
                        }`}
                >
                    <span className="text-xl">🔔</span>
                </Link>

            </div>
        </header>
    );
}