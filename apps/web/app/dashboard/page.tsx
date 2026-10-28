"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";
import TopHeader from "@/components/TopHeader";

export default function DashboardPage() {
    var C = useColors();
    var router = useRouter();
    var [userName, setUserName] = useState("");
    var [checkedToday, setCheckedToday] = useState(false);
    var [selectedMood, setSelectedMood] = useState<any>(null);
    var [note, setNote] = useState("");
    var [submitted, setSubmitted] = useState(false);
    var [loading, setLoading] = useState(true);

    var [streak, setStreak] = useState(0);
    var [journalCount, setJournalCount] = useState(0);
    var [goalCount, setGoalCount] = useState(0);
    var [avgMood, setAvgMood] = useState<number | null>(null);
    var [dominantMood, setDominantMood] = useState<string>("");
    var [unreadDMs, setUnreadDMs] = useState(0);

    var moodOptions = [
        { emoji: "😄", label: "thriving", text: "Thriving", score: 9 },
        { emoji: "🙂", label: "managing", text: "Managing", score: 6 },
        { emoji: "😔", label: "struggling", text: "Struggling", score: 3 },
        { emoji: "😢", label: "crisis", text: "Crisis", score: 1 },
    ];

    useEffect(function () {
        fetchDashboard();
    }, []);

    var getGreeting = function () {
        var h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 18) return "Good afternoon";
        return "Good evening";
    };

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

            var statsRes = await fetch("/api/mood/stats");
            if (statsRes.ok) {
                var stats = await statsRes.json();
                if (stats && stats.totalEntries > 0) {
                    setAvgMood(stats.averageScore);
                    setDominantMood(stats.dominantMood || "");
                    setStreak(stats.streak || 0);
                }
            }

            var journalRes = await fetch("/api/journal");
            if (journalRes.ok) {
                var entries = await journalRes.json();
                setJournalCount(entries.length || 0);
            }

            var goalsRes = await fetch("/api/goals");
            if (goalsRes.ok) {
                var goals = await goalsRes.json();
                var active = goals.filter(function (g: any) { return !g.completed; });
                setGoalCount(active.length);
            }

            var dmRes = await fetch("/api/dm/unread-count");
            if (dmRes.ok) {
                var dmData = await dmRes.json();
                setUnreadDMs(dmData.count || 0);
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

    var getMoodEmoji = function (label: string) {
        var map: any = { thriving: "😄", managing: "🙂", struggling: "😔", crisis: "😢" };
        return map[label] || "🙂";
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
            <TopHeader />

            <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 100 }}>

                <div style={{ padding: S.lg, paddingTop: 30, paddingBottom: S.md }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
                        {getGreeting()}, {userName?.split(" ")[0] || "Friend"}
                    </h1>
                    <p style={{ color: C.textSecondary, marginTop: 4, fontSize: 14, margin: "4px 0 0 0" }}>
                        How are you feeling today?
                    </p>
                </div>

                <div style={{ paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.lg }}>
                    {checkedToday && !submitted ? (
                        <div style={{ padding: S.lg, borderRadius: R.lg, background: C.surface, textAlign: "center" }}>
                            <p style={{ fontSize: 14, color: C.textSecondary, margin: 0, lineHeight: 1.5 }}>
                                You've already checked in today. See you tomorrow 🌙
                            </p>
                        </div>
                    ) : submitted ? (
                        <div style={{ padding: S.lg, borderRadius: R.lg, background: C.primaryLight, textAlign: "center" }}>
                            <p style={{ fontSize: 14, color: C.primary, fontWeight: 600, margin: 0 }}>
                                ✅ Thanks for checking in!
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: S.md }}>
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
                                                borderRadius: R.lg,
                                                border: isSelected ? "2px solid " + C.primary : "1px solid " + C.border,
                                                background: isSelected ? C.primaryLight : C.surface,
                                                cursor: "pointer",
                                                minHeight: 88,
                                                transition: "all 0.15s ease",
                                            }}
                                        >
                                            <span style={{ fontSize: 32 }}>{mood.emoji}</span>
                                            <span style={{ fontSize: 14, color: isSelected ? C.primary : C.textPrimary, fontWeight: 600 }}>
                                                {mood.text}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedMood && (
                                <>
                                    <textarea
                                        value={note}
                                        onChange={function (e: any) { setNote(e.target.value); }}
                                        placeholder="Add a note (optional)..."
                                        rows={2}
                                        style={{
                                            width: "100%",
                                            padding: S.md,
                                            borderRadius: R.lg,
                                            border: "1px solid " + C.border,
                                            fontSize: 14,
                                            resize: "none",
                                            marginBottom: S.md,
                                            fontFamily: "inherit",
                                            background: C.surface,
                                            color: C.textPrimary,
                                            boxSizing: "border-box",
                                            outline: "none",
                                        }}
                                    />

                                    <button
                                        onClick={handleSubmit}
                                        style={{
                                            width: "100%",
                                            padding: S.md,
                                            borderRadius: R.lg,
                                            background: C.primary,
                                            color: C.textInverse,
                                            border: "none",
                                            fontSize: 15,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Submit
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div style={{ paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.sm }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Your week</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: S.sm, paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.lg }}>
                    <WeekTile emoji="🔥" value={streak} label="day streak" />
                    <WeekTile emoji="📝" value={journalCount} label="journal" />
                    <WeekTile emoji="🎯" value={goalCount} label="goals" />
                </div>

                {avgMood !== null && (
                    <>
                        <div style={{ paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.sm }}>
                            <h2 style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Your wellbeing</h2>
                        </div>
                        <div style={{ marginLeft: S.lg, marginRight: S.lg, marginBottom: S.lg, padding: S.lg, borderRadius: R.lg, background: C.surface }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: S.sm }}>
                                <span style={{ fontSize: 14, color: C.textSecondary }}>Avg mood</span>
                                <span style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{avgMood}/10</span>
                            </div>
                            <div style={{ height: 6, background: C.borderLight, borderRadius: R.full, overflow: "hidden", marginBottom: S.md }}>
                                <div style={{ width: (avgMood / 10 * 100) + "%", height: "100%", background: C.primary, borderRadius: R.full }} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 14, color: C.textSecondary }}>Dominant mood</span>
                                <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, textTransform: "capitalize" }}>
                                    {getMoodEmoji(dominantMood)} {dominantMood}
                                </span>
                            </div>
                        </div>
                    </>
                )}

                <div style={{ paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.sm }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Your space</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.sm, paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.lg }}>
                    <SpaceTile href="/journal" emoji="📝" title="Journal" />
                    <SpaceTile href="/goals" emoji="🎯" title="Goals" />
                </div>

                <div style={{ paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.sm }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Inbox</h2>
                </div>

                {/* 🚨 NEW: MY CIRCLES BUTTON */}
                <Link
                    href="/my-circles"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: S.md,
                        marginLeft: S.lg,
                        marginRight: S.lg,
                        marginBottom: S.sm,
                        padding: S.lg,
                        borderRadius: R.lg,
                        background: C.surface,
                        textDecoration: "none",
                    }}
                >
                    <span style={{ fontSize: 20 }}>🌿</span>
                    <span style={{ flex: 1, fontSize: 15, color: C.textPrimary, fontWeight: 500 }}>My Circles</span>
                    <span style={{ fontSize: 16, color: C.textTertiary }}>›</span>
                </Link>

                {/* EXISTING MESSAGES BUTTON */}
                <Link
                    href="/messages"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: S.md,
                        marginLeft: S.lg,
                        marginRight: S.lg,
                        marginBottom: S.lg,
                        padding: S.lg,
                        borderRadius: R.lg,
                        background: C.surface,
                        textDecoration: "none",
                    }}
                >
                    <span style={{ fontSize: 20 }}>💬</span>
                    <span style={{ flex: 1, fontSize: 15, color: C.textPrimary, fontWeight: 500 }}>Messages</span>
                    {unreadDMs > 0 && (
                        <div style={{
                            minWidth: 20,
                            height: 20,
                            borderRadius: 10,
                            background: C.primary,
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 6px",
                        }}>
                            {unreadDMs}
                        </div>
                    )}
                    <span style={{ fontSize: 16, color: C.textTertiary }}>›</span>
                </Link>

            </div>
        </main>
    );
}

function WeekTile({ emoji, value, label }: any) {
    var C = useColors();
    return (
        <div style={{ padding: S.md, borderRadius: R.lg, background: C.surface, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.primary }}>{value}</div>
            <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{label}</div>
        </div>
    );
}

function SpaceTile({ href, emoji, title }: any) {
    var C = useColors();
    return (
        <Link
            href={href}
            style={{
                padding: S.xl + "px " + S.lg + "px",
                borderRadius: R.lg,
                background: C.surface,
                textAlign: "center",
                textDecoration: "none",
                display: "block",
            }}
        >
            <div style={{ fontSize: 32, marginBottom: S.sm }}>{emoji}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>{title}</div>
        </Link>
    );
}