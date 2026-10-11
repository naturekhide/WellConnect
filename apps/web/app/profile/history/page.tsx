"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { C, S, R } from "@/lib/theme";


export default function HistoryPage() {
    var router = useRouter();
    var [entries, setEntries] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);

    useEffect(function () {
        fetchEntries();
    }, []);

    var fetchEntries = async function () {
        try {
            var r = await fetch("/api/mood?days=30");
            if (r.ok) setEntries(await r.json());
            else if (r.status === 401) router.push("/login");
        } catch (e) { }
        setLoading(false);
    };

    var getEmoji = function (label: string) {
        var map: any = { thriving: "🟢", managing: "🟡", struggling: "🟠", crisis: "🔴" };
        return map[label] || "⚪";
    };

    var formatDate = function (d: string) {
        return new Date(d).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Loading...</p>
            </main>
        );
    }

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>

                {/* Header */}
                <div style={{ padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: S.xs, color: C.textSecondary, fontSize: 14, textDecoration: "none", marginBottom: S.sm }}>
                        ← Back
                    </Link>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>📊 Your Mood Timeline</h1>
                    <p style={{ color: C.textSecondary, marginTop: 2, fontSize: 13, margin: "2px 0 0 0" }}>
                        Your journey over the last 30 days
                    </p>
                </div>

                {/* Entries */}
                {entries.length === 0 ? (
                    <div style={{ textAlign: "center", padding: S.xxl, color: C.textTertiary, fontSize: 14 }}>
                        No entries yet. Start checking in!
                    </div>
                ) : (
                    <div>
                        {entries.map(function (entry: any) {
                            return (
                                <div key={entry.id} style={{ padding: S.lg, borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: S.md }}>
                                    <span style={{ fontSize: 24 }}>{getEmoji(entry.label)}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: 14, textTransform: "capitalize", color: C.textPrimary, margin: 0 }}>{entry.label}</p>
                                        {entry.note && <p style={{ color: C.textSecondary, fontSize: 12, marginTop: 2, margin: "2px 0 0 0" }}>{entry.note}</p>}
                                    </div>
                                    <p style={{ color: C.textTertiary, fontSize: 12, margin: 0, flexShrink: 0 }}>{formatDate(entry.createdAt)}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </main>
    );
}