"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
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

    if (loading) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <p style={{ color: "#6b7280" }}>Loading...</p>
            </main>
        );
    }

    return (
        <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                        Welcome, {userName?.split(" ")[0] || "Friend"} 👋
                    </h1>
                    <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                        Your digital wellbeing at a glance
                    </p>
                </div>
                <button
                    onClick={async function () {
                        await fetch("/api/auth/signout", { method: "POST" });
                        router.push("/login");
                        router.refresh();
                    }}
                    style={{
                        background: "none",
                        border: "1px solid #e5e7eb",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.75rem",
                        color: "#6b7280",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                    }}
                >
                    Sign Out
                </button>
            </div>

            {/* AI Insight */}
            {insight && (
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderLeft: "4px solid #059669", borderRadius: "1rem", padding: "1.25rem", marginTop: "1.5rem" }}>
                    <h2 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem" }}>💡 {insight.title}</h2>
                    <p style={{ color: "#374151", fontSize: "0.875rem", lineHeight: 1.6 }}>
                        {insight.description}
                    </p>
                    {insight.actionLink && (
                        <Link href={insight.actionLink} style={{ color: "#059669", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none", display: "inline-block", marginTop: "0.5rem" }}>
                            Take action →
                        </Link>
                    )}
                </div>
            )}

            {/* Daily Check-in */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginTop: "1rem" }}>
                <h2 style={{ fontWeight: 600, marginBottom: "1rem" }}>🧠 How are you feeling today?</h2>

                {submitted ? (
                    <div style={{ background: "#ecfdf5", padding: "1rem", borderRadius: "0.75rem", textAlign: "center", color: "#059669", fontWeight: 600 }}>
                        ✅ Thanks for checking in!
                    </div>
                ) : checkedToday ? (
                    <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "0.75rem", textAlign: "center", color: "#6b7280" }}>
                        You've already checked in today. See you tomorrow!
                    </div>
                ) : (
                    <>
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                            {moodOptions.map(function (mood: any) {
                                var isSelected = selectedMood?.label === mood.label;
                                return (
                                    <button
                                        key={mood.label}
                                        onClick={function () { setSelectedMood(mood); }}
                                        style={{
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "0.25rem",
                                            padding: "0.75rem",
                                            borderRadius: "0.75rem",
                                            border: isSelected ? "2px solid #059669" : "2px solid #e5e7eb",
                                            background: isSelected ? "#ecfdf5" : "#fff",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <span style={{ fontSize: "1.5rem" }}>{mood.emoji}</span>
                                        <span style={{ fontSize: "0.75rem", color: isSelected ? "#059669" : "#6b7280", fontWeight: 600 }}>
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
                                padding: "0.75rem",
                                borderRadius: "0.75rem",
                                border: "1px solid #e5e7eb",
                                fontSize: "0.875rem",
                                resize: "none",
                                marginBottom: "0.75rem",
                            }}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={!selectedMood}
                            style={{
                                width: "100%",
                                padding: "0.875rem",
                                borderRadius: "0.75rem",
                                background: selectedMood ? "#059669" : "#e5e7eb",
                                color: selectedMood ? "#fff" : "#9ca3af",
                                border: "none",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                cursor: selectedMood ? "pointer" : "not-allowed",
                            }}
                        >
                            Submit
                        </button>
                    </>
                )}
            </div>

            {/* Quick links */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
                <Link href="/journal" style={{ textDecoration: "none", padding: "1.25rem", borderRadius: "1rem", background: "#fff", border: "1px solid #e5e7eb", color: "#111827" }}>
                    <span style={{ fontSize: "1.5rem" }}>📝</span>
                    <h2 style={{ fontWeight: 600, marginTop: "0.5rem", fontSize: "0.875rem" }}>Journal</h2>
                    <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>Your private space</p>
                </Link>

                <Link href="/goals" style={{ textDecoration: "none", padding: "1.25rem", borderRadius: "1rem", background: "#fff", border: "1px solid #e5e7eb", color: "#111827" }}>
                    <span style={{ fontSize: "1.5rem" }}>🎯</span>
                    <h2 style={{ fontWeight: 600, marginTop: "0.5rem", fontSize: "0.875rem" }}>Goals</h2>
                    <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>Track what matters</p>
                </Link>

                <Link href="/stats" style={{ textDecoration: "none", padding: "1.25rem", borderRadius: "1rem", background: "#fff", border: "1px solid #e5e7eb", color: "#111827" }}>
                    <span style={{ fontSize: "1.5rem" }}>📈</span>
                    <h2 style={{ fontWeight: 600, marginTop: "0.5rem", fontSize: "0.875rem" }}>Stats</h2>
                    <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>Track your progress</p>
                </Link>

                <Link href="/history" style={{ textDecoration: "none", padding: "1.25rem", borderRadius: "1rem", background: "#fff", border: "1px solid #e5e7eb", color: "#111827" }}>
                    <span style={{ fontSize: "1.5rem" }}>📊</span>
                    <h2 style={{ fontWeight: 600, marginTop: "0.5rem", fontSize: "0.875rem" }}>Timeline</h2>
                    <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>See your journey</p>
                </Link>

                <Link href="/calendar" style={{ textDecoration: "none", padding: "1.25rem", borderRadius: "1rem", background: "#fff", border: "1px solid #e5e7eb", color: "#111827" }}>
                    <span style={{ fontSize: "1.5rem" }}>📅</span>
                    <h2 style={{ fontWeight: 600, marginTop: "0.5rem", fontSize: "0.875rem" }}>Calendar</h2>
                    <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>Visualize your month</p>
                </Link>

                <Link href="/profile" style={{ textDecoration: "none", padding: "1.25rem", borderRadius: "1rem", background: "#fff", border: "1px solid #e5e7eb", color: "#111827" }}>
                    <span style={{ fontSize: "1.5rem" }}>👤</span>
                    <h2 style={{ fontWeight: 600, marginTop: "0.5rem", fontSize: "0.875rem" }}>Profile</h2>
                    <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>Manage your account</p>
                </Link>
            </div>
        </main>
    );
}