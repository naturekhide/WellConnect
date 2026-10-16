"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

var EMOJI_CHOICES = ["🌿", "🧠", "💚", "🌱", "☀️", "🌙", "📚", "🎯", "🎨", "🏃", "💪", "🧘", "🍃", "✨", "🔥", "🌊"];
var COLOR_CHOICES = ["#059669", "#10b981", "#14b8a6", "#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444"];

export default function CreateCirclePage() {
    var C = useColors();
    var router = useRouter();

    var [name, setName] = useState("");
    var [description, setDescription] = useState("");
    var [emoji, setEmoji] = useState("🌿");
    var [coverColor, setCoverColor] = useState("#059669");
    var [isPrivate, setIsPrivate] = useState(false);
    var [creating, setCreating] = useState(false);
    var [error, setError] = useState("");

    var canCreate = name.trim().length >= 3 && !creating;

    var handleCreate = async function () {
        if (!canCreate) return;
        setCreating(true);
        setError("");

        try {
            var r = await fetch("/api/circles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    emoji: emoji,
                    coverColor: coverColor,
                    isPrivate: isPrivate,
                }),
            });

            if (r.ok) {
                var circle = await r.json();
                router.push("/circles/" + circle.id);
                router.refresh();
                return;
            }

            var data = await r.json();
            setError(data.error || "Could not create circle");
        } catch (e: any) {
            setError("Something went wrong");
        }

        setCreating(false);
    };

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 100 }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <button onClick={function () { router.back(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 500, color: C.textSecondary }}>Cancel</span>
                    </button>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>Create a Circle</span>
                    <button
                        onClick={handleCreate}
                        disabled={!canCreate}
                        style={{
                            padding: S.sm + "px " + S.lg + "px",
                            borderRadius: R.full,
                            background: canCreate ? C.primary : C.border,
                            color: canCreate ? "#fff" : C.textTertiary,
                            border: "none",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: canCreate ? "pointer" : "not-allowed",
                        }}
                    >
                        {creating ? "Creating..." : "Create"}
                    </button>
                </div>

                <div style={{ padding: S.lg }}>

                    {error && (
                        <div style={{ background: C.dangerLight, color: C.danger, padding: S.md, borderRadius: R.md, fontSize: 14, marginBottom: S.lg }}>
                            {error}
                        </div>
                    )}

                    {/* Preview */}
                    <div style={{ display: "flex", alignItems: "center", gap: S.md, padding: S.lg, borderRadius: R.lg, background: C.surface, marginBottom: S.lg }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: R.md,
                            background: coverColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                            flexShrink: 0,
                        }}>
                            {emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
                                {name.trim() || "Circle name"}
                            </p>
                            <p style={{ fontSize: 12, color: C.textSecondary, marginTop: 2, margin: "2px 0 0 0" }}>
                                {isPrivate ? "🔒 Private" : "🌍 Public"} · 1 member
                            </p>
                        </div>
                    </div>

                    {/* Name */}
                    <label style={{ fontSize: 12, color: C.textSecondary, display: "block", marginBottom: S.xs }}>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={function (e) { setName(e.target.value); }}
                        placeholder="e.g. Mindful Mornings"
                        maxLength={50}
                        style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 15, marginBottom: S.lg, background: C.surface, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                    />

                    {/* Description */}
                    <label style={{ fontSize: 12, color: C.textSecondary, display: "block", marginBottom: S.xs }}>Description</label>
                    <textarea
                        value={description}
                        onChange={function (e) { setDescription(e.target.value); }}
                        placeholder="What is this circle about?"
                        rows={3}
                        maxLength={200}
                        style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, marginBottom: S.lg, background: C.surface, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit", resize: "none" }}
                    />

                    {/* Emoji */}
                    <label style={{ fontSize: 12, color: C.textSecondary, display: "block", marginBottom: S.sm }}>Emoji</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: S.sm, marginBottom: S.lg }}>
                        {EMOJI_CHOICES.map(function (e) {
                            var active = emoji === e;
                            return (
                                <button
                                    key={e}
                                    onClick={function () { setEmoji(e); }}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: R.md,
                                        border: active ? "2px solid " + C.primary : "1px solid " + C.border,
                                        background: active ? C.primaryLight : C.surface,
                                        fontSize: 20,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {e}
                                </button>
                            );
                        })}
                    </div>

                    {/* Color */}
                    <label style={{ fontSize: 12, color: C.textSecondary, display: "block", marginBottom: S.sm }}>Color</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: S.sm, marginBottom: S.lg }}>
                        {COLOR_CHOICES.map(function (c) {
                            var active = coverColor === c;
                            return (
                                <button
                                    key={c}
                                    onClick={function () { setCoverColor(c); }}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: R.full,
                                        background: c,
                                        border: active ? "3px solid " + C.textPrimary : "none",
                                        cursor: "pointer",
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Privacy */}
                    <div style={{ display: "flex", alignItems: "center", gap: S.md, padding: S.md, borderRadius: R.md, background: C.surface, marginBottom: S.lg }}>
                        <button
                            onClick={function () { setIsPrivate(!isPrivate); }}
                            style={{
                                width: 48,
                                height: 28,
                                borderRadius: 14,
                                background: isPrivate ? C.primary : C.border,
                                border: "none",
                                cursor: "pointer",
                                position: "relative",
                                flexShrink: 0,
                            }}
                        >
                            <div style={{
                                position: "absolute",
                                top: 2,
                                left: isPrivate ? 22 : 2,
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                background: "#fff",
                                transition: "left 0.15s ease",
                            }} />
                        </button>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                                {isPrivate ? "Private circle" : "Public circle"}
                            </p>
                            <p style={{ fontSize: 12, color: C.textSecondary, marginTop: 2, margin: "2px 0 0 0" }}>
                                {isPrivate
                                    ? "People must request to join. You approve them."
                                    : "Anyone can join instantly."}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}