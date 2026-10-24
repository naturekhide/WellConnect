"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";

var MAX_CHARS = 500;
var MAX_IMAGES = 4;

export default function ComposeMomentPage() {
    var C = useColors();
    var router = useRouter();
    var fileInputRef = useRef<HTMLInputElement>(null);

    var [content, setContent] = useState("");
    var [files, setFiles] = useState<File[]>([]);
    var [previews, setPreviews] = useState<string[]>([]);
    var [anonymous, setAnonymous] = useState(false);
    var [posting, setPosting] = useState(false);
    var [error, setError] = useState("");

    var handlePick = function () {
        if (files.length >= MAX_IMAGES) return;
        if (fileInputRef.current) fileInputRef.current.click();
    };

    var handleFileChange = function (e: any) {
        var picked: FileList = e.target.files;
        if (!picked) return;

        var newFiles = files.slice();
        var newPreviews = previews.slice();

        for (var i = 0; i < picked.length && newFiles.length < MAX_IMAGES; i++) {
            var f = picked[i];
            if (!f.type.startsWith("image/")) continue;
            newFiles.push(f);
            newPreviews.push(URL.createObjectURL(f));
        }

        setFiles(newFiles);
        setPreviews(newPreviews);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    var handleRemove = function (index: number) {
        URL.revokeObjectURL(previews[index]);
        setFiles(files.filter(function (_: any, i: number) { return i !== index; }));
        setPreviews(previews.filter(function (_: any, i: number) { return i !== index; }));
    };

    var uploadFiles = async function (): Promise<string[]> {
        if (files.length === 0) return [];

        var fd = new FormData();
        for (var i = 0; i < files.length; i++) {
            fd.append("files", files[i]);
        }

        var r = await fetch("/api/upload/multi", {
            method: "POST",
            body: fd,
        });

        if (!r.ok) {
            var t = await r.text();
            throw new Error(t || "Upload failed");
        }

        var data = await r.json();
        return data.urls || [];
    };

    var handlePost = async function () {
        if (!content.trim() && files.length === 0) return;
        setPosting(true);
        setError("");

        try {
            var urls = await uploadFiles();

            var r = await fetch("/api/feed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content.trim(),
                    imageUrls: urls,
                    anonymous: anonymous,
                }),
            });

            if (!r.ok) {
                // CRITICAL FIX: Parse text first, then try JSON to avoid "Unexpected end of JSON input"
                var errorText = await r.text();
                var errorMessage = "Failed to post";
                try {
                    var parsed = JSON.parse(errorText);
                    errorMessage = parsed.error || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            router.push("/connect");
            router.refresh();
        } catch (e: any) {
            setError(e.message || "Try again");
        }

        setPosting(false);
    };

    var remaining = MAX_CHARS - content.length;
    var canPost = (content.trim().length > 0 || files.length > 0) && remaining >= 0 && !posting;

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <button onClick={function () { router.back(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 500, color: C.textSecondary }}>Cancel</span>
                    </button>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>Share a Moment</span>
                    <button
                        onClick={handlePost}
                        disabled={!canPost}
                        style={{
                            padding: S.sm + "px " + S.lg + "px",
                            borderRadius: R.full,
                            background: canPost ? C.primary : C.border,
                            border: "none",
                            cursor: canPost ? "pointer" : "not-allowed",
                        }}
                    >
                        <span style={{ fontSize: 14, fontWeight: 600, color: canPost ? "#fff" : C.textTertiary }}>
                            {posting ? "Posting..." : "Post"}
                        </span>
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: S.lg }}>
                    {error && (
                        <div style={{ background: C.dangerLight, color: C.danger, padding: S.md, borderRadius: R.md, fontSize: 14, marginBottom: S.md }}>
                            {error}
                        </div>
                    )}

                    <textarea
                        value={content}
                        onChange={function (e) { setContent(e.target.value); }}
                        placeholder="What's on your mind?"
                        maxLength={MAX_CHARS + 50}
                        autoFocus
                        style={{
                            width: "100%",
                            minHeight: 120,
                            fontSize: 18,
                            lineHeight: 1.4,
                            padding: S.sm + "px 0",
                            border: "none",
                            background: "transparent",
                            color: C.textPrimary,
                            fontFamily: "inherit",
                            resize: "none",
                            outline: "none",
                            boxSizing: "border-box",
                        }}
                    />

                    {previews.length > 0 && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.sm, marginTop: S.md }}>
                            {previews.map(function (url: string, i: number) {
                                return (
                                    <div key={i} style={{ position: "relative" }}>
                                        <img src={url} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: R.md }} />
                                        <button
                                            onClick={function () { handleRemove(i); }}
                                            style={{
                                                position: "absolute", top: 6, right: 6,
                                                width: 24, height: 24, borderRadius: 12,
                                                background: "rgba(0,0,0,0.7)", border: "none",
                                                cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}
                                        >
                                            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✕</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: S.sm, marginTop: S.md }}>
                        <button
                            onClick={handlePick}
                            disabled={files.length >= MAX_IMAGES}
                            style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: S.sm + "px " + S.md + "px",
                                borderRadius: R.md,
                                border: "1px solid " + C.border,
                                background: "transparent",
                                cursor: files.length >= MAX_IMAGES ? "not-allowed" : "pointer",
                            }}
                        >
                            <span style={{ fontSize: 16 }}>📷</span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: C.textSecondary }}>{files.length}/{MAX_IMAGES}</span>
                        </button>

                        <button
                            onClick={function () { setAnonymous(!anonymous); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: S.sm + "px " + S.md + "px",
                                borderRadius: R.md,
                                border: "1px solid " + (anonymous ? C.primary : C.border),
                                background: anonymous ? C.primaryLight : "transparent",
                                cursor: "pointer",
                            }}
                        >
                            <span style={{ fontSize: 16 }}>🎭</span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: anonymous ? C.primary : C.textSecondary }}>
                                {anonymous ? "Anonymous" : "Public"}
                            </span>
                        </button>

                        <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 600, color: remaining < 50 ? C.danger : C.textTertiary }}>
                            {remaining}
                        </span>
                    </div>

                    {anonymous && (
                        <div style={{ padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, background: C.surfaceAlt, marginTop: S.md }}>
                            <p style={{ fontSize: 12, lineHeight: 1.4, color: C.textSecondary, margin: 0 }}>
                                🎭 Your name and username won't be shown on this post.
                            </p>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </div>

            </div>
        </main>
    );
}