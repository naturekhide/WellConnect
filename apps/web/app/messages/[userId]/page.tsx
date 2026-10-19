"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";

export default function ChatPage() {
    var C = useColors();
    var params = useParams();
    var otherId = params.userId as string;

    var [messages, setMessages] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [text, setText] = useState("");
    var [sending, setSending] = useState(false);
    var [other, setOther] = useState<any>(null);

    var [replyingTo, setReplyingTo] = useState<any>(null);
    var [activeMenu, setActiveMenu] = useState<string | null>(null);
    var [editingMessage, setEditingMessage] = useState<any>(null);

    var bottomRef = useRef<HTMLDivElement>(null);

    useEffect(function () {
        loadInitial();
        var interval = setInterval(poll, 3000);
        return function () { clearInterval(interval); };
    }, [otherId]);

    useEffect(function () {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    var loadInitial = async function () {
        try {
            var [msgRes, userRes] = await Promise.all([
                fetch("/api/dm/" + otherId),
                fetch("/api/users/" + otherId),
            ]);
            if (msgRes.ok) {
                var data = await msgRes.json();
                setMessages(data.messages || []);
            }
            if (userRes.ok) {
                setOther(await userRes.json());
            }
        } catch (e) { }
        setLoading(false);
    };

    var poll = async function () {
        if (!messages.length) return;
        var last = messages[messages.length - 1].createdAt;
        try {
            var r = await fetch("/api/dm/" + otherId + "?since=" + encodeURIComponent(last));
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

            var r = await fetch("/api/dm/" + otherId, {
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
            var r = await fetch("/api/dm/" + otherId + "/edit?messageId=" + editingMessage.id, {
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
                alert(err.error || "Failed to edit");
            }
        } catch (e) { }
    };

    var handleDelete = async function (messageId: string) {
        if (!window.confirm("Delete this message?")) return;
        setActiveMenu(null);
        try {
            var r = await fetch("/api/dm/" + otherId + "/delete?messageId=" + messageId, {
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

    var formatTime = function (d: string) {
        return new Date(d).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    };

    if (loading) {
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}><p style={{ color: C.textSecondary }}>Loading...</p></div>;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.background }}>

            {other && (
                <div style={{ display: "flex", alignItems: "center", gap: S.sm, padding: S.lg, paddingTop: 40, paddingBottom: S.md, borderBottom: "1px solid " + C.border, background: C.background, zIndex: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>
                        {other.name?.charAt(0) || "U"}
                    </div>
                    <div>
                        <p style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0 }}>{other.name}</p>
                        <p style={{ fontSize: 12, color: C.textSecondary, margin: 0 }}>@{other.username || "user"}</p>
                    </div>
                </div>
            )}

            <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: S.lg }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: "center", padding: S.xxl }}>
                        <div style={{ fontSize: 40, marginBottom: S.md }}>💬</div>
                        <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>Say hi to start the conversation.</p>
                    </div>
                ) : (
                    messages.map(function (m: any) {
                        var isEditing = editingMessage && editingMessage.id === m.id;
                        // Check if message is within 15 minutes
                        var isEditable = m.isMine && (Date.now() - new Date(m.createdAt).getTime() < 15 * 60 * 1000);

                        return (
                            <div
                                key={m.id}
                                style={{ display: "flex", flexDirection: m.isMine ? "row-reverse" : "row", justifyContent: "flex-start", alignItems: "flex-end", marginBottom: S.sm, gap: 8 }}
                                onMouseLeave={function () { setActiveMenu(null); }}
                            >
                                {!isEditing && (
                                    <div style={{ position: "relative", paddingBottom: 6 }}>
                                        <button onClick={function () { setActiveMenu(activeMenu === m.id ? null : m.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.textTertiary, fontSize: 18, padding: "0 6px" }}>···</button>

                                        {activeMenu === m.id && (
                                            <div style={{ position: "absolute", bottom: "100%", [m.isMine ? "right" : "left"]: 0, background: C.surface, border: "1px solid " + C.border, borderRadius: R.md, padding: 4, zIndex: 10, minWidth: 120, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                                                <button onClick={function () { handleReply(m); setActiveMenu(null); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "6px 12px", cursor: "pointer", fontSize: 13, color: C.textPrimary }}>Reply</button>
                                                {m.isMine && (
                                                    <>
                                                        {isEditable && (
                                                            <button onClick={function () { handleEdit(m); setActiveMenu(null); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "6px 12px", cursor: "pointer", fontSize: 13, color: C.textPrimary }}>Edit</button>
                                                        )}
                                                        <button onClick={function () { handleDelete(m.id); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "6px 12px", cursor: "pointer", fontSize: 13, color: C.danger }}>Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ maxWidth: isEditing ? "100%" : "75%", display: "flex", flexDirection: "column", alignItems: m.isMine ? "flex-end" : "flex-start", flex: isEditing ? 1 : "none" }}>

                                    <div style={{ padding: S.sm + "px " + S.md + "px", borderRadius: R.lg, background: m.isMine ? C.primary : C.surfaceAlt, color: m.isMine ? "#fff" : C.textPrimary, position: "relative", overflow: "hidden", width: isEditing ? "100%" : "auto" }}>

                                        {!isEditing && m.replyTo && (
                                            <div style={{ background: m.isMine ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)", padding: 6, borderRadius: 6, marginBottom: 6, borderLeft: "3px solid " + (m.isMine ? "#fff" : C.primary) }}>
                                                <p style={{ fontSize: 11, fontWeight: 700, color: m.isMine ? "#fff" : C.primary, margin: 0 }}>{m.replyTo.senderName}</p>
                                                <p style={{ fontSize: 12, color: m.isMine ? "rgba(255,255,255,0.8)" : C.textSecondary, margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.replyTo.content}</p>
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
                                            <p style={{ fontSize: 10, opacity: 0.7, margin: "4px 0 0 0", textAlign: m.isMine ? "right" : "left" }}>
                                                {formatTime(m.createdAt)}
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

            <div style={{ background: C.background, borderTop: "1px solid " + C.border, padding: S.md }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>

                    {replyingTo && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surfaceAlt, padding: S.sm, borderRadius: R.md, marginBottom: S.sm, borderLeft: "3px solid " + C.primary }}>
                            <div style={{ overflow: "hidden" }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: C.primary, margin: 0 }}>
                                    Replying to {replyingTo.isMine ? "yourself" : other?.name}
                                </p>
                                <p style={{ fontSize: 12, color: C.textSecondary, margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {replyingTo.content}
                                </p>
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
                                placeholder="Message..."
                                maxLength={1000}
                                style={{ flex: 1, padding: S.md, borderRadius: R.full, border: "1px solid " + C.border, fontSize: 14, background: C.surfaceAlt, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!text.trim() || sending}
                                style={{ width: 44, height: 44, borderRadius: 22, background: text.trim() ? C.primary : C.border, color: text.trim() ? "#fff" : C.textTertiary, border: "none", fontSize: 18, fontWeight: 700, cursor: text.trim() ? "pointer" : "not-allowed", flexShrink: 0 }}
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