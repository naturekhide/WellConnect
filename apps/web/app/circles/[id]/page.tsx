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
                await load(); // 👈 This refreshes the feed with the properly formatted data
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

// ─────────────────────────────────────────────────────────────
// CHAT COMPONENT (Updated with Reactions & Voice Notes)
// ─────────────────────────────────────────────────────────────

function CircleChat({ circleId }: any) {
    var C = useColors();
    var [messages, setMessages] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
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

    // 🚨 REACTION HANDLER
    var handleReaction = async function (messageId: string, emoji: string) {
        setActiveMenu(null);
        // Optimistic update
        setMessages(messages.map(function (m) {
            if (m.id !== messageId) return m;
            var existing = (m.reactions || []).find(function (r: any) { return r.mine; });

            if (existing && existing.emoji === emoji) {
                // Toggle off
                return { ...m, reactions: m.reactions.filter(function (r: any) { return !r.mine; }) };
            }
            if (existing) {
                // Change emoji
                return { ...m, reactions: m.reactions.map(function (r: any) { return r.mine ? { ...r, emoji } : r; }) };
            }
            // Add new
            return { ...m, reactions: [...(m.reactions || []), { emoji, count: 1, mine: true }] };
        }));

        try {
            await fetch("/api/circles/" + circleId + "/messages/" + messageId + "/react", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emoji }),
            });
            // Re-fetch to sync exactly with backend
            loadInitial();
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
    };

    var handleEdit = function (m: any) {
        setEditingMessage(m);
        setReplyingTo(null);
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
                        var isAudio = m.content.startsWith("🎤 ");

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
                                            <div style={{ position: "absolute", bottom: "100%", [isMine ? "right" : "left"]: 0, background: C.surface, border: "1px solid " + C.border, borderRadius: R.md, padding: 4, zIndex: 10, minWidth: 140, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>

                                                {/* 🚨 QUICK REACTIONS ROW (Top of Menu) */}
                                                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: "1px solid " + C.border, marginBottom: 4 }}>
                                                    {["❤️", "😂", "👍", "😮", "😢"].map(function (emoji) {
                                                        return (
                                                            <button key={emoji} onClick={function () { handleReaction(m.id, emoji); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 2 }}>
                                                                {emoji}
                                                            </button>
                                                        )
                                                    })}
                                                </div>

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
                                            <CircleChatInput
                                                circleId={circleId}
                                                initialText={m.content}
                                                editingMessageId={m.id}
                                                onCancelEdit={function () { setEditingMessage(null); }}
                                                onSent={loadInitial}
                                                isEditingStyle={true}
                                            />
                                        ) : (
                                            isAudio ? (
                                                <audio controls src={m.content.replace("🎤 ", "")} style={{ maxWidth: "100%", height: 40, marginTop: 4 }} />
                                            ) : (
                                                <p style={{ fontSize: 14, lineHeight: 1.4, margin: 0, wordBreak: "break-word" }}>{m.content}</p>
                                            )
                                        )}

                                        {!isEditing && (
                                            <p style={{ fontSize: 10, opacity: 0.7, margin: "4px 0 0 0", textAlign: isMine ? "right" : "left" }}>
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                                            </p>
                                        )}
                                    </div>

                                    {/* 🚨 RENDER REACTIONS PILLS */}
                                    {m.reactions && m.reactions.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4, justifyContent: isMine ? "flex-end" : "flex-start" }}>
                                            {m.reactions.map(function (r: any, i: number) {
                                                return (
                                                    <div key={i} style={{ background: r.mine ? C.primaryLight : C.surface, border: "1px solid " + (r.mine ? C.primary : C.border), borderRadius: 12, padding: "2px 6px", display: "flex", alignItems: "center", gap: 4 }}>
                                                        <span style={{ fontSize: 12 }}>{r.emoji}</span>
                                                        <span style={{ fontSize: 10, color: r.mine ? C.primary : C.textSecondary }}>{r.count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* COMPOSER AREA */}
            <div style={{ position: "fixed", bottom: 72, left: 0, right: 0, background: C.background, borderTop: "1px solid " + C.border, padding: S.md }}>
                <div style={{ maxWidth: 600, margin: "0 auto" }}>
                    {!editingMessage && (
                        <CircleChatInput
                            circleId={circleId}
                            replyingTo={replyingTo}
                            onCancelReply={function () { setReplyingTo(null); }}
                            onSent={function (msg: any) {
                                setMessages(messages.concat([msg]));
                                setReplyingTo(null);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// NEW: COMPOSER COMPONENT (TEXT + VOICE + EDIT)
// ─────────────────────────────────────────────────────────────

function CircleChatInput({ circleId, replyingTo, onCancelReply, onSent, initialText = "", editingMessageId, onCancelEdit, isEditingStyle }: any) {
    var C = useColors();
    var [text, setText] = useState(initialText);
    var [sending, setSending] = useState(false);
    var [isRecording, setIsRecording] = useState(false);
    var mediaRecorderRef = useRef<MediaRecorder | null>(null);
    var audioChunksRef = useRef<Blob[]>([]);

    var handleSend = async function (overrideContent?: string) {
        var content = overrideContent || text;
        if (!content.trim() || sending) return;
        setSending(true);

        try {
            var payload: any = { content: content.trim() };
            if (replyingTo) payload.replyToId = replyingTo.id;

            if (editingMessageId) {
                var rEdit = await fetch("/api/circles/" + circleId + "/messages/edit?messageId=" + editingMessageId, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: text.trim() }),
                });
                if (rEdit.ok) onSent(); // triggers reload
            } else {
                var r = await fetch("/api/circles/" + circleId + "/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (r.ok) {
                    var msg = await r.json();
                    onSent(msg);
                    setText("");
                }
            }
        } catch (e) { }
        setSending(false);
    };

    var startRecording = async function () {
        try {
            var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            var recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = function (e) {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = async function () {
                var audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                stream.getTracks().forEach(function (track) { track.stop(); }); // stop mic

                // Upload
                setSending(true);
                try {
                    var fd = new FormData();
                    fd.append("files", audioBlob, "voice-note.webm");
                    var upRes = await fetch("/api/upload/multi", { method: "POST", body: fd });
                    if (upRes.ok) {
                        var data = await upRes.json();
                        var url = data.urls[0];
                        await handleSend("🎤 " + url);
                    }
                } catch (e) { }
                setSending(false);
            };

            recorder.start();
            setIsRecording(true);
        } catch (e) {
            alert("Microphone access denied or not available.");
        }
    };

    var stopRecording = function () {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div style={{ width: "100%" }}>
            {replyingTo && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surfaceAlt, padding: S.sm, borderRadius: R.md, marginBottom: S.sm, borderLeft: "3px solid " + C.primary }}>
                    <div style={{ overflow: "hidden" }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: C.primary, margin: 0 }}>Replying to {replyingTo.user?.name}</p>
                        <p style={{ fontSize: 12, color: C.textSecondary, margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{replyingTo.content}</p>
                    </div>
                    <button onClick={onCancelReply} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, fontSize: 16 }}>✕</button>
                </div>
            )}

            <div style={{ display: "flex", gap: S.sm, alignItems: "center" }}>
                <input
                    type="text"
                    value={text}
                    onChange={function (e) { setText(e.target.value); }}
                    onKeyDown={function (e) { if (e.key === "Enter") handleSend(); }}
                    placeholder={isRecording ? "Recording..." : "Message the circle..."}
                    disabled={isRecording || sending}
                    maxLength={500}
                    style={{ flex: 1, padding: S.md, borderRadius: R.full, border: "1px solid " + C.border, fontSize: 14, background: C.surfaceAlt, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                />

                {text.trim().length === 0 && !isRecording ? (
                    <button
                        onClick={startRecording}
                        disabled={sending}
                        style={{ width: 40, height: 40, borderRadius: 20, background: C.border, color: C.textPrimary, border: "none", fontSize: 16, cursor: "pointer", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}
                    >
                        🎤
                    </button>
                ) : (
                    <button
                        onClick={isRecording ? stopRecording : function () { handleSend(); }}
                        disabled={sending}
                        style={{ width: 40, height: 40, borderRadius: 20, background: isRecording ? C.danger : C.primary, color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer", flexShrink: 0 }}
                    >
                        {isRecording ? "■" : "→"}
                    </button>
                )}

                {isEditingStyle && (
                    <button onClick={onCancelEdit} style={{ background: "none", border: "none", color: C.textSecondary, cursor: "pointer", fontSize: 13 }}>Cancel</button>
                )}
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

    if (members.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: S.xxl }}>
                <div style={{ fontSize: 40, marginBottom: S.md }}>👥</div>
                <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>No members yet.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: S.md }}>
            {members.map(function (m: any) {
                var isCreator = m.id === creatorId || m.role === "creator";
                return (
                    <div
                        key={m.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: S.md,
                            padding: S.md,
                            borderBottom: "1px solid " + C.border,
                        }}
                    >
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                background: m.avatarColor || C.surfaceAlt,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                                fontWeight: 600,
                                color: C.textPrimary,
                                flexShrink: 0,
                                overflow: "hidden",
                            }}
                        >
                            {m.avatarUrl ? (
                                <img
                                    src={m.avatarUrl}
                                    alt={m.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                (m.name || "?").charAt(0).toUpperCase()
                            )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <p
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: C.textPrimary,
                                        margin: 0,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {m.name}
                                </p>
                                {isCreator && (
                                    <span
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 600,
                                            padding: "1px 6px",
                                            borderRadius: 4,
                                            background: C.primaryLight,
                                            color: C.primary,
                                        }}
                                    >
                                        creator
                                    </span>
                                )}
                            </div>
                            {m.username && (
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: C.textSecondary,
                                        margin: "2px 0 0 0",
                                    }}
                                >
                                    @{m.username}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}