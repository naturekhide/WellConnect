"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FeedPostCard from "@/components/FeedPostCard";

export default function WebPostDetail() {
    const params = useParams();
    const router = useRouter();
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
                    anonymous: false // You can add an anonymous toggle here later
                }),
            });

            if (res.ok) {
                // Refetch the post to get the new reply
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
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "80px 0 100px", color: "white" }}>
            {/* Header / Back Button */}
            <div style={{ padding: "0 24px" }}>
                <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#10b981", cursor: "pointer", marginBottom: "20px", fontSize: "16px", fontWeight: "600" }}>
                    ← Back
                </button>
            </div>

            {/* Main Post (Reusing your FeedPostCard) */}
            <FeedPostCard
                post={post}
                onPress={() => { }} // Disable navigation on the detail page
                onDelete={() => router.push("/connect")}
            />

            {/* Reply Composer */}
            <div style={{ padding: "24px", borderBottom: "1px solid #2a2a2a" }}>
                {replyTo && (
                    <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                        <span>Replying to @{replyTo.author?.username || "Anonymous"}</span>
                        <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>Cancel</button>
                    </div>
                )}
                <form onSubmit={handleReply} style={{ display: "flex", gap: "12px" }}>
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Post your reply..."
                        style={{ flex: 1, padding: "12px 16px", borderRadius: "999px", border: "1px solid #2a2a2a", background: "#1a1a1a", color: "white", outline: "none" }}
                    />
                    <button
                        type="submit"
                        disabled={!replyText.trim() || postingReply}
                        style={{ padding: "0 24px", borderRadius: "999px", background: replyText.trim() ? "#10b981" : "#2a2a2a", color: replyText.trim() ? "white" : "#9ca3af", border: "none", fontWeight: "600", cursor: replyText.trim() ? "pointer" : "default" }}
                    >
                        {postingReply ? "..." : "Reply"}
                    </button>
                </form>
            </div>

            {/* Threaded Replies */}
            <div>
                {post.replies && post.replies.length > 0 ? (
                    post.replies.map((reply: any) => (
                        <div key={reply.id} style={{ padding: "16px 24px", borderBottom: "1px solid #2a2a2a", display: "flex", gap: "12px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "20px", background: reply.anonymous ? "#2a2a2a" : "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>
                                {reply.anonymous ? "🎭" : reply.author?.name?.charAt(0) || "U"}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <span style={{ fontWeight: "bold" }}>{reply.anonymous ? "Anonymous" : reply.author?.name}</span>
                                    {!reply.anonymous && <span style={{ color: "#9ca3af", fontSize: "14px" }}>@{reply.author?.username}</span>}
                                    <span style={{ color: "#4b5563", fontSize: "14px" }}>· {new Date(reply.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={{ marginTop: "4px", fontSize: "15px", lineHeight: "1.4" }}>{reply.content}</p>

                                <button
                                    onClick={() => setReplyTo(reply)}
                                    style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "13px", marginTop: "8px", cursor: "pointer", padding: 0 }}
                                >
                                    Reply
                                </button>

                                {/* Nested Replies (Children) */}
                                {reply.children && reply.children.length > 0 && (
                                    <div style={{ marginTop: "16px", borderLeft: "2px solid #2a2a2a", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {reply.children.map((child: any) => (
                                            <div key={child.id} style={{ display: "flex", gap: "12px" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "16px", background: child.anonymous ? "#2a2a2a" : "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0, fontSize: "12px" }}>
                                                    {child.anonymous ? "🎭" : child.author?.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>{child.anonymous ? "Anonymous" : child.author?.name}</span>
                                                        {!child.anonymous && <span style={{ color: "#9ca3af", fontSize: "13px" }}>@{child.author?.username}</span>}
                                                    </div>
                                                    <p style={{ marginTop: "2px", fontSize: "14px", lineHeight: "1.4", color: "#d1d5db" }}>{child.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
                        No replies yet. Be the first to share your thoughts.
                    </div>
                )}
            </div>
        </div>
    );
}