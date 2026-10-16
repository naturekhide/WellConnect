"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function CirclesPage() {
    var C = useColors();
    var router = useRouter();
    var [circles, setCircles] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [q, setQ] = useState("");

    useEffect(function () { load(); }, []);

    var load = async function () {
        try {
            var r = await fetch("/api/circles");
            if (r.ok) {
                var data = await r.json();
                setCircles(data.circles || []);
            }
        } catch (e) { }
        setLoading(false);
    };

    var myCircles = circles.filter(function (c: any) {
        return c.myStatus === "approved" || c.myStatus === "pending";
    });

    var discover = circles.filter(function (c: any) {
        return !c.myStatus;
    });

    var filteredDiscover = q
        ? discover.filter(function (c: any) {
            return c.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
        })
        : discover;

    if (loading) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Loading...</p>
            </main>
        );
    }

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 100 }}>

                {/* Header */}
                <div style={{ padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>🌿 Circles</h1>
                            <p style={{ color: C.textSecondary, marginTop: 2, fontSize: 13, margin: "2px 0 0 0" }}>
                                Communities built around what matters
                            </p>
                        </div>
                        <Link
                            href="/circles/create"
                            style={{
                                background: C.primary,
                                color: "#fff",
                                padding: S.sm + "px " + S.md + "px",
                                borderRadius: R.full,
                                fontSize: 13,
                                fontWeight: 600,
                                textDecoration: "none",
                                flexShrink: 0,
                            }}
                        >
                            + Create
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div style={{ padding: S.lg, paddingBottom: S.sm }}>
                    <input
                        type="text"
                        value={q}
                        onChange={function (e) { setQ(e.target.value); }}
                        placeholder="Search circles..."
                        style={{
                            width: "100%",
                            padding: S.md,
                            borderRadius: R.md,
                            border: "1px solid " + C.border,
                            background: C.surface,
                            color: C.textPrimary,
                            fontSize: 14,
                            boxSizing: "border-box",
                            outline: "none",
                            fontFamily: "inherit",
                        }}
                    />
                </div>

                {/* My Circles */}
                {myCircles.length > 0 && (
                    <>
                        <div style={{ padding: S.lg, paddingBottom: S.sm }}>
                            <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: 0 }}>My Circles</h2>
                        </div>
                        <div style={{ paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.lg }}>
                            {myCircles.map(function (c: any) {
                                return <CircleCard key={c.id} circle={c} C={C} />;
                            })}
                        </div>
                    </>
                )}

                {/* Discover */}
                <div style={{ padding: S.lg, paddingBottom: S.sm }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: 0 }}>Discover</h2>
                </div>
                <div style={{ paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.xxl }}>
                    {filteredDiscover.length === 0 ? (
                        <div style={{ textAlign: "center", padding: S.xl, color: C.textTertiary, fontSize: 14 }}>
                            {q ? "No circles match your search." : "No circles yet. Be the first to create one!"}
                        </div>
                    ) : (
                        filteredDiscover.map(function (c: any) {
                            return <CircleCard key={c.id} circle={c} C={C} />;
                        })
                    )}
                </div>

            </div>
        </main>
    );
}

function CircleCard({ circle, C }: any) {
    return (
        <Link
            href={"/circles/" + circle.id}
            style={{
                display: "flex",
                alignItems: "center",
                gap: S.md,
                padding: S.md,
                marginBottom: S.sm,
                borderRadius: R.lg,
                background: C.surface,
                textDecoration: "none",
            }}
        >
            <div
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: R.md,
                    background: circle.coverColor || C.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                }}
            >
                {circle.emoji || "🌿"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: S.sm }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
                        {circle.name}
                    </p>
                    {circle.isPrivate && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, border: "1px solid " + C.border, color: C.textSecondary }}>
                            private
                        </span>
                    )}
                    {circle.myStatus === "pending" && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: C.primaryLight, color: C.primary }}>
                            pending
                        </span>
                    )}
                </div>
                <p style={{ fontSize: 12, color: C.textSecondary, marginTop: 2, margin: "2px 0 0 0" }}>
                    {circle.memberCount} {circle.memberCount === 1 ? "member" : "members"} · {circle.postCount} {circle.postCount === 1 ? "post" : "posts"}
                </p>
                {circle.description && (
                    <p style={{ fontSize: 12, color: C.textTertiary, marginTop: 2, margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {circle.description}
                    </p>
                )}
            </div>
            <span style={{ fontSize: 16, color: C.textTertiary }}>›</span>
        </Link>
    );
}