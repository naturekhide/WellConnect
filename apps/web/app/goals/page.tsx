"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GoalsPage() {
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
                setGoals([goal, ...goals]);
                setTitle("");
                setMessage("Goal added ✅");
                setTimeout(function () { setMessage(""); }, 3000);
            }
        } catch (e) {
            setMessage("Failed to add goal");
        }

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
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>🎯 Goals</h1>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                Track what matters to you
            </p>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginTop: "1.5rem" }}>
                <input
                    type="text"
                    value={title}
                    onChange={function (e: any) { setTitle(e.target.value); }}
                    placeholder="What do you want to achieve?"
                    style={{
                        width: "100%",
                        padding: "0.875rem",
                        borderRadius: "0.75rem",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        marginBottom: "0.75rem",
                    }}
                />

                <select
                    value={frequency}
                    onChange={function (e: any) { setFrequency(e.target.value); }}
                    style={{
                        width: "100%",
                        padding: "0.875rem",
                        borderRadius: "0.75rem",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        marginBottom: "0.75rem",
                        background: "#fff",
                    }}
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>

                {message && (
                    <div style={{ background: "#ecfdf5", color: "#059669", padding: "0.5rem", borderRadius: "0.5rem", fontSize: "0.875rem", marginBottom: "0.75rem", textAlign: "center" }}>
                        {message}
                    </div>
                )}

                <button
                    onClick={handleAdd}
                    disabled={!title.trim() || saving}
                    style={{
                        width: "100%",
                        padding: "0.875rem",
                        borderRadius: "0.75rem",
                        background: title.trim() ? "#059669" : "#e5e7eb",
                        color: title.trim() ? "#fff" : "#9ca3af",
                        border: "none",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: title.trim() ? "pointer" : "not-allowed",
                    }}
                >
                    {saving ? "Adding..." : "Add Goal"}
                </button>
            </div>

            <div style={{ marginTop: "2rem" }}>
                <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem" }}>Your Goals</h2>

                {goals.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                        No goals yet. Set your first one!
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {goals.map(function (goal: any) {
                            return (
                                <div key={goal.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <input
                                            type="checkbox"
                                            checked={goal.completed}
                                            onChange={function () { handleToggle(goal.id); }}
                                            style={{ width: 20, height: 20, cursor: "pointer" }}
                                        />
                                        <div>
                                            <p style={{ fontSize: "0.875rem", fontWeight: 500, color: goal.completed ? "#9ca3af" : "#111827", textDecoration: goal.completed ? "line-through" : "none" }}>
                                                {goal.title}
                                            </p>
                                            <p style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "capitalize" }}>{goal.frequency}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={function () { handleDelete(goal.id); }}
                                        style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1rem" }}
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