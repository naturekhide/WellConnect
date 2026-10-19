"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";
import FeedPostCard from "@/components/FeedPostCard";

export default function CircleDetailPage() {
    var C = useColors();
    var router = useRouter();
    var params = useParams();
    var circleId = params.id as string;

    var [circle, setCircle] = useState<any>(null);
    var [loading, setLoading] = useState(true);
    var [tab, setTab] = useState("feed");
    var [joining, setJoining] = useState(false);

    useEffect(function () { load(); }, [circleId]);

    var load = async function () {
        try {
            var r = await fetch("/api/circles/" + circleId);
            if (r.ok) {
                setCircle(await r.json());
            }
        } catch (e) { }
        setLoading(false);
    };

    var handleJoin = async function () {
        if (joining) return;
        setJoining(true);
        try {
            var r = await fetch("/api/circles/" + circleId + "/join", { method: "POST" });
            if (r.ok) {
                var data = await r.json();
                setCircle({
                    ...circle,
                    myStatus: data.status,
                    myRole: data.status === "approved" ? "member" : null,
                    memberCount: data.memberCount,
                });
            }
        } catch (e) { }
        setJoining(false);
    };

    if (loading) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Loading...</p>
            </main>
        );
    }

    if (!circle) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Circle not found</p>
            </main>
        );
    }

    var isMember = circle.myStatus === "approved";
    var isPending = circle.myStatus === "pending";
    var isCreator = circle.myRole === "creator";

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 100 }}>

                <div style={{ padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <button onClick={function () { router.back(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: S.md }}>
                        <span style={{ fontSize: 15, fontWeight: 500, color: C.textSecondary }}>← Back</span>
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: S.md }}>
                        <div style={{ width: 64, height: 64, borderRadius: R.md, background: circle.coverColor || C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>
                            {circle.emoji || "🌿"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: S.sm }}>
                                <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0 }}>{circle.name}</h1>
                                {circle.isPrivate && (
                                    <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, border: "1px solid " + C.border, color: C.textSecondary }}>private</span>
                                )}
                            </div>
                            <p style={{ color: C.textSecondary, fontSize: 13, marginTop: 2, margin: "2px 0 0 0" }}>
                                {circle.memberCount} {circle.memberCount === 1 ? "member" : "members"} · {circle.postCount} {circle.postCount === 1 ? "post" : "posts"}
                            </p>
                        </div>
                    </div>
                    {circle.description && (
                        <p style={{ color: C.textSecondary, fontSize: 13, marginTop: S.md, margin: S.md + "px 0 0 0", lineHeight: 1.5 }}>
                            {circle.description}
                        </p>
                    )}

                    <div style={{ marginTop: S.md }}>
                        {isCreator ? (
                            <span style={{ fontSize: 12, color: C.textTertiary }}>You created this circle</span>
                        ) : isMember ? (
                            <button onClick={handleJoin} disabled={joining} style={{ padding: "8px " + S.lg + "px", borderRadius: R.full, background: "transparent", border: "1px solid " + C.border, color: C.textPrimary, fontSize: 13, fontWeight: 600, cursor: joining ? "not-allowed" : "pointer" }}>
                                {joining ? "..." : "Leave circle"}
                            </button>
                        ) : isPending ? (
                            <span style={{ fontSize: 12, color: C.textSecondary }}>⏳ Request pending</span>
                        ) : (
                            <button onClick={handleJoin} disabled={joining} style={{ padding: "8px " + S.lg + "px", borderRadius: R.full, background: C.primary, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: joining ? "not-allowed" : "pointer" }}>
                                {joining ? "..." : (circle.isPrivate ? "Request to join" : "Join")}
                            </button>
                        )}
                    </div>
                </div>

                {isMember && (
                    <div style={{ display: "flex", padding: "0 " + S.lg + "px", borderBottom: "1px solid " + C.border }}>
                        {[
                            { id: "feed", label: "Feed" },
                            { id: "chat", label: "Chat" },
                            { id: "members", label: "Members" },
                        ].map(function (t) {
                            var active = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={function () { setTab(t.id); }}
                                    style={{ padding: S.md + "px 0", marginRight: S.xl, background: "none", border: "none", borderBottom: active ? "2px solid " + C.primary : "2px solid transparent", fontSize: 15, fontWeight: active ? 700 : 500, color: active ? C.textPrimary : C.textSecondary, cursor: "pointer", position: "relative", bottom: -1 }}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {!isMember ? (
                    <div style={{ textAlign: "center", padding: S.xxl }}>
                        <div style={{ fontSize: 40, marginBottom: S.md }}>🔒</div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: 0, marginBottom: S.sm }}>
                            {isPending ? "Waiting for approval" : "Members only"}
                        </p>
                        <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>
                            {isPending ? "The creator will approve your request soon." : "Join to see the feed and chat."}
                        </p>
                    </div>
                ) : (
                    <>
                        {tab === "feed" && <CircleFeed circleId={circleId} />}
                        {tab === "chat" && <CircleChat circleId={circleId} />}
                        {tab === "members" && <CircleMembers circleId={circleId} creatorId={circle.creator?.id} />}
                    </>
                )}

            </div>
        </main>
    );
}

function CircleFeed({ circleId }: any) {
    var C = useColors();
    var router = useRouter();
    var fileInputRef = useRef<HTMLInputElement>(null);
    var [posts, setPosts] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [content, setContent] = useState("");
    var [files, setFiles] = useState<File[]>([]);
    var [previews, setPreviews] = useState<string[]>([]);
    var [posting, setPosting] = useState(false);

    var MAX_IMAGES = 4;

    useEffect(function () { load(); }, []);

    var load = async function () {
        try {
            var r = await fetch("/api/circles/" + circleId + "/posts");
            if (r.ok) {
                var data = await r.json();
                setPosts(data.posts || []);
            }
        } catch (e) { }
        setLoading(false);
    };

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

        var r = await fetch("/api/upload/multi", { method: "POST", body: fd });
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
        try {
            var urls = await uploadFiles();

            var r = await fetch("/api/feed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content.trim(),
                    imageUrls: urls,
                    anonymous: false,
                    circleId: circleId,
                }),
            });

            if (r.ok) {
                var post = await r.json();
                setPosts([post].concat(posts));
                setContent("");
                previews.forEach(function (p) { URL.revokeObjectURL(p); });
                setFiles([]);
                setPreviews([]);
            }
        } catch (e) { }
        setPosting(false);
    };

    return (
        <div>
            <div style={{ padding: S.lg, borderBottom: "1px solid " + C.border }}>
                <textarea
                    value={content}
                    onChange={function (e) { setContent(e.target.value); }}
                    placeholder="Share something with the circle..."
                    rows={3}
                    maxLength={500}
                    style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, background: C.surface, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit", resize: "none" }}
                />

                {previews.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.sm, marginTop: S.md }}>
                        {previews.map(function (url: string, i: number) {
                            return (
                                <div key={i} style={{ position: "relative" }}>
                                    <img src={url} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: R.md }} />
                                    <button
                                        onClick={function () { handleRemove(i); }}
                                        style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: 12, background: "rgba(0,0,0,0.7)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
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
                        onClick={handlePost}
                        disabled={(!content.trim() && files.length === 0) || posting}
                        style={{
                            marginLeft: "auto",
                            padding: S.sm + "px " + S.lg + "px",
                            borderRadius: R.full,
                            background: (content.trim() || files.length > 0) ? C.primary : C.border,
                            color: (content.trim() || files.length > 0) ? "#fff" : C.textTertiary,
                            border: "none",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: (content.trim() || files.length > 0) ? "pointer" : "not-allowed",
                        }}
                    >
                        {posting ? "Posting..." : "Post"}
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
            </div>

            {loading ? (
                <p style={{ padding: S.xxl, textAlign: "center", color: C.textSecondary }}>Loading...</p>
            ) : posts.length === 0 ? (
                <div style={{ textAlign: "center", padding: S.xxl }}>
                    <div style={{ fontSize: 40, marginBottom: S.md }}>🌿</div>
                    <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>No posts yet. Be the first.</p>
                </div>
            ) : (
                posts.map(function (post: any) {
                    return (
                        <FeedPostCard
                            key={post.id}
                            post={post}
                            onPress={function () { router.push("/connect/" + post.id); }}
                        />
                    );
                })
            )}
        </div>
    );
}

