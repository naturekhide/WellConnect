"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";
import FeedPostCard from "@/components/FeedPostCard";

export default function ConnectPage() {
    var C = useColors();
    var router = useRouter();
    var [posts, setPosts] = useState<any[]>([]);
    var [cursor, setCursor] = useState<string | null>(null);
    var [hasMore, setHasMore] = useState(false);
    var [loading, setLoading] = useState(true);
    var [tab, setTab] = useState("for-you");
    var [toast, setToast] = useState<any>(null);

    useEffect(function () {
        setPosts([]);
        setCursor(null);
        setHasMore(false);
        setLoading(true);
        loadFeed();
    }, [tab]);

    var loadFeed = async function () {
        try {
            var url = "/api/feed" + (tab !== "for-you" ? "?tab=" + tab : "");
            var r = await fetch(url);
            if (r.ok) {
                var data = await r.json();
                setPosts(data.posts || []);
                setCursor(data.nextCursor);
                setHasMore(data.hasMore);
            }
        } catch (e) { }
        setLoading(false);
    };

    var loadMore = async function () {
        if (!hasMore || !cursor) return;
        try {
            var url = "/api/feed?cursor=" + cursor + (tab !== "for-you" ? "&tab=" + tab : "");
            var r = await fetch(url);
            if (r.ok) {
                var data = await r.json();
                setPosts(posts.concat(data.posts || []));
                setCursor(data.nextCursor);
                setHasMore(data.hasMore);
            }
        } catch (e) { }
    };

    var handleReactionChange = function (postId: string, reactions: any, myReaction: any) {
        setPosts(posts.map(function (p) {
            return p.id === postId ? { ...p, reactions, myReaction } : p;
        }));
    };

    var handleDelete = async function (postId: string) {
        if (!window.confirm("Delete this post?")) return;

        try {
            var r = await fetch("/api/feed/" + postId, { method: "DELETE" });
            if (!r.ok) return;
        } catch (e) { return; }

        setPosts(posts.filter(function (p) { return p.id !== postId; }));

        setToast({ postId: postId });
        setTimeout(function () {
            setToast(function (current: any) {
                return current && current.postId === postId ? null : current;
            });
        }, 5000);
    };

    var handleUndo = async function () {
        if (!toast) return;
        var postId = toast.postId;
        setToast(null);
        try {
            await fetch("/api/feed/" + postId + "/restore", { method: "POST" });
            await loadFeed();
        } catch (e) { }
    };

    var handlePostUpdated = function (postId: string, content: string, editedAt: string) {
        setPosts(posts.map(function (p) {
            return p.id === postId ? { ...p, content, editedAt } : p;
        }));
    };

    var TABS = [
        { id: "for-you", label: "For You" },
        { id: "following", label: "Following" },
        { id: "circles", label: "Circles" },
    ];

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>🌍 Connect</h1>
                        <p style={{ color: C.textSecondary, marginTop: 2, fontSize: 13, margin: "2px 0 0 0" }}>Share moments. Support each other.</p>
                    </div>
                    <button
                        onClick={function () { router.push("/search"); }}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, padding: S.sm, flexShrink: 0 }}
                    >
                        🔍
                    </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", padding: "0 " + S.lg + "px", borderBottom: "1px solid " + C.border }}>
                    {TABS.map(function (t: any) {
                        var active = tab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={function () { setTab(t.id); }}
                                style={{
                                    padding: S.md + "px 0",
                                    marginRight: S.xl,
                                    background: "none",
                                    border: "none",
                                    borderBottom: active ? "2px solid " + C.primary : "2px solid transparent",
                                    fontSize: 15,
                                    fontWeight: active ? 700 : 500,
                                    color: active ? C.textPrimary : C.textSecondary,
                                    cursor: "pointer",
                                    position: "relative",
                                    bottom: -1,
                                }}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                    {tab === "circles" && (
                        <button
                            onClick={function () { router.push("/circles"); }}
                            style={{ marginLeft: "auto", background: "none", border: "none", color: C.primary, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: S.md + "px 0" }}
                        >
                            Browse →
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ padding: S.xxl, textAlign: "center", color: C.textSecondary }}>Loading...</div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: S.xxl, color: C.textSecondary }}>
                        <div style={{ fontSize: 40, marginBottom: S.md }}>🌿</div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: 0, marginBottom: S.sm }}>Your space is quiet</p>
                        <p style={{ fontSize: 14, color: C.textSecondary, margin: 0, maxWidth: 300, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
                            {tab === "following"
                                ? "Follow people to see their moments here. Anonymous posts don't appear in this tab."
                                : tab === "circles"
                                    ? "Join a circle to see its posts here."
                                    : "Tap the + button to share your first moment."}
                        </p>
                        {tab === "circles" && (
                            <button
                                onClick={function () { router.push("/circles"); }}
                                style={{ marginTop: S.lg, padding: S.md + "px " + S.lg + "px", borderRadius: R.full, background: C.primary, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                            >
                                Browse Circles
                            </button>
                        )}
                    </div>
                ) : (
                    posts.map(function (post: any) {
                        return (
                            <FeedPostCard
                                key={post.id}
                                post={post}
                                onReactionChange={handleReactionChange}
                                onPress={function () { router.push("/connect/" + post.id); }}
                                onDelete={handleDelete}
                                onUpdated={handlePostUpdated}
                            />
                        );
                    })
                )}

                {hasMore && !loading && (
                    <button
                        onClick={loadMore}
                        style={{ display: "block", margin: S.lg + " auto", padding: S.md, borderRadius: 16, border: "1px solid " + C.border, background: "none", color: C.primary, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                    >
                        Load more
                    </button>
                )}

                {!hasMore && posts.length > 0 && !loading && (
                    <div style={{ textAlign: "center", padding: S.xxl }}>
                        <div style={{ fontSize: 24, marginBottom: S.sm }}>🌿</div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: C.textSecondary, margin: 0 }}>
                            You're caught up. Take a breath.
                        </p>
                    </div>
                )}

            </div>

            {toast && (
                <div style={{
                    position: "fixed", bottom: 80, left: 0, right: 0,
                    display: "flex", justifyContent: "center", zIndex: 100,
                    pointerEvents: "none",
                }}>
                    <div style={{
                        background: "#1f2937", color: "#fff",
                        padding: "12px 20px", borderRadius: 999,
                        fontSize: 14, fontWeight: 500,
                        display: "flex", alignItems: "center", gap: 16,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        pointerEvents: "auto",
                    }}>
                        <span>Post deleted</span>
                        <button
                            onClick={handleUndo}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#10b981", fontWeight: 700, fontSize: 14, padding: 0 }}
                        >
                            Undo
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}