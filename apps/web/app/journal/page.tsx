"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function JournalPage() {
    var C = useColors();
    var router = useRouter();
    var [entries, setEntries] = useState<any[]>([]);
    var [content, setContent] = useState("");
    var [loading, setLoading] = useState(true);
    var [saving, setSaving] = useState(false);
    var [message, setMessage] = useState("");

    useEffect(function () {
        fetchEntries();
    }, []);

    var fetchEntries = async function () {
        try {
            var r = await fetch("/api/journal");
            if (r.ok) setEntries(await r.json());
            else if (r.status === 401) router.push("/login");
        } catch (e) { }
        setLoading(false);
    };

    var handleSave = async function () {
        if (!content.trim()) return;
        setSaving(true);
        setMessage("");

        try {
            var r = await fetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: content.trim() }),
            });

            if (r.ok) {
                var entry = await r.json();
                setEntries([entry].concat(entries));
                setContent("");
                setMessage("Saved ✅");
                setTimeout(function () { setMessage(""); }, 2000);
            }
        } catch (e) { }

        setSaving(false);
    };

    var formatDate = function (d: string) {
        return new Date(d).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
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
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>📝 Journal</h1>
                    <p style={{ color: C.textSecondary, marginTop: 2, fontSize: 13, margin: "2px 0 0 0" }}>
                        Private. Just you and your thoughts.
                    </p>
                </div>

                <div style={{ padding: S.lg, borderBottom: "1px solid " + C.border }}>
                    <textarea
                        value={content}
                        onChange={function (e: any) { setContent(e.target.value); }}
                        placeholder="What's on your mind today?"
                        rows={5}
                        style={{
                            width: "100%",
                            padding: S.md,
                            borderRadius: R.md,
                            border: "1px solid " + C.border,
                            fontSize: 15,
                            resize: "none",
                            fontFamily: "inherit",
                            background: C.surface,
                            color: C.textPrimary,
                            boxSizing: "border-box",
                            lineHeight: 1.6,
                        }}
                    />

                    {message && (
                        <div style={{ background: C.primaryLight, color: C.primary, padding: S.sm, borderRadius: R.sm, fontSize: 13, marginTop: S.sm, textAlign: "center" }}>
                            {message}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={!content.trim() || saving}
                        style={{
                            width: "100%",
                            padding: S.md,
                            borderRadius: R.md,
                            background: content.trim() ? C.primary : C.border,
                            color: content.trim() ? C.textInverse : C.textTertiary,
                            border: "none",
                            fontSize: 14,
                            fontWeight: 600,
                            marginTop: S.md,
                            cursor: content.trim() ? "pointer" : "not-allowed",
                        }}
                    >
                        {saving ? "Saving..." : "Save Entry"}
                    </button>
                </div>

                <div style={{ padding: S.lg, paddingBottom: S.sm }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: 0 }}>Previous Entries</h2>
                </div>

                {entries.length === 0 ? (
                    <div style={{ textAlign: "center", padding: S.xxl, color: C.textTertiary, fontSize: 14 }}>
                        No entries yet. Start writing!
                    </div>
                ) : (
                    <div style={{ paddingBottom: S.xxl }}>
                        {entries.map(function (entry: any) {
                            return (
                                <div key={entry.id} style={{ padding: S.lg, borderBottom: "1px solid " + C.border }}>
                                    <p style={{ fontSize: 15, lineHeight: 1.6, color: C.textPrimary, margin: 0 }}>{entry.content}</p>
                                    <p style={{ fontSize: 12, color: C.textTertiary, marginTop: S.sm, margin: S.sm + "px 0 0 0" }}>{formatDate(entry.createdAt)}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </main>
    );
}