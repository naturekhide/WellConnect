"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JournalPage() {
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
                setEntries([entry, ...entries]);
                setContent("");
                setMessage("Entry saved ✅");
                setTimeout(function () { setMessage(""); }, 3000);
            }
        } catch (e) {
            setMessage("Failed to save");
        }

        setSaving(false);
    };

    var formatDate = function (d: string) {
        return new Date(d).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>📝 Journal</h1>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                Private. Just you and your thoughts.
            </p>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginTop: "1.5rem" }}>
                <textarea
                    value={content}
                    onChange={function (e: any) { setContent(e.target.value); }}
                    placeholder="What's on your mind today?"
                    rows={5}
                    style={{
                        width: "100%",
                        padding: "0.875rem",
                        borderRadius: "0.75rem",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        resize: "vertical",
                        marginBottom: "0.75rem",
                    }}
                />

                {message && (
                    <div style={{ background: "#ecfdf5", color: "#059669", padding: "0.5rem", borderRadius: "0.5rem", fontSize: "0.875rem", marginBottom: "0.75rem", textAlign: "center" }}>
                        {message}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={!content.trim() || saving}
                    style={{
                        width: "100%",
                        padding: "0.875rem",
                        borderRadius: "0.75rem",
                        background: content.trim() ? "#059669" : "#e5e7eb",
                        color: content.trim() ? "#fff" : "#9ca3af",
                        border: "none",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: content.trim() ? "pointer" : "not-allowed",
                    }}
                >
                    {saving ? "Saving..." : "Save Entry"}
                </button>
            </div>

            <div style={{ marginTop: "2rem" }}>
                <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem" }}>Previous Entries</h2>

                {entries.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                        No entries yet. Start writing!
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {entries.map(function (entry: any) {
                            return (
                                <div key={entry.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem" }}>
                                    <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#374151" }}>{entry.content}</p>
                                    <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>{formatDate(entry.createdAt)}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}