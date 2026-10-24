"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function TopHeader() {
    const pathname = usePathname();

    // Hide the header on login/register pages
    if (pathname === "/login" || pathname === "/register") return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#2a2a2a] bg-[#0f0f0f]/80 backdrop-blur-md">
            <div className="mx-auto grid h-16 max-w-5xl grid-cols-3 items-center px-4">

                {/* Left side (Empty) */}
                <div className="flex justify-start"></div>

                {/* Center: Logo */}
                <div className="flex justify-center">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="WellConnect"
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                        <span className="text-xl font-extrabold text-white tracking-wide">
                            WellConnect
                        </span>
                    </Link>
                </div>

                {/* Right side: Bell Icon */}
                <div className="flex justify-end">
                    <Link
                        href="/notifications"
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#2a2a2a] ${pathname === "/notifications" ? "bg-[#2a2a2a] text-white" : "text-gray-400"
                            }`}
                    >
                        <span className="text-xl">🔔</span>
                    </Link>
                </div>

            </div>
        </header>
    );
}