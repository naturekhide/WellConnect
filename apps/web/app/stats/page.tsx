"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StatsPage() {
    var router = useRouter();
    var [stats, setStats] = useState<any>(null);
    var [loading, setLoading] = useState(true);

    useEffect(function () {
        fetchStats();
    }, []);

    var fetchStats = async function () {
        try {
            var r = await fetch("/api/mood/stats");
            if (r.ok) setStats(await r.json());
            else if (r.status === 401) router.push("/login");
        } catch (e) { }
        setLoading(false);
    };

    var getEmoji = function (label: string) {
        var map: any = { thriving: "🟢", managing: "🟡", struggling: "🟠", crisis: "🔴" };
        return map[label] || "⚪";
    };

    if (loading) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <p style={{ color: "#6b7280" }}>Loading...</p>
            </main>
        );
    }

    if (!stats || stats.totalEntries === 0) {
        return (
            <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
                <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#6b7280", fontSize: "0.875rem", textDecoration: "none", marginBottom: "1rem" }}>
                    ← Back
                </Link>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>📊 Your Stats</h1>
                <p style={{ color: "#9ca3af", marginTop: "2rem", textAlign: "center" }}>No data yet. Start checking in!</p>
            </main>
        );
    }

    return (
        <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#6b7280", fontSize: "0.875rem", textDecoration: "none", marginBottom: "1rem" }}>
                ← Back
            </Link>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>📊 Your Stats</h1>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>Last 30 days</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginTop: "1.5rem" }}>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#059669" }}>{stats.averageScore}</p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>Avg Mood</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#059669" }}>{stats.totalEntries}</p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>Check-ins</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#059669" }}>{stats.streak}</p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>Day Streak</p>
                </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", marginTop: "0.75rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Dominant Mood</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.25rem", textTransform: "capitalize" }}>
                    {getEmoji(stats.dominantMood)} {stats.dominantMood}
                </p>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", marginTop: "0.75rem" }}>
                <h2 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem" }}>Mood Breakdown</h2>
                {Object.entries(stats.labelCounts).map(function (item: any) {
                    var pct = stats.totalEntries > 0 ? Math.round((item[1] / stats.totalEntries) * 100) : 0;
                    var colors: any = { thriving: "#059669", managing: "#f59e0b", struggling: "#f97316", crisis: "#ef4444" };
                    return (
                        <div key={item[0]} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "0.75rem", width: 70, textTransform: "capitalize" }}>{item[0]}</span>
                            <div style={{ flex: 1, height: 8, background: "#f3f4f6", borderRadius: 999 }}>
                                <div style={{ width: pct + "%", height: "100%", background: colors[item[0]] || "#059669", borderRadius: 999 }} />
                            </div>
                            <span style={{ fontSize: "0.75rem", width: 30, textAlign: "right" }}>{item[1]}</span>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}