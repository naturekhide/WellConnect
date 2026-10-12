"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";

export default function ComposePage() {
    var C = useColors();
    var router = useRouter();

    var options = [
        { href: "/compose/moment", emoji: "✨", title: "Share a Moment", sub: "Post to the community feed" },
        { href: "/dashboard", emoji: "🧠", title: "Mood Check-in", sub: "How are you feeling?" },
        { href: "/journal", emoji: "📝", title: "Write Journal", sub: "Reflect on your day" },
        { href: "/goals", emoji: "🎯", title: "Add Goal", sub: "Track something new" },
    ];

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary }}>What's on your mind?</span>
                    <button
                        onClick={function () { router.back(); }}
                        style={{
                            width: 32, height: 32, borderRadius: 16,
                            background: C.surfaceAlt, border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <span style={{ fontSize: 14, color: C.textSecondary }}>✕</span>
                    </button>
                </div>

                <div style={{ padding: S.md }}>
                    {options.map(function (opt) {
                        return (
                            <Link
                                key={opt.href}
                                href={opt.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: S.lg,
                                    padding: S.lg,
                                    marginBottom: S.sm,
                                    background: C.surface,
                                    borderRadius: R.lg,
                                    textDecoration: "none",
                                }}
                            >
                                <span style={{ fontSize: 28 }}>{opt.emoji}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: 0 }}>{opt.title}</p>
                                    <p style={{ fontSize: 13, color: C.textSecondary, marginTop: 2, margin: "2px 0 0 0" }}>{opt.sub}</p>
                                </div>
                                <span style={{ fontSize: 16, color: C.textTertiary }}>›</span>
                            </Link>
                        );
                    })}
                </div>

            </div>
        </main>
    );
}