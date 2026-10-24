"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function TopHeader() {
    const pathname = usePathname();

    if (pathname === "/login" || pathname === "/register") return null;

    return (
        <header style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            width: "100%",
            height: "64px",
            backgroundColor: "rgba(15, 15, 15, 0.95)",
            borderBottom: "1px solid #2a2a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // Centers the logo perfectly
            backdropFilter: "blur(10px)",
        }}>
            {/* Logo & Text (Centered) */}
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    style={{ borderRadius: "50%" }}
                />
                <span style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "white",
                    letterSpacing: "0.5px"
                }}>
                    WellConnect
                </span>
            </Link>

            {/* Bell Icon (Absolute Right) */}
            <Link
                href="/notifications"
                style={{
                    position: "absolute",
                    right: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: pathname === "/notifications" ? "#2a2a2a" : "transparent",
                    textDecoration: "none",
                }}
            >
                <span style={{ fontSize: "22px" }}>🔔</span>
            </Link>
        </header>
    );
}