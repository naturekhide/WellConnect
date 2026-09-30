"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <p style={{ color: "#6b7280" }}>Loading...</p>
            </main>
        );
    }

    return (
        <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#6b7280", fontSize: "0.875rem", textDecoration: "none", marginBottom: "1rem" }}>
                ← Back
            </Link>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>📊 Your Mood Timeline</h1>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                Your journey over the last 30 days
            </p>

            {entries.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
                    No entries yet. Start checking in!
                </div>
            ) : (
                <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {entries.map(function (entry: any) {
                        return (
                            <div key={entry.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <span style={{ fontSize: "1.5rem" }}>{getEmoji(entry.label)}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: "0.875rem", textTransform: "capitalize" }}>{entry.label}</p>
                                    {entry.note && <p style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>{entry.note}</p>}
                                </div>
                                <p style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{formatDate(entry.createdAt)}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}