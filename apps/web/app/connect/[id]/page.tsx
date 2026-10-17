"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";

var REACTIONS = [
    { type: "hug", emoji: "🤗" },
    { type: "growth", emoji: "🌱" },
    { type: "strength", emoji: "💪" },
    { type: "grateful", emoji: "🙏" },
];

var IMAGE_BASE = "";

export default function FeedPostDetailPage() {
    var C = useColors();
    var router = useRouter();
    var params = useParams();
    var postId = params.id as string;

    var [post, setPost] = useState<any>(null);
    var [loading, setLoading] = useState(true);
    var [replyText, setReplyText] = useState("");
    var [replying, setReplying] = useState(false);
    var [anonymousReply, setAnonymousReply] = useState(false);
    var [myReaction, setMyReaction] = useState<string | null>(null);
    var [reactions, setReactions] = useState<any>({});
    var [openReplyBox, setOpenReplyBox] = useState<string | null>(null);
    var [toast, setToast] = useState<any>(null);
    var replyRef = useRef<HTMLTextAreaElement>(null);

    useEffect(function () { load(); }, [postId]);

    useEffect(function () {
        if (replyRef.current) {
            replyRef.current.style.height = "auto";
            replyRef.current.style.height = Math.min(replyRef.current.scrollHeight, 160) + "px";
            replyRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }, [replyText]);

    var load = async function () {
        try {
            var r = await fetch("/api/feed/" + postId);
            if (r.ok) {
                var data = await r.json();
                setPost(data);
                setMyReaction(data.myReaction);
                setReactions(data.reactions);
            }
        } catch (e) { }
        setLoading(false);
    };

    var handleReact = async function (type: string) {
        try {
            var r = await fetch("/api/feed/" + postId + "/react", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type }),
            });
            if (r.ok) {
                var res = await r.json();
                setReactions(res.reactions);
                setMyReaction(res.myReaction);
            }
        } catch (e) { }
    };

    var handleReply = async function (parentId: string | null) {
        if (!replyText.trim()) return;
        setReplying(true);
        try {
            var r = await fetch("/api/feed/" + postId + "/reply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: replyText.trim(), anonymous: anonymousReply, parentId: parentId }),
            });
            if (r.ok) {
                var newReply = await r.json();
                newReply.isMine = true; // We just made it
                var updated = { ...post };
                if (parentId) {
                    updated.replies = insertChild(post.replies || [], parentId, newReply);
                } else {
                    updated.replies = (post.replies || []).concat([newReply]);
                }
                setPost(updated);
                setReplyText("");
                setOpenReplyBox(null);
            }
        } catch (e) { }
        setReplying(false);
    };

    var insertChild = function (tree: any[], parentId: string, child: any): any[] {
        return tree.map(function (node) {
            if (node.id === parentId) {
                return { ...node, children: (node.children || []).concat([child]) };
            }
            if (node.children && node.children.length > 0) {
                return { ...node, children: insertChild(node.children, parentId, child) };
            }
            return node;
        });
    };

    var removeReply = function (tree: any[], replyId: string): any[] {
        return tree.map(function (node) {
            if (node.id === replyId) return null;
            if (node.children) {
                return { ...node, children: removeReply(node.children, replyId).filter(Boolean) };
            }
            return node;
        }).filter(Boolean);
    };

    var updateReplyContent = function (tree: any[], replyId: string, content: string, editedAt: string): any[] {
        return tree.map(function (node) {
            if (node.id === replyId) {
                return { ...node, content, editedAt };
            }
            if (node.children) {
                return { ...node, children: updateReplyContent(node.children, replyId, content, editedAt) };
            }
            return node;
        });
    };

    var handleReplyDeleted = function (replyId: string) {
        setPost({ ...post, replies: removeReply(post.replies || [], replyId) });
        setToast({ replyId: replyId });
        setTimeout(function () {
            setToast(function (current: any) {
                return current && current.replyId === replyId ? null : current;
            });
        }, 5000);
    };

    var handleReplyUpdated = function (replyId: string, content: string, editedAt: string) {
        setPost({ ...post, replies: updateReplyContent(post.replies || [], replyId, content, editedAt) });
    };

    var handleUndoDelete = async function () {
        if (!toast) return;
        var replyId = toast.replyId;
        setToast(null);
        try {
            await fetch("/api/feed/" + postId + "/reply/" + replyId + "/restore", { method: "POST" });
            await load();
        } catch (e) { }
    };

    var countReplies = function (tree: any[]): number {
        var n = 0;
        (tree || []).forEach(function (r) {
            n += 1 + countReplies(r.children || []);
        });
        return n;
    };

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

    if (loading) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Loading...</p>
            </main>
        );
    }

    if (!post) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Post not found</p>
            </main>
        );
    }

    var totalReplies = countReplies(post.replies || []);

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <button onClick={function () { router.back(); }} style={{ background: "none", border: "none", cursor: "pointer", width: 32, textAlign: "left", padding: 0 }}>
                        <span style={{ fontSize: 22, color: C.textPrimary }}>←</span>
                    </button>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>Moment</span>
                    <div style={{ width: 32 }} />
                </div>

                <div style={{ padding: S.lg, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <div style={{ display: "flex", gap: S.md, marginBottom: S.md }}>
                        <div style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: post.anonymous ? C.surfaceAlt : C.primary, border: post.anonymous ? "1px solid " + C.border : "none" }}>
                            <span style={{ fontSize: 16, fontWeight: 700, color: post.anonymous ? C.textSecondary : "#fff" }}>
                                {post.anonymous ? "🎭" : post.author?.name?.charAt(0) || "U"}
                            </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                                <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>
                                    {post.anonymous ? "Anonymous" : post.author?.name || "User"}
                                </span>
                                {!post.anonymous && post.author?.username && (
                                    <span style={{ fontSize: 14, color: C.textSecondary }}>@{post.author.username}</span>
                                )}
                                {post.anonymous && (
                                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, border: "1px solid " + C.primary, color: C.primary }}>
                                        anonymous
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: 13, color: C.textTertiary, marginTop: 2, margin: "2px 0 0 0" }}>{timeAgo(post.createdAt)}</p>
                        </div>
                    </div>

                    <p style={{ fontSize: 17, lineHeight: 1.5, color: C.textPrimary, margin: "0 0 " + S.md + "px 0" }}>{post.content}</p>

                    {post.imageUrls && post.imageUrls.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: S.sm, marginBottom: S.md }}>
                            {post.imageUrls.map(function (url: string, i: number) {
                                return <img key={i} src={IMAGE_BASE + url} style={{ width: "100%", height: "auto", maxHeight: 500, objectFit: "contain", borderRadius: R.lg, border: "1px solid " + C.border, display: "block" }} />;
                            })}
                        </div>
                    )}

                    <div style={{ display: "flex", gap: S.sm, paddingTop: S.md, borderTop: "1px solid " + C.border }}>
                        {REACTIONS.map(function (r: any) {
                            var isActive = myReaction === r.type;
                            var count = (reactions && reactions[r.type]) || 0;
                            return (
                                <button key={r.type} onClick={function () { handleReact(r.type); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px " + S.md + "px", borderRadius: R.full, background: isActive ? C.primaryLight : "transparent", border: "none", cursor: "pointer" }}>
                                    <span style={{ fontSize: 18 }}>{r.emoji}</span>
                                    {count > 0 && <span style={{ fontSize: 14, fontWeight: 600, color: isActive ? C.primary : C.textSecondary }}>{count}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, padding: S.lg + " " + S.lg + " " + S.sm, margin: 0 }}>
                    {totalReplies} {totalReplies === 1 ? "reply" : "replies"}
                </p>

                {(post.replies || []).map(function (reply: any) {
                    return <ReplyNode key={reply.id} reply={reply} depth={0} C={C} timeAgo={timeAgo} onReplyClick={setOpenReplyBox} openReplyBox={openReplyBox} handleReply={handleReply} replyText={replyText} setReplyText={setReplyText} anonymousReply={anonymousReply} setAnonymousReply={setAnonymousReply} replying={replying} replyRef={replyRef} postId={postId} onDeleted={handleReplyDeleted} onUpdated={handleReplyUpdated} />;
                })}

                {totalReplies === 0 && (
                    <div style={{ padding: S.xxl, textAlign: "center" }}>
                        <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>No replies yet. Be the first to respond with kindness.</p>
                    </div>
                )}

                <div style={{ paddingBottom: 140 }} />
            </div>

            <div style={{ position: "fixed", bottom: 72, left: 0, right: 0, background: C.background, borderTop: "1px solid " + C.border, padding: S.md }}>
                <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", alignItems: "flex-end", gap: S.sm }}>
                    <button onClick={function () { setAnonymousReply(!anonymousReply); }} style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: anonymousReply ? C.primaryLight : C.surfaceAlt, border: "1px solid " + (anonymousReply ? C.primary : C.border), cursor: "pointer" }}>
                        <span style={{ fontSize: 18 }}>🎭</span>
                    </button>
                    <textarea
                        ref={openReplyBox === null ? replyRef : undefined}
                        value={openReplyBox === null ? replyText : ""}
                        onChange={function (e) { if (openReplyBox === null) setReplyText(e.target.value); }}
                        placeholder={openReplyBox === null ? "Reply with kindness..." : "Tap reply on a comment to respond"}
                        maxLength={300}
                        rows={1}
                        disabled={openReplyBox !== null}
                        style={{ flex: 1, borderRadius: R.md, padding: S.sm + 2 + "px " + S.md, fontSize: 14, minHeight: 40, maxHeight: 160, border: "1px solid " + C.border, background: C.surfaceAlt, color: C.textPrimary, fontFamily: "inherit", resize: "none", boxSizing: "border-box", lineHeight: 1.4, outline: "none", overflow: "hidden", opacity: openReplyBox !== null ? 0.5 : 1 }}
                    />
                    <button onClick={function () { if (openReplyBox === null) handleReply(null); }} disabled={openReplyBox !== null || !replyText.trim() || replying} style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: replyText.trim() && openReplyBox === null ? C.primary : C.surfaceAlt, border: "none", cursor: replyText.trim() ? "pointer" : "not-allowed" }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: replyText.trim() && openReplyBox === null ? "#fff" : C.textTertiary }}>{replying ? "..." : "→"}</span>
                    </button>
                </div>
            </div>

            {toast && (
                <div style={{ position: "fixed", bottom: 140, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 100, pointerEvents: "none" }}>
                    <div style={{ background: "#1f2937", color: "#fff", padding: "12px 20px", borderRadius: 999, fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", pointerEvents: "auto" }}>
                        <span>Reply deleted</span>
                        <button onClick={handleUndoDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#10b981", fontWeight: 700, fontSize: 14, padding: 0 }}>Undo</button>
                    </div>
                </div>
            )}
        </main>
    );
}

function ReplyNode({ reply, depth, C, timeAgo, onReplyClick, openReplyBox, handleReply, replyText, setReplyText, anonymousReply, setAnonymousReply, replying, replyRef, postId, onDeleted, onUpdated }: any) {
    var isOpen = openReplyBox === reply.id;
    var [showMenu, setShowMenu] = useState(false);
    var [editing, setEditing] = useState(false);
    var [editContent, setEditContent] = useState(reply.content);
    var [currentContent, setCurrentContent] = useState(reply.content);
    var [currentEditedAt, setCurrentEditedAt] = useState(reply.editedAt);
    var menuRef = useRef<any>(null);

    useEffect(function () {
        if (!showMenu) return;
        var handler = function (e: any) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return function () { document.removeEventListener("mousedown", handler); };
    }, [showMenu]);

    var isEditable = reply.isMine && reply.createdAt && (Date.now() - new Date(reply.createdAt).getTime() < 15 * 60 * 1000);

    var handleSaveEdit = async function () {
        if (!editContent.trim()) return;
        try {
            var r = await fetch("/api/feed/" + postId + "/reply/" + reply.id, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editContent.trim() }),
            });
            if (r.ok) {
                var data = await r.json();
                setCurrentContent(data.content);
                setCurrentEditedAt(data.editedAt);
                setEditing(false);
                if (onUpdated) onUpdated(reply.id, data.content, data.editedAt);
            }
        } catch (e) { }
    };

    var handleDelete = async function () {
        if (!window.confirm("Delete this reply?")) return;
        setShowMenu(false);
        try {
            var r = await fetch("/api/feed/" + postId + "/reply/" + reply.id, { method: "DELETE" });
            if (r.ok && onDeleted) onDeleted(reply.id);
        } catch (e) { }
    };

    return (
        <div style={{ paddingLeft: S.lg + (depth * 24) }}>
            <div style={{ paddingRight: S.lg, paddingTop: S.md, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                <div style={{ display: "flex", alignItems: "center", gap: S.sm, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: reply.anonymous ? C.surfaceAlt : C.primary, border: reply.anonymous ? "1px solid " + C.border : "none" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: reply.anonymous ? C.textSecondary : "#fff" }}>
                            {reply.anonymous ? "🎭" : reply.author?.name?.charAt(0) || "U"}
                        </span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
                        {reply.anonymous ? "Anonymous" : reply.author?.name || "User"}
                    </span>
                    <span style={{ fontSize: 12, color: C.textTertiary }}>{timeAgo(reply.createdAt)}</span>
                    {currentEditedAt && <span style={{ fontSize: 11, color: C.textTertiary }}>· edited</span>}

                    {reply.isMine && (
                        <div ref={menuRef} style={{ marginLeft: "auto", position: "relative" }}>
                            <button onClick={function (e) { e.stopPropagation(); setShowMenu(!showMenu); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.textSecondary, padding: "0 4px" }}>···</button>
                            {showMenu && (
                                <div style={{ position: "absolute", top: "100%", right: 0, zIndex: 10, background: C.surface, border: "1px solid " + C.border, borderRadius: R.md, padding: S.xs, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: 110 }}>
                                    {isEditable && (
                                        <button onClick={function () { setEditing(true); setShowMenu(false); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: S.sm + "px " + S.md + "px", cursor: "pointer", fontSize: 13, color: C.textPrimary }}>Edit</button>
                                    )}
                                    <button onClick={handleDelete} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: S.sm + "px " + S.md + "px", cursor: "pointer", fontSize: 13, color: C.danger }}>Delete</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {editing ? (
                    <div style={{ marginTop: S.sm }}>
                        <textarea value={editContent} onChange={function (e) { setEditContent(e.target.value); }} maxLength={300} style={{ width: "100%", padding: S.sm, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, background: C.surface, color: C.textPrimary, fontFamily: "inherit", resize: "none", marginBottom: S.sm, outline: "none" }} />
                        <div style={{ display: "flex", gap: S.sm, justifyContent: "flex-end" }}>
                            <button onClick={function () { setEditing(false); setEditContent(currentContent); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.textSecondary }}>Cancel</button>
                            <button onClick={handleSaveEdit} style={{ background: C.primary, color: "#fff", border: "none", padding: "4px 12px", borderRadius: R.md, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Save</button>
                        </div>
                    </div>
                ) : (
                    <p style={{ fontSize: 15, lineHeight: 1.4, color: C.textPrimary, margin: 0 }}>{currentContent}</p>
                )}

                {!editing && (
                    <button onClick={function () { onReplyClick(isOpen ? null : reply.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: C.textSecondary, padding: "6px 0", marginTop: 2 }}>
                        Reply
                    </button>
                )}

                {isOpen && (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: S.sm, marginTop: S.sm }}>
                        <button onClick={function () { setAnonymousReply(!anonymousReply); }} style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: anonymousReply ? C.primaryLight : C.surfaceAlt, border: "1px solid " + (anonymousReply ? C.primary : C.border), cursor: "pointer" }}>
                            <span style={{ fontSize: 14 }}>🎭</span>
                        </button>
                        <textarea ref={replyRef} value={replyText} onChange={function (e) { setReplyText(e.target.value); }} placeholder={"Reply to " + (reply.anonymous ? "Anonymous" : reply.author?.name || "User") + "..."} maxLength={300} rows={1} autoFocus style={{ flex: 1, borderRadius: R.md, padding: S.sm + 2 + "px " + S.md, fontSize: 14, minHeight: 36, maxHeight: 160, border: "1px solid " + C.border, background: C.surfaceAlt, color: C.textPrimary, fontFamily: "inherit", resize: "none", boxSizing: "border-box", lineHeight: 1.4, outline: "none", overflow: "hidden" }} />
                        <button onClick={function () { handleReply(reply.id); }} disabled={!replyText.trim() || replying} style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: replyText.trim() ? C.primary : C.surfaceAlt, border: "none", cursor: replyText.trim() ? "pointer" : "not-allowed" }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: replyText.trim() ? "#fff" : C.textTertiary }}>{replying ? "..." : "→"}</span>
                        </button>
                    </div>
                )}
            </div>

            {(reply.children || []).map(function (child: any) {
                return <ReplyNode key={child.id} reply={child} depth={depth + 1} C={C} timeAgo={timeAgo} onReplyClick={onReplyClick} openReplyBox={openReplyBox} handleReply={handleReply} replyText={replyText} setReplyText={setReplyText} anonymousReply={anonymousReply} setAnonymousReply={setAnonymousReply} replying={replying} replyRef={replyRef} postId={postId} onDeleted={onDeleted} onUpdated={onUpdated} />;
            })}
        </div>
    );
}