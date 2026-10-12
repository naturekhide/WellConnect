"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function AchievementsPage() {
    var C = useColors();
    var router = useRouter();
    var [data, setData] = useState<any>(null);
    var [loading, setLoading] = useState(true);

    useEffect(function () {
        fetchAchievements();
    }, []);

    var fetchAchievements = async function () {
        try {
            var r = await fetch("/api/achievements");
            if (r.ok) setData(await r.json());
            else if (r.status === 401) router.push("/login");
        } catch (e) { }
        setLoading(false);
    };

    if (loading) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Loading...</p>
            </main>
        );
    }

    var unlocked = data?.achievements?.filter(function (a: any) { return a.unlocked; }) || [];
    var locked = data?.achievements?.filter(function (a: any) { return !a.unlocked; }) || [];
    var progressPct = ((data?.totalUnlocked || 0) / (data?.total || 1)) * 100;

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>

                <div style={{ padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: S.xs, color: C.textSecondary, fontSize: 14, textDecoration: "none", marginBottom: S.sm }}>
                        ← Back
                    </Link>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>🏆 Achievements</h1>
                    <p style={{ color: C.textSecondary, marginTop: 2, fontSize: 13, margin: "2px 0 0 0" }}>
                        {data?.totalUnlocked || 0} of {data?.total || 0} unlocked
                    </p>
                </div>

                <div style={{ padding: S.lg, borderBottom: "1px solid " + C.border }}>
                    <div style={{ height: 8, background: C.borderLight, borderRadius: R.full, overflow: "hidden" }}>
                        <div style={{ width: progressPct + "%", height: "100%", background: C.primary, borderRadius: R.full }} />
                    </div>
                </div>

                {unlocked.length > 0 && (
                    <>
                        <div style={{ padding: S.lg, paddingBottom: S.sm }}>
                            <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: 0 }}>Unlocked</h2>
                        </div>
                        <div>
                            {unlocked.map(function (a: any) {
                                return (
                                    <div key={a.key} style={{ padding: S.lg, borderBottom: "1px solid " + C.border, borderLeft: "4px solid " + C.primary, display: "flex", alignItems: "center", gap: S.lg }}>
                                        <span style={{ fontSize: 32 }}>{a.emoji}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary, margin: 0 }}>{a.title}</p>
                                            <p style={{ color: C.textSecondary, fontSize: 12, marginTop: S.xs, margin: S.xs + "px 0 0 0" }}>{a.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                <div style={{ padding: S.lg, paddingBottom: S.sm }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: 0 }}>Locked</h2>
                </div>
                <div style={{ paddingBottom: S.xxl }}>
                    {locked.map(function (a: any) {
                        return (
                            <div key={a.key} style={{ padding: S.lg, borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: S.lg, opacity: 0.5 }}>
                                <span style={{ fontSize: 32 }}>🔒</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary, margin: 0 }}>{a.title}</p>
                                    <p style={{ color: C.textSecondary, fontSize: 12, marginTop: S.xs, margin: S.xs + "px 0 0 0" }}>{a.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </main>
    );
}