"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function CalendarPage() {
    var C = useColors();
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
        return map[label] || C.border;
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
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Loading...</p>
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
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>📅 Mood Calendar</h1>
                    <p style={{ color: C.textSecondary, marginTop: 2, fontSize: 13, margin: "2px 0 0 0" }}>Your last 28 days</p>
                </div>

                <div style={{ padding: S.lg, borderBottom: "1px solid " + C.border }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: S.xs }}>
                        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(function (day: string) {
                            return (
                                <div key={day} style={{ textAlign: "center", fontSize: 10, color: C.textTertiary, fontWeight: 600, padding: S.xs + "px 0" }}>
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
                                        borderRadius: 6,
                                        background: entry ? getColor(entry.label) : C.borderLight,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 10,
                                        color: entry ? C.textInverse : C.textTertiary,
                                        fontWeight: 600,
                                        cursor: entry ? "pointer" : "default",
                                        border: isToday ? "2px solid " + C.primary : "none",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    {date.getDate()}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: "flex", gap: S.lg, justifyContent: "center", marginTop: S.lg, fontSize: 10, color: C.textSecondary }}>
                        <span>🟢 Thriving</span>
                        <span>🟡 Managing</span>
                        <span>🟠 Struggling</span>
                        <span>🔴 Crisis</span>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid " + C.border }}>
                    <div style={{ padding: S.lg, textAlign: "center", borderRight: "1px solid " + C.border }}>
                        <p style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>{entries.length}</p>
                        <p style={{ fontSize: 12, color: C.textSecondary, margin: S.xs + "px 0 0 0" }}>Total Check-ins</p>
                    </div>
                    <div style={{ padding: S.lg, textAlign: "center" }}>
                        <p style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>{28 - entries.length}</p>
                        <p style={{ fontSize: 12, color: C.textSecondary, margin: S.xs + "px 0 0 0" }}>Days Missed</p>
                    </div>
                </div>

            </div>
        </main>
    );
}