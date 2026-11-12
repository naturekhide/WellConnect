"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FeedPostCard from "@/components/FeedPostCard";
import { useColors, S } from "@/lib/theme";

export default function WebPostDetail() {
    const params = useParams();
    const router = useRouter();
    const C = useColors();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Reply states
    const [replyText, setReplyText] = useState("");
    const [postingReply, setPostingReply] = useState(false);
    const [replyTo, setReplyTo] = useState<any>(null);

    useEffect(() => {
        async function fetchPost() {
            try {
                const res = await fetch(`/api/feed/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPost(data);
                }
            } catch (e) {
                console.error("Failed to load post", e);
            }
            setLoading(false);
        }
        if (params.id) fetchPost();
    }, [params.id]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || postingReply) return;

        setPostingReply(true);
        try {
            const res = await fetch(`/api/feed/${params.id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: replyText.trim(),
                    parentId: replyTo?.id || null,
                    anonymous: false
                }),
            });

            if (res.ok) {
                const updatedRes = await fetch(`/api/feed/${params.id}`);
                if (updatedRes.ok) {
                    const updatedData = await updatedRes.json();
                    setPost(updatedData);
                }
                setReplyText("");
                setReplyTo(null);
            }
        } catch (e) {
            console.error("Failed to reply", e);
        }
        setPostingReply(false);
    };

    if (loading) return <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>Loading...</div>;
    if (!post) return <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>Post not found</div>;

    return (
        <div style={{ width: "100%", minHeight: "100vh", background: C.background, color: C.textPrimary }}>

            {/* 👇 Full-width Header with Top-Left Back Button */}
            <div style={{
                padding: "20px 40px",
                borderBottom: "1px solid " + C.border,
                position: "sticky",
                top: 0,
                background: C.background,
                zIndex: 10
            }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: "none",
                        border: "none",
                        color: C.primary,
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: 0
                    }}
                >
                    ← Back
                </button>
            </div>

            {/* 👇 Centered Content Container */}
            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 0 100px" }}>

                {/* 👇 CSS to limit image height ONLY on this page */}
                <style>{`
                    .detail-post-wrapper img {
                        max-height: 250px !important; /* 👈 Scaled down to 250px */
                        width: auto !important;
                        max-width: 100% !important;
                        object-fit: contain !important;
                        margin: 0 auto;
                        display: block;
                        background-color: #1e293b;
                        border-radius: 12px;
                    }
                `}</style>

                {/* Main Post (with the new class) */}
                <div className="detail-post-wrapper">
                    <FeedPostCard
                        post={post}
                        onPress={() => { }}
                        onDelete={() => router.push("/connect")}
                    />
                </div>

                {/* Reply Composer */}
                <div style={{ padding: "24px", borderBottom: "1px solid " + C.border }}>
                    {replyTo && (
                        <div style={{ fontSize: "13px", color: C.textSecondary, marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                            <span>Replying to @{replyTo.author?.username || "Anonymous"}</span>
                            <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer" }}>Cancel</button>
                        </div>
                    )}
                    <form onSubmit={handleReply} style={{ display: "flex", gap: "12px" }}>
                        <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Post your reply..."
                            style={{ flex: 1, padding: "12px 16px", borderRadius: "999px", border: "1px solid " + C.border, background: C.surface, color: C.textPrimary, outline: "none" }}
                        />
                        <button
                            type="submit"
                            disabled={!replyText.trim() || postingReply}
                            style={{ padding: "0 24px", borderRadius: "999px", background: replyText.trim() ? C.primary : C.surfaceAlt, color: replyText.trim() ? "#fff" : C.textTertiary, border: "none", fontWeight: "600", cursor: replyText.trim() ? "pointer" : "default" }}
                        >
                            {postingReply ? "..." : "Reply"}
                        </button>
                    </form>
                </div>

                {/* Threaded Replies */}
                <div>
                    {post.replies && post.replies.length > 0 ? (
                        post.replies.map((reply: any) => (
                            <div key={reply.id} style={{ padding: "16px 24px", borderBottom: "1px solid " + C.border, display: "flex", gap: "12px" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "20px", background: reply.anonymous ? C.surfaceAlt : C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0, color: "#fff" }}>
                                    {reply.anonymous ? "🎭" : reply.author?.name?.charAt(0) || "U"}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <span style={{ fontWeight: "bold", color: C.textPrimary }}>{reply.anonymous ? "Anonymous" : reply.author?.name}</span>
                                        {!reply.anonymous && <span style={{ color: C.textSecondary, fontSize: "14px" }}>@{reply.author?.username}</span>}
                                        <span style={{ color: C.textTertiary, fontSize: "14px" }}>· {new Date(reply.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ marginTop: "4px", fontSize: "15px", lineHeight: "1.4", color: C.textPrimary }}>{reply.content}</p>

                                    <button
                                        onClick={() => setReplyTo(reply)}
                                        style={{ background: "none", border: "none", color: C.textSecondary, fontSize: "13px", marginTop: "8px", cursor: "pointer", padding: 0 }}
                                    >
                                        Reply
                                    </button>

                                    {/* Nested Replies (Children) */}
                                    {reply.children && reply.children.length > 0 && (
                                        <div style={{ marginTop: "16px", borderLeft: "2px solid " + C.border, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                                            {reply.children.map((child: any) => (
                                                <div key={child.id} style={{ display: "flex", gap: "12px" }}>
                                                    <div style={{ width: "32px", height: "32px", borderRadius: "16px", background: child.anonymous ? C.surfaceAlt : C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0, fontSize: "12px", color: "#fff" }}>
                                                        {child.anonymous ? "🎭" : child.author?.name?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                            <span style={{ fontWeight: "bold", fontSize: "14px", color: C.textPrimary }}>{child.anonymous ? "Anonymous" : child.author?.name}</span>
                                                            {!child.anonymous && <span style={{ color: C.textSecondary, fontSize: "13px" }}>@{child.author?.username}</span>}
                                                        </div>
                                                        <p style={{ marginTop: "2px", fontSize: "14px", lineHeight: "1.4", color: C.textSecondary }}>{child.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: "center", padding: "48px", color: C.textTertiary }}>
                            No replies yet. Be the first to share your thoughts.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}