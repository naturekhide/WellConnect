"use client";

import { useState, useEffect, useRef } from "react";
import { useColors, S, R } from "@/lib/theme";
import { useRouter } from "next/navigation";
import Link from "next/link";

var REACTIONS = [
    { type: "hug", emoji: "🤗" },
    { type: "growth", emoji: "🌱" },
    { type: "strength", emoji: "💪" },
    { type: "grateful", emoji: "🙏" },
];

var IMAGE_BASE = "";

export default function FeedPostCard({ post, onReactionChange, onPress, onDelete, onUpdated }: any) {
    var C = useColors();
    var router = useRouter();
    var [myReaction, setMyReaction] = useState<string | null>(post.myReaction ?? null);
    var [reactions, setReactions] = useState<any>(
        post.reactions || { hug: 0, growth: 0, strength: 0, grateful: 0 }
    );
    var [showMenu, setShowMenu] = useState(false);
    var [showShareMenu, setShowShareMenu] = useState(false);
    var [editing, setEditing] = useState(false);
    var [editContent, setEditContent] = useState(post.content || "");
    var [editedContent, setEditedContent] = useState(post.content || "");
    var [editedAt, setEditedAt] = useState(post.editedAt || null);
    var menuRef = useRef<any>(null);
    var shareRef = useRef<any>(null);

    // Close menus when clicking outside
    useEffect(function () {
        var handler = function (e: any) {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
            if (shareRef.current && !shareRef.current.contains(e.target)) setShowShareMenu(false);
        };
        document.addEventListener("mousedown", handler);
        return function () { document.removeEventListener("mousedown", handler); };
    }, []);

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

    var handleSaveEdit = async function () {
        if (!editContent.trim()) return;
        try {
            var r = await fetch("/api/feed/" + post.id, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editContent.trim() }),
            });
            if (r.ok) {
                var data = await r.json();
                setEditedContent(data.content);
                setEditedAt(data.editedAt);
                setEditing(false);
                if (onUpdated) onUpdated(post.id, data.content, data.editedAt);
            } else {
                var err = await r.json();
                alert(err.error || "Edit failed");
            }
        } catch (e) { }
    };

    var handleRepost = async function (e: any) {
        e.stopPropagation();
        try {
            await fetch("/api/feed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: "", originalPostId: post.id }),
            });
            alert("Reposted to your feed!");
            setShowShareMenu(false);
            if (onPress) onPress(); // Trigger a refresh
        } catch (e) { }
    };

    var handleCopyLink = function (e: any) {
        e.stopPropagation();
        var link = window.location.origin + "/feed/" + post.id;
        navigator.clipboard.writeText(link);
        alert("Link copied to clipboard!");
        setShowShareMenu(false);
    };

    var elapsedMs = post.createdAt ? Date.now() - new Date(post.createdAt).getTime() : Infinity;
    var isEditable = post.isMine && elapsedMs < 15 * 60 * 1000;

    var displayName = post.anonymous ? "Anonymous" : post.author?.name || "User";
    var initials = post.anonymous ? "🎭" : post.author?.name?.charAt(0) || "U";
    var safeImages = Array.isArray(post.imageUrls) ? post.imageUrls.filter(function (url: string) { return url && url.startsWith("http") || url.startsWith("/"); }) : [];

    return (
        <div
            onClick={function (e) { if (!editing) onPress && onPress(); }}
            style={{
                padding: S.lg + "px " + S.lg + "px",
                paddingTop: S.md,
                paddingBottom: S.md,
                borderBottom: "1px solid " + C.border,
                cursor: onPress && !editing ? "pointer" : "default",
                position: "relative",
            }}
        >
            <div style={{ display: "flex", gap: S.md }}>
                <div style={{ width: 40, flexShrink: 0 }}>
                    <div
                        onClick={goToProfile}
                        style={{
                            width: 40, height: 40, borderRadius: 20,
                            display: "flex", alignItems: "center", justifyContent: "center",
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
                    {/* HEADER */}
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                        <span onClick={goToProfile} style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, cursor: post.anonymous ? "default" : "pointer" }}>
                            {displayName}
                        </span>
                        {!post.anonymous && post.author?.username && (
                            <span onClick={goToProfile} style={{ fontSize: 14, color: C.textSecondary, cursor: "pointer" }}>
                                @{post.author.username}
                            </span>
                        )}
                        <span style={{ fontSize: 14, color: C.textTertiary }}>·</span>
                        <span style={{ fontSize: 13, color: C.textTertiary }}>{timeAgo(post.createdAt)}</span>

                        {post.isMine && (
                            <div ref={menuRef} style={{ marginLeft: "auto", position: "relative" }}>
                                <button onClick={function (e) { e.stopPropagation(); setShowMenu(!showMenu); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 4px", fontSize: 18, color: C.textSecondary }}>···</button>
                                {showMenu && (
                                    <div onClick={function (e) { e.stopPropagation(); }} style={{ position: "absolute", top: "100%", right: 0, zIndex: 10, background: C.surface, border: "1px solid " + C.border, borderRadius: R.md, padding: S.xs, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: 120 }}>
                                        {isEditable && (
                                            <button onClick={function () { setEditing(true); setShowMenu(false); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: S.sm + "px " + S.md + "px", cursor: "pointer", fontSize: 14, color: C.textPrimary }}>Edit</button>
                                        )}
                                        <button onClick={function () { setShowMenu(false); onDelete && onDelete(post.id); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: S.sm + "px " + S.md + "px", cursor: "pointer", fontSize: 14, color: C.danger }}>Delete</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* BODY */}
                    {editing ? (
                        <div onClick={function (e) { e.stopPropagation(); }}>
                            <textarea value={editContent} onChange={function (e) { setEditContent(e.target.value); }} maxLength={500} style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 15, background: C.surface, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit", resize: "none", marginBottom: S.sm }} />
                            <div style={{ display: "flex", gap: S.sm, justifyContent: "flex-end" }}>
                                <button onClick={function (e) { e.stopPropagation(); setEditing(false); setEditContent(editedContent); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.textSecondary, padding: "6px 12px" }}>Cancel</button>
                                <button onClick={function (e) { e.stopPropagation(); handleSaveEdit(); }} style={{ background: C.primary, border: "none", cursor: "pointer", fontSize: 13, color: "#fff", fontWeight: 600, padding: "6px 16px", borderRadius: R.md }}>Save</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {editedContent && (
                                <p style={{ fontSize: 15, lineHeight: 1.4, color: C.textPrimary, margin: "0 0 " + S.sm + "px 0" }}>
                                    {editedContent}
                                </p>
                            )}

                            {/* 🚨 REPOST UI */}
                            {post.originalPost && (
                                <div style={{ padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, marginTop: S.sm, backgroundColor: "rgba(255,255,255,0.02)" }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, marginBottom: 4 }}>
                                        Reposted from <Link href={"/users/" + post.originalPost.author?.id} style={{ color: C.primary }}>@{post.originalPost.author?.username}</Link>
                                    </div>
                                    <div style={{ fontSize: 14, color: C.textPrimary }}>{post.originalPost.content}</div>
                                </div>
                            )}

                            {safeImages.length > 0 && (
                                <div style={{ marginTop: S.sm, marginBottom: S.sm }}>
                                    {safeImages.map(function (url: string, i: number) {
                                        return <img key={i} src={url} style={{ width: "100%", maxHeight: 500, objectFit: "cover", borderRadius: R.lg, border: "1px solid " + C.border, marginBottom: 4 }} />;
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {/* ACTIONS */}
                    {!editing && (
                        <div style={{ display: "flex", alignItems: "center", gap: S.sm, marginTop: S.sm }}>
                            {REACTIONS.map(function (r: any) {
                                var isActive = myReaction === r.type;
                                var count = (reactions && reactions[r.type]) || 0;
                                return (
                                    <button key={r.type} onClick={function (e) { handleReact(r.type, e); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px " + S.sm + "px", borderRadius: R.full, background: isActive ? C.primaryLight : "transparent", border: "none", cursor: "pointer" }}>
                                        <span style={{ fontSize: 16 }}>{r.emoji}</span>
                                        {count > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? C.primary : C.textSecondary }}>{count}</span>}
                                    </button>
                                );
                            })}

                            <button onClick={function (e) { e.stopPropagation(); if (onPress) onPress(); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px " + S.sm + "px", borderRadius: R.full, background: "transparent", border: "none", cursor: "pointer" }}>
                                <span style={{ fontSize: 16 }}>💬</span>
                                {post.replyCount > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary }}>{post.replyCount}</span>}
                            </button>

                            {/* 🚨 SHARE DROPDOWN */}
                            <div ref={shareRef} style={{ position: "relative" }}>
                                <button onClick={function (e) { e.stopPropagation(); setShowShareMenu(!showShareMenu); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px " + S.sm + "px", borderRadius: R.full, background: "transparent", border: "none", cursor: "pointer" }}>
                                    <span style={{ fontSize: 16 }}>🔗</span>
                                </button>
                                {showShareMenu && (
                                    <div onClick={function (e) { e.stopPropagation(); }} style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 8, zIndex: 10, background: C.surface, border: "1px solid " + C.border, borderRadius: R.md, padding: S.xs, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: 150 }}>
                                        <button onClick={handleRepost} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: "none", border: "none", padding: S.sm, cursor: "pointer", fontSize: 14, color: C.textPrimary }}>
                                            <span>🔄</span> Repost
                                        </button>
                                        <button onClick={handleCopyLink} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: "none", border: "none", padding: S.sm, cursor: "pointer", fontSize: 14, color: C.textPrimary }}>
                                            <span>🔗</span> Copy Link
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}