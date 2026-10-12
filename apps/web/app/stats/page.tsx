"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function StatsPage() {
    var C = useColors();
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
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Loading...</p>
            </main>
        );
    }

    if (!stats || stats.totalEntries === 0) {
        return (
            <main style={{ background: C.background, minHeight: "100vh" }}>
                <div style={{ maxWidth: 600, margin: "0 auto" }}>
                    <div style={{ padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: S.xs, color: C.textSecondary, fontSize: 14, textDecoration: "none", marginBottom: S.sm }}>
                            ← Back
                        </Link>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>📊 Your Stats</h1>
                    </div>
                    <p style={{ color: C.textTertiary, marginTop: S.xxl, textAlign: "center", fontSize: 14 }}>No data yet. Start checking in!</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>

                <div style={{ padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: S.xs, color: C.textSecondary, fontSize: 14, textDecoration: "none", marginBottom: S.sm }}>
                        ← Back
                    </Link>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>📊 Your Stats</h1>
                    <p style={{ color: C.textSecondary, marginTop: 2, fontSize: 13, margin: "2px 0 0 0" }}>Last 30 days</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid " + C.border }}>
                    <TopStat label="Avg Mood" value={stats.averageScore} />
                    <TopStat label="Check-ins" value={stats.totalEntries} />
                    <TopStat label="Day Streak" value={stats.streak} last />
                </div>

                <div style={{ padding: S.lg, borderBottom: "1px solid " + C.border, textAlign: "center" }}>
                    <p style={{ fontSize: 12, color: C.textSecondary, margin: 0 }}>Dominant Mood</p>
                    <p style={{ fontSize: 22, fontWeight: 700, marginTop: S.xs, textTransform: "capitalize", color: C.textPrimary, margin: S.xs + "px 0 0 0" }}>
                        {getEmoji(stats.dominantMood)} {stats.dominantMood}
                    </p>
                </div>

                <div style={{ padding: S.lg, paddingBottom: S.xxl }}>
                    <h2 style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary, marginBottom: S.lg }}>Mood Breakdown</h2>
                    {Object.entries(stats.labelCounts).map(function (item: any) {
                        var pct = stats.totalEntries > 0 ? Math.round((item[1] / stats.totalEntries) * 100) : 0;
                        var barColors: any = { thriving: "#059669", managing: "#f59e0b", struggling: "#f97316", crisis: "#ef4444" };
                        return (
                            <div key={item[0]} style={{ display: "flex", alignItems: "center", gap: S.sm, marginBottom: S.md }}>
                                <span style={{ fontSize: 12, width: 70, textTransform: "capitalize", color: C.textPrimary }}>{item[0]}</span>
                                <div style={{ flex: 1, height: 8, background: C.borderLight, borderRadius: R.full }}>
                                    <div style={{ width: pct + "%", height: "100%", background: barColors[item[0]] || C.primary, borderRadius: R.full }} />
                                </div>
                                <span style={{ fontSize: 12, width: 30, textAlign: "right", color: C.textPrimary }}>{item[1]}</span>
                            </div>
                        );
                    })}
                </div>

            </div>
        </main>
    );
}

function TopStat({ label, value, last }: any) {
    var C = useColors();
    return (
        <div style={{ padding: S.lg, textAlign: "center", borderRight: last ? "none" : "1px solid " + C.border }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>{value}</p>
            <p style={{ fontSize: 12, color: C.textSecondary, margin: S.xs + "px 0 0 0" }}>{label}</p>
        </div>
    );
}