function CircleChat({ circleId }: any) {
    var C = useColors();
    var [messages, setMessages] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [text, setText] = useState("");
    var [sending, setSending] = useState(false);
    var [replyingTo, setReplyingTo] = useState<any>(null);
    var [activeMenu, setActiveMenu] = useState<string | null>(null);
    var [editingMessage, setEditingMessage] = useState<any>(null);
    var bottomRef = useRef<HTMLDivElement>(null);

    useEffect(function () {
        loadInitial();
        var interval = setInterval(poll, 3000);
        return function () { clearInterval(interval); };
    }, []);

    useEffect(function () {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    var loadInitial = async function () {
        try {
            var r = await fetch("/api/circles/" + circleId + "/messages");
            if (r.ok) {
                var data = await r.json();
                setMessages(data.messages || []);
            }
        } catch (e) { }
        setLoading(false);
    };

    var poll = async function () {
        if (!messages.length) return;
        var last = messages[messages.length - 1].createdAt;
        try {
            var r = await fetch("/api/circles/" + circleId + "/messages?since=" + encodeURIComponent(last));
            if (r.ok) {
                var data = await r.json();
                if (data.messages && data.messages.length > 0) {
                    setMessages(messages.concat(data.messages));
                }
            }
        } catch (e) { }
    };

    var handleSend = async function () {
        if (!text.trim() || sending) return;
        setSending(true);
        try {
            var payload: any = { content: text.trim() };
            if (replyingTo) payload.replyToId = replyingTo.id;

            var r = await fetch("/api/circles/" + circleId + "/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (r.ok) {
                var msg = await r.json();
                setMessages(messages.concat([msg]));
                setText("");
                setReplyingTo(null);
            }
        } catch (e) { }
        setSending(false);
    };

    var handleSaveEdit = async function () {
        if (!text.trim() || !editingMessage) return;
        try {
            // UPDATED URL: passing messageId as a query parameter to match the route structure
            var r = await fetch("/api/circles/" + circleId + "/messages/edit?messageId=" + editingMessage.id, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text.trim() }),
            });
            if (r.ok) {
                var data = await r.json();
                setMessages(messages.map(function (m) {
                    return m.id === editingMessage.id ? { ...m, content: data.content } : m;
                }));
                setEditingMessage(null);
                setText("");
            } else {
                var err = await r.json();
                alert("Failed to edit: " + (err.error || "Unknown error"));
            }
        } catch (e) { }
    };

    var handleDelete = async function (messageId: string) {
        if (!window.confirm("Delete this message?")) return;
        setActiveMenu(null);
        try {
            var r = await fetch("/api/circles/" + circleId + "/messages/" + messageId, {
                method: "DELETE",
            });
            if (r.ok) {
                setMessages(messages.filter(function (m) { return m.id !== messageId; }));
            }
        } catch (e) { }
    };

    var handleReply = function (m: any) {
        setReplyingTo(m);
        setEditingMessage(null);
        setText("");
    };

    var handleEdit = function (m: any) {
        setEditingMessage(m);
        setReplyingTo(null);
        setText(m.content);
    };

    return (
        <div>
            <div className="no-scrollbar" style={{ minHeight: 300, maxHeight: "60vh", overflowY: "auto", padding: S.lg }}>
                {loading ? (
                    <p style={{ textAlign: "center", color: C.textSecondary }}>Loading...</p>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: "center", padding: S.xxl }}>
                        <div style={{ fontSize: 40, marginBottom: S.md }}>💬</div>
                        <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>No messages yet. Say hi.</p>
                    </div>
                ) : (
                    messages.map(function (m: any) {
                        var isMine = m.isMine;
                        var isEditing = editingMessage && editingMessage.id === m.id;
                        var isEditable = isMine && (Date.now() - new Date(m.createdAt).getTime() < 15 * 60 * 1000);

                        return (
                            <div
                                key={m.id}
                                style={{ display: "flex", flexDirection: isMine ? "row-reverse" : "row", alignItems: "flex-end", marginBottom: S.sm, gap: 8 }}
                                onMouseLeave={function () { setActiveMenu(null); }}
                            >
                                {!isEditing && (
                                    <div style={{ position: "relative", paddingBottom: 6 }}>
                                        <button onClick={function () { setActiveMenu(activeMenu === m.id ? null : m.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.textTertiary, fontSize: 18, padding: "0 6px" }}>···</button>

                                        {activeMenu === m.id && (
                                            <div style={{ position: "absolute", bottom: "100%", [isMine ? "right" : "left"]: 0, background: C.surface, border: "1px solid " + C.border, borderRadius: R.md, padding: 4, zIndex: 10, minWidth: 120, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                                                <button onClick={function () { handleReply(m); setActiveMenu(null); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "6px 12px", cursor: "pointer", fontSize: 13, color: C.textPrimary }}>Reply</button>
                                                {isMine && (
                                                    <>
                                                        {isEditable && (
                                                            <button onClick={function () { handleEdit(m); setActiveMenu(null); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "6px 12px", cursor: "pointer", fontSize: 13, color: C.textPrimary }}>Edit</button>
                                                        )}
                                                        <button onClick={function () { handleDelete(m.id); setActiveMenu(null); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "6px 12px", cursor: "pointer", fontSize: 13, color: C.danger }}>Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ maxWidth: isEditing ? "100%" : "75%", flex: isEditing ? 1 : "none", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>

                                    {!isMine && !isEditing && <p style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, margin: "0 0 2px 4px" }}>{m.user?.name}</p>}

                                    <div style={{ padding: S.sm + "px " + S.md + "px", borderRadius: R.lg, background: isMine ? C.primary : C.surfaceAlt, color: isMine ? "#fff" : C.textPrimary, position: "relative", overflow: "hidden", width: isEditing ? "100%" : "auto" }}>

                                        {!isEditing && m.replyTo && (
                                            <div style={{ background: isMine ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)", padding: 6, borderRadius: 6, marginBottom: 6, borderLeft: "3px solid " + (isMine ? "#fff" : C.primary) }}>
                                                <p style={{ fontSize: 11, fontWeight: 700, color: isMine ? "#fff" : C.primary, margin: 0 }}>{m.replyTo.senderName}</p>
                                                <p style={{ fontSize: 12, color: isMine ? "rgba(255,255,255,0.8)" : C.textSecondary, margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.replyTo.content}</p>
                                            </div>
                                        )}

                                        {isEditing ? (
                                            <div>
                                                <textarea
                                                    value={text}
                                                    onChange={function (e) { setText(e.target.value); }}
                                                    style={{ width: "100%", background: "rgba(0,0,0,0.1)", border: "none", color: "#fff", borderRadius: 4, padding: 8, fontSize: 14, outline: "none", resize: "none" }}
                                                    rows={2}
                                                />
                                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                                                    <button onClick={function () { setEditingMessage(null); setText(""); }} style={{ background: "none", border: "none", color: "#fff", opacity: 0.7, cursor: "pointer", fontSize: 12 }}>Cancel</button>
                                                    <button onClick={handleSaveEdit} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Save</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p style={{ fontSize: 14, lineHeight: 1.4, margin: 0, wordBreak: "break-word" }}>{m.content}</p>
                                        )}

                                        {!isEditing && (
                                            <p style={{ fontSize: 10, opacity: 0.7, margin: "4px 0 0 0", textAlign: isMine ? "right" : "left" }}>
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            <div style={{ position: "fixed", bottom: 72, left: 0, right: 0, background: C.background, borderTop: "1px solid " + C.border, padding: S.md }}>
                <div style={{ maxWidth: 600, margin: "0 auto" }}>

                    {replyingTo && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surfaceAlt, padding: S.sm, borderRadius: R.md, marginBottom: S.sm, borderLeft: "3px solid " + C.primary }}>
                            <div style={{ overflow: "hidden" }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: C.primary, margin: 0 }}>Replying to {replyingTo.user?.name}</p>
                                <p style={{ fontSize: 12, color: C.textSecondary, margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{replyingTo.content}</p>
                            </div>
                            <button onClick={function () { setReplyingTo(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, fontSize: 16 }}>✕</button>
                        </div>
                    )}

                    {!editingMessage && (
                        <div style={{ display: "flex", gap: S.sm }}>
                            <input
                                type="text"
                                value={text}
                                onChange={function (e) { setText(e.target.value); }}
                                onKeyDown={function (e) { if (e.key === "Enter") handleSend(); }}
                                placeholder="Message the circle..."
                                maxLength={500}
                                style={{ flex: 1, padding: S.md, borderRadius: R.full, border: "1px solid " + C.border, fontSize: 14, background: C.surfaceAlt, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!text.trim() || sending}
                                style={{ width: 40, height: 40, borderRadius: 20, background: text.trim() ? C.primary : C.border, color: text.trim() ? "#fff" : C.textTertiary, border: "none", fontSize: 16, fontWeight: 700, cursor: text.trim() ? "pointer" : "not-allowed", flexShrink: 0 }}
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CircleMembers({ circleId, creatorId }: any) {
    var C = useColors();
    var [members, setMembers] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);

    useEffect(function () { load(); }, []);

    var load = async function () {
        try {
            var r = await fetch("/api/circles/" + circleId + "/members");
            if (r.ok) {
                var data = await r.json();
                setMembers(data.members || []);
            }
        } catch (e) { }
        setLoading(false);
    };

    if (loading) {
        return <p style={{ padding: S.xxl, textAlign: "center", color: C.textSecondary }}>Loading...</p>;
    }

    return (
        <div style={{ padding: S.lg }}>
            {members.map(function (m: any) {
                return (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: S.md, padding: S.md, borderRadius: R.md, background: C.surface, marginBottom: S.sm }}>
                        <div style={{ width: 36, height: 36, borderRadius: 18, background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                            {m.user?.name?.charAt(0) || "U"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>{m.user?.name || "User"}</p>
                            <p style={{ fontSize: 12, color: C.textSecondary, marginTop: 2, margin: "2px 0 0 0" }}>@{m.user?.username || "user"}</p>
                        </div>
                        {m.role === "creator" && (
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: C.primaryLight, color: C.primary }}>
                                creator
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}