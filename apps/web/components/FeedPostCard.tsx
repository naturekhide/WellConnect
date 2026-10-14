"use client";

import { useState } from "react";
import { useColors, S, R } from "@/lib/theme";
import { useRouter } from "next/navigation";

var REACTIONS = [
    { type: "hug", emoji: "🤗" },
    { type: "growth", emoji: "🌱" },
    { type: "strength", emoji: "💪" },
    { type: "grateful", emoji: "🙏" },
];

var IMAGE_BASE = "";

export default function FeedPostCard({ post, onReactionChange, onPress }: any) {
    var C = useColors();
    var router = useRouter();
    var [myReaction, setMyReaction] = useState<string | null>(post.myReaction ?? null);
    var [reactions, setReactions] = useState<any>(
        post.reactions || { hug: 0, growth: 0, strength: 0, grateful: 0 }
    );

    var timeAgo = function (d: string) {
        var diff = Date.now() - new Date(d).getTime();
        var mins = Math.floor(diff / 60000);
        var hrs = Math.floor(diff / 3600000);
        var days = Math.floor(diff / 86400000);
        if (mins < 1) return "now";
        if (mins < 60) return mins + "m";
        if (hrs < 24) return hrs + "h";
        return days + "d";
    };

    var handleReact = async function (type: string, e: any) {
        e.stopPropagation();
        try {
            var res = await fetch("/api/feed/" + post.id + "/react", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type }),
            });
            if (res.ok) {
                var data = await res.json();
                setReactions(data.reactions);
                setMyReaction(data.myReaction);
                if (onReactionChange) onReactionChange(post.id, data.reactions, data.myReaction);
            }
        } catch (e) { }
    };

    var goToProfile = function (e: any) {
        if (post.anonymous || !post.author?.id) return;
        e.stopPropagation();
        router.push("/users/" + post.author.id);
    };

    var displayName = post.anonymous ? "Anonymous" : post.author?.name || "User";
    var initials = post.anonymous ? "🎭" : post.author?.name?.charAt(0) || "U";

    return (
        <div
            onClick={onPress}
            style={{
                padding: S.lg + "px " + S.lg + "px",
                paddingTop: S.md,
                paddingBottom: S.md,
                borderBottom: "1px solid " + C.border,
                cursor: onPress ? "pointer" : "default",
            }}
        >
            <div style={{ display: "flex", gap: S.md }}>
                <div style={{ width: 40, flexShrink: 0 }}>
                    <div
                        onClick={goToProfile}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: post.anonymous ? C.surfaceAlt : C.primary,
                            border: post.anonymous ? "1px solid " + C.border : "none",
                            cursor: post.anonymous ? "default" : "pointer",
                        }}
                    >
                        <span style={{ fontSize: 15, fontWeight: 700, color: post.anonymous ? C.textSecondary : "#fff" }}>
                            {initials}
                        </span>
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                        <span
                            onClick={goToProfile}
                            style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: C.textPrimary,
                                cursor: post.anonymous ? "default" : "pointer",
                            }}
                        >
                            {displayName}
                        </span>
                        {!post.anonymous && post.author?.username && (
                            <span
                                onClick={goToProfile}
                                style={{ fontSize: 14, color: C.textSecondary, cursor: "pointer" }}
                            >
                                @{post.author.username}
                            </span>
                        )}
                        {post.anonymous && (
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, border: "1px solid " + C.primary, color: C.primary }}>
                                anonymous
                            </span>
                        )}
                        <span style={{ fontSize: 14, color: C.textTertiary }}>·</span>
                        <span style={{ fontSize: 13, color: C.textTertiary }}>{timeAgo(post.createdAt)}</span>
                    </div>

                    {post.content && (
                        <p style={{ fontSize: 15, lineHeight: 1.4, color: C.textPrimary, margin: "0 0 " + S.sm + "px 0" }}>
                            {post.content}
                        </p>
                    )}

                    {post.imageUrls && post.imageUrls.length > 0 && (
                        <div style={{ marginTop: S.sm, marginBottom: S.sm }}>
                            {post.imageUrls.length === 1 && (
                                <img
                                    src={IMAGE_BASE + post.imageUrls[0]}
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                        maxHeight: 500,
                                        objectFit: "contain",
                                        borderRadius: R.lg,
                                        border: "1px solid " + C.border,
                                        display: "block",
                                    }}
                                />
                            )}
                            {post.imageUrls.length === 2 && (
                                <div style={{ display: "flex", gap: 2 }}>
                                    {post.imageUrls.map(function (url: string, i: number) {
                                        return <img key={i} src={IMAGE_BASE + url} style={{ flex: 1, height: 200, objectFit: "cover", borderRadius: R.md, border: "1px solid " + C.border }} />;
                                    })}
                                </div>
                            )}
                            {post.imageUrls.length === 3 && (
                                <div style={{ display: "flex", gap: 2 }}>
                                    {post.imageUrls.map(function (url: string, i: number) {
                                        return <img key={i} src={IMAGE_BASE + url} style={{ flex: 1, height: 160, objectFit: "cover", borderRadius: R.md, border: "1px solid " + C.border }} />;
                                    })}
                                </div>
                            )}
                            {post.imageUrls.length >= 4 && (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                    {post.imageUrls.slice(0, 4).map(function (url: string, i: number) {
                                        return <img key={i} src={IMAGE_BASE + url} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: R.md, border: "1px solid " + C.border }} />;
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: S.sm, marginTop: S.sm }}>
                        {REACTIONS.map(function (r: any) {
                            var isActive = myReaction === r.type;
                            var count = (reactions && reactions[r.type]) || 0;
                            return (
                                <button
                                    key={r.type}
                                    onClick={function (e) { handleReact(r.type, e); }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "6px " + S.sm + "px",
                                        borderRadius: R.full,
                                        background: isActive ? C.primaryLight : "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    <span style={{ fontSize: 16 }}>{r.emoji}</span>
                                    {count > 0 && (
                                        <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? C.primary : C.textSecondary }}>{count}</span>
                                    )}
                                </button>
                            );
                        })}

                        <button
                            onClick={function (e) { e.stopPropagation(); if (onPress) onPress(); }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "6px " + S.sm + "px",
                                borderRadius: R.full,
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            <span style={{ fontSize: 16 }}>💬</span>
                            {post.replyCount > 0 && (
                                <span style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary }}>{post.replyCount}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}