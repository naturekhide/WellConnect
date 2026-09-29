"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AchievementsPage() {
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
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <p style={{ color: "#6b7280" }}>Loading...</p>
            </main>
        );
    }

    var unlocked = data?.achievements?.filter(function (a: any) { return a.unlocked; }) || [];
    var locked = data?.achievements?.filter(function (a: any) { return !a.unlocked; }) || [];

    return (
        <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
            <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#6b7280", fontSize: "0.875rem", textDecoration: "none", marginBottom: "1rem" }}>
                ← Back
            </Link>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>🏆 Achievements</h1>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                {data?.totalUnlocked || 0} of {data?.total || 0} unlocked
            </p>

            <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden", marginTop: "1rem" }}>
                <div style={{ width: ((data?.totalUnlocked || 0) / (data?.total || 1)) * 100 + "%", height: "100%", background: "#059669", borderRadius: 4 }} />
            </div>

            {unlocked.length > 0 && (
                <>
                    <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#6b7280", marginTop: "2rem", marginBottom: "0.75rem" }}>Unlocked</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {unlocked.map(function (a: any) {
                            return (
                                <div key={a.key} style={{ background: "#fff", border: "1px solid #e5e7eb", borderLeft: "4px solid #059669", borderRadius: "1rem", padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span style={{ fontSize: "2rem" }}>{a.emoji}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>{a.title}</p>
                                        <p style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>{a.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#6b7280", marginTop: "2rem", marginBottom: "0.75rem" }}>Locked</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {locked.map(function (a: any) {
                    return (
                        <div key={a.key} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1rem", display: "flex", alignItems: "center", gap: "1rem", opacity: 0.6 }}>
                            <span style={{ fontSize: "2rem" }}>🔒</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>{a.title}</p>
                                <p style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>{a.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}