"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useColors } from "@/lib/theme";

export default function BottomNav() {
    var C = useColors();
    var pathname = usePathname();

    // Hide nav on auth screens
    if (pathname === "/login" || pathname === "/register") return null;
    if (pathname === "/") return null;

    var tabs = [
        { href: "/dashboard", label: "Home", emoji: "🏠" },
        { href: "/connect", label: "Connect", emoji: "🌍" },
        { href: "__compose__", label: "", emoji: "+", isCenter: true },
        { href: "/journal", label: "Journal", emoji: "📝" },
        { href: "/profile", label: "You", emoji: "👤" },
    ];

    var isActive = function (href: string) {
        if (href === "__compose__") return false;
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <nav
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                padding: "8px 0 12px",
                borderTop: "1px solid " + C.border,
                background: C.background,
                zIndex: 100,
            }}
        >
            {tabs.map(function (t) {
                if (t.isCenter) {
                    return (
                        <Link
                            key="compose"
                            href="/compose"
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                background: C.primary,
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 28,
                                fontWeight: 300,
                                textDecoration: "none",
                                marginTop: -16,
                                boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                            }}
                        >
                            +
                        </Link>
                    );
                }

                var active = isActive(t.href);
                return (
                    <Link
                        key={t.href}
                        href={t.href}
                        style={{
                            textDecoration: "none",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                            padding: "4px 12px",
                            minWidth: 60,
                        }}
                    >
                        <span style={{ fontSize: 22, opacity: active ? 1 : 0.5 }}>{t.emoji}</span>
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: active ? 700 : 500,
                                color: active ? C.primary : C.textSecondary,
                            }}
                        >
                            {t.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}