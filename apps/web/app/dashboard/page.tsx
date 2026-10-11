"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function DashboardPage() {
    var C = useColors();
    var router = useRouter();
    var [userName, setUserName] = useState("");
    var [checkedToday, setCheckedToday] = useState(false);
    var [selectedMood, setSelectedMood] = useState<any>(null);
    var [note, setNote] = useState("");
    var [submitted, setSubmitted] = useState(false);
    var [insight, setInsight] = useState<any>(null);
    var [loading, setLoading] = useState(true);

    var moodOptions = [
        { emoji: "🟢", label: "thriving", text: "Thriving", score: 9 },
        { emoji: "🟡", label: "managing", text: "Managing", score: 6 },
        { emoji: "🟠", label: "struggling", text: "Struggling", score: 3 },
        { emoji: "🔴", label: "crisis", text: "Crisis", score: 1 },
    ];

    useEffect(function () {
        fetchDashboard();
    }, []);

    var fetchDashboard = async function () {
        try {
            var sessionRes = await fetch("/api/auth/session");
            if (sessionRes.ok) {
                var s = await sessionRes.json();
                setUserName(s?.user?.name || "Friend");
            }

            var todayRes = await fetch("/api/mood/today");
            if (todayRes.ok) {
                var data = await todayRes.json();
                if (data) setCheckedToday(true);
            }

            var insightRes = await fetch("/api/insights");
            if (insightRes.ok) {
                var insights = await insightRes.json();
                if (insights.length > 0) setInsight(insights[0]);
            }
        } catch (e) { }
        setLoading(false);
    };

    var handleSubmit = async function () {
        if (!selectedMood) return;

        try {
            var r = await fetch("/api/mood", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    score: selectedMood.score,
                    label: selectedMood.label,
                    note: note.trim() || null,
                }),
            });

            if (r.ok) {
                setSubmitted(true);
                setCheckedToday(true);
                await fetch("/api/insights/generate", { method: "POST" });

                setTimeout(function () {
                    setSubmitted(false);
                    setSelectedMood(null);
                    setNote("");
                    fetchDashboard();
                }, 3000);
            }
        } catch (e) { }
    };

    var handleSignOut = async function () {
        var { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });
        router.push("/login");
        router.refresh();
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

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: S.sm, padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
                            Welcome, {userName?.split(" ")[0] || "Friend"} 👋
                        </h1>
                        <p style={{ color: C.textSecondary, marginTop: 2, fontSize: 13, margin: 0 }}>
                            Your digital wellbeing at a glance
                        </p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        style={{
                            background: "none",
                            border: "1px solid " + C.border,
                            padding: S.sm + "px " + S.md + "px",
                            borderRadius: R.md,
                            color: C.textSecondary,
                            fontSize: 12,
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                    >
                        Sign Out
                    </button>
                </div>

                {insight && (
                    <div style={{ padding: S.lg, borderBottom: "1px solid " + C.border, borderLeft: "4px solid " + C.primary }}>
                        <h2 style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary, marginBottom: S.sm }}>
                            💡 {insight.title}
                        </h2>
                        <p style={{ color: C.textSecondary, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                            {insight.description}
                        </p>
                        {insight.actionLink && (
                            <Link href={insight.actionLink} style={{ color: C.primary, fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-block", marginTop: S.sm }}>
                                Take action →
                            </Link>
                        )}
                    </div>
                )}

                {!checkedToday && !submitted && (
                    <div style={{ padding: S.lg, borderBottom: "1px solid " + C.border }}>
                        <h2 style={{ fontWeight: 600, fontSize: 16, color: C.textPrimary, marginBottom: S.lg }}>
                            🧠 How are you feeling today?
                        </h2>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: S.lg }}>
                            {moodOptions.map(function (mood: any) {
                                var isSelected = selectedMood?.label === mood.label;
                                return (
                                    <button
                                        key={mood.label}
                                        onClick={function () { setSelectedMood(mood); }}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 6,
                                            padding: S.lg + "px " + S.md + "px",
                                            borderRadius: R.md,
                                            border: isSelected ? "2px solid " + C.primary : "1px solid " + C.border,
                                            background: isSelected ? C.primaryLight : C.surface,
                                            cursor: "pointer",
                                            minHeight: 88,
                                            transition: "all 0.15s ease",
                                        }}
                                    >
                                        <span style={{ fontSize: 28 }}>{mood.emoji}</span>
                                        <span style={{ fontSize: 14, color: isSelected ? C.primary : C.textPrimary, fontWeight: 600 }}>
                                            {mood.text}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <textarea
                            value={note}
                            onChange={function (e: any) { setNote(e.target.value); }}
                            placeholder="Add a note (optional)..."
                            rows={2}
                            style={{
                                width: "100%",
                                padding: S.md,
                                borderRadius: R.md,
                                border: "1px solid " + C.border,
                                fontSize: 14,
                                resize: "none",
                                marginBottom: S.md,
                                fontFamily: "inherit",
                                background: C.surface,
                                color: C.textPrimary,
                                boxSizing: "border-box",
                            }}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={!selectedMood}
                            style={{
                                width: "100%",
                                padding: S.md + "px",
                                borderRadius: R.md,
                                background: selectedMood ? C.primary : C.border,
                                color: selectedMood ? C.textInverse : C.textTertiary,
                                border: "none",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: selectedMood ? "pointer" : "not-allowed",
                            }}
                        >
                            Submit
                        </button>
                    </div>
                )}

                {submitted && (
                    <div style={{ padding: S.xl, borderBottom: "1px solid " + C.border, textAlign: "center", color: C.primary, fontWeight: 600 }}>
                        ✅ Thanks for checking in!
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: C.border, marginTop: 0 }}>
                    <NavTile href="/journal" emoji="📝" title="Journal" sub="Your private space" />
                    <NavTile href="/goals" emoji="🎯" title="Goals" sub="Track what matters" />
                    <NavTile href="/stats" emoji="📈" title="Stats" sub="Track your progress" />
                    <NavTile href="/history" emoji="📊" title="Timeline" sub="See your journey" />
                    <NavTile href="/calendar" emoji="📅" title="Calendar" sub="Visualize your month" />
                    <NavTile href="/profile" emoji="👤" title="Profile" sub="Manage your account" />
                </div>

            </div>
        </main>
    );
}

function NavTile({ href, emoji, title, sub }: any) {
    var C = useColors();
    return (
        <Link
            href={href}
            style={{
                textDecoration: "none",
                padding: S.lg,
                background: C.surface,
                color: C.textPrimary,
                display: "block",
                borderBottom: "1px solid " + C.border,
            }}
        >
            <span style={{ fontSize: 24 }}>{emoji}</span>
            <h2 style={{ fontWeight: 600, marginTop: S.sm, marginBottom: 2, fontSize: 14, color: C.textPrimary }}>{title}</h2>
            <p style={{ color: C.textSecondary, fontSize: 12, margin: 0 }}>{sub}</p>
        </Link>
    );
}