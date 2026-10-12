"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function GoalsPage() {
    var C = useColors();
    var router = useRouter();
    var [goals, setGoals] = useState<any[]>([]);
    var [title, setTitle] = useState("");
    var [frequency, setFrequency] = useState("daily");
    var [loading, setLoading] = useState(true);
    var [saving, setSaving] = useState(false);
    var [message, setMessage] = useState("");

    useEffect(function () {
        fetchGoals();
    }, []);

    var fetchGoals = async function () {
        try {
            var r = await fetch("/api/goals");
            if (r.ok) setGoals(await r.json());
            else if (r.status === 401) router.push("/login");
        } catch (e) { }
        setLoading(false);
    };

    var handleAdd = async function () {
        if (!title.trim()) return;
        setSaving(true);
        setMessage("");

        try {
            var r = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), frequency }),
            });

            if (r.ok) {
                var goal = await r.json();
                setGoals([goal].concat(goals));
                setTitle("");
                setMessage("Goal added ✅");
                setTimeout(function () { setMessage(""); }, 2000);
            }
        } catch (e) { }

        setSaving(false);
    };

    var handleToggle = async function (id: string) {
        try {
            var r = await fetch("/api/goals/" + id + "/toggle", { method: "POST" });
            if (r.ok) {
                var updated = await r.json();
                setGoals(goals.map(function (g: any) { return g.id === id ? updated : g; }));
            }
        } catch (e) { }
    };

    var handleDelete = async function (id: string) {
        try {
            var r = await fetch("/api/goals/" + id, { method: "DELETE" });
            if (r.ok) {
                setGoals(goals.filter(function (g: any) { return g.id !== id; }));
            }
        } catch (e) { }
    };

    if (loading) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Loading...</p>
            </main>
        );
    }

    var inputStyle = {
        width: "100%",
        padding: S.md + "px",
        borderRadius: R.md,
        border: "1px solid " + C.border,
        fontSize: 14,
        background: C.surface,
        color: C.textPrimary,
        fontFamily: "inherit",
        boxSizing: "border-box" as const,
    };

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>

                <div style={{ padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: S.xs, color: C.textSecondary, fontSize: 14, textDecoration: "none", marginBottom: S.sm }}>
                        ← Back
                    </Link>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>🎯 Goals</h1>
                    <p style={{ color: C.textSecondary, marginTop: 2, fontSize: 13, margin: "2px 0 0 0" }}>
                        {goals.filter(function (g: any) { return !g.completed; }).length} active
                    </p>
                </div>

                <div style={{ padding: S.lg, borderBottom: "1px solid " + C.border }}>
                    <input
                        type="text"
                        value={title}
                        onChange={function (e: any) { setTitle(e.target.value); }}
                        placeholder="What do you want to achieve?"
                        style={inputStyle}
                    />

                    <select
                        value={frequency}
                        onChange={function (e: any) { setFrequency(e.target.value); }}
                        style={{ ...inputStyle, marginTop: S.sm }}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>

                    {message && (
                        <div style={{ background: C.primaryLight, color: C.primary, padding: S.sm, borderRadius: R.sm, fontSize: 13, marginTop: S.sm, textAlign: "center" }}>
                            {message}
                        </div>
                    )}

                    <button
                        onClick={handleAdd}
                        disabled={!title.trim() || saving}
                        style={{
                            width: "100%",
                            padding: S.md,
                            borderRadius: R.md,
                            background: title.trim() ? C.primary : C.border,
                            color: title.trim() ? C.textInverse : C.textTertiary,
                            border: "none",
                            fontSize: 14,
                            fontWeight: 600,
                            marginTop: S.md,
                            cursor: title.trim() ? "pointer" : "not-allowed",
                        }}
                    >
                        {saving ? "Adding..." : "Add Goal"}
                    </button>
                </div>

                <div style={{ padding: S.lg, paddingBottom: S.sm }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: 0 }}>Your Goals</h2>
                </div>

                {goals.length === 0 ? (
                    <div style={{ textAlign: "center", padding: S.xxl, color: C.textTertiary, fontSize: 14 }}>
                        No goals yet. Add one above!
                    </div>
                ) : (
                    <div style={{ paddingBottom: S.xxl }}>
                        {goals.map(function (goal: any) {
                            return (
                                <div key={goal.id} style={{ padding: S.lg, borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "space-between", gap: S.md }}>
                                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: S.md, minWidth: 0 }}>
                                        <input
                                            type="checkbox"
                                            checked={goal.completed}
                                            onChange={function () { handleToggle(goal.id); }}
                                            style={{ width: 20, height: 20, cursor: "pointer", accentColor: C.primary, flexShrink: 0 }}
                                        />
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: 14, fontWeight: 500, color: goal.completed ? C.textTertiary : C.textPrimary, textDecoration: goal.completed ? "line-through" : "none", margin: 0 }}>
                                                {goal.title}
                                            </p>
                                            <p style={{ fontSize: 12, color: C.textTertiary, textTransform: "capitalize", marginTop: 2, margin: "2px 0 0 0" }}>{goal.frequency}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={function () { handleDelete(goal.id); }}
                                        style={{ background: "none", border: "none", color: C.textTertiary, cursor: "pointer", fontSize: 16, flexShrink: 0 }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </main>
    );
}