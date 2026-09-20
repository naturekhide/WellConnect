"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CalendarPage() {
    var router = useRouter();
    var [entries, setEntries] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);

    useEffect(function () {
        fetchEntries();
    }, []);

    var fetchEntries = async function () {
        try {
            var r = await fetch("/api/mood/calendar");
            if (r.ok) setEntries(await r.json());
            else if (r.status === 401) router.push("/login");
        } catch (e) { }
        setLoading(false);
    };

    var getColor = function (label: string) {
        var map: any = {
            thriving: "#10b981",
            managing: "#f59e0b",
            struggling: "#f97316",
            crisis: "#ef4444",
        };
        return map[label] || "#e5e7eb";
    };

    var getLastNDays = function (n: number) {
        var days = [];
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        var dayOfWeek = today.getDay();
        var daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        var thisMonday = new Date(today);
        thisMonday.setDate(today.getDate() - daysFromMonday);

        var firstDay = new Date(thisMonday);
        firstDay.setDate(thisMonday.getDate() - (n - 1));

        for (var i = 0; i < n; i++) {
            var d = new Date(firstDay);
            d.setDate(firstDay.getDate() + i);
            days.push(d);
        }
        return days;
    };

    var getEntryForDate = function (date: Date) {
        var dateStr = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
        var found = entries.find(function (e: any) {
            return e.date === dateStr;
        });
        return found || null;
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
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>📅 Mood Calendar</h1>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>Your last 28 days</p>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginTop: "1.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem" }}>
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(function (day: string) {
                        return (
                            <div key={day} style={{ textAlign: "center", fontSize: "0.625rem", color: "#9ca3af", fontWeight: 600, padding: "0.25rem 0" }}>
                                {day}
                            </div>
                        );
                    })}

                    {getLastNDays(28).map(function (date: Date, i: number) {
                        var entry = getEntryForDate(date);
                        var isToday = new Date().toDateString() === date.toDateString();

                        return (
                            <div
                                key={i}
                                title={entry ? entry.label + " (" + entry.score + "/10)" : "No check-in"}
                                style={{
                                    aspectRatio: "1",
                                    borderRadius: "0.375rem",
                                    background: entry ? getColor(entry.label) : "#f3f4f6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.625rem",
                                    color: entry ? "#fff" : "#9ca3af",
                                    fontWeight: 600,
                                    cursor: entry ? "pointer" : "default",
                                    border: isToday ? "2px solid #059669" : "none",
                                }}
                            >
                                {date.getDate()}
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem", fontSize: "0.625rem", color: "#6b7280" }}>
                    <span>🟢 Thriving</span>
                    <span>🟡 Managing</span>
                    <span>🟠 Struggling</span>
                    <span>🔴 Crisis</span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "1rem" }}>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
                    <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#059669" }}>{entries.length}</p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Total Check-ins</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
                    <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#059669" }}>{28 - entries.length}</p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Days Missed</p>
                </div>
            </div>
        </main>
    );
} 