"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";

export default function ChatPage() {
    var C = useColors();
    var router = useRouter();
    var params = useParams();
    var otherId = params.userId as string;

    var [messages, setMessages] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [text, setText] = useState("");
    var [sending, setSending] = useState(false);
    var [other, setOther] = useState<any>(null);
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
            var r = await fetch("/api/dm/" + otherId, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text.trim() }),
            });
            if (r.ok) {
                var msg = await r.json();
                setMessages(messages.concat([msg]));
                setText("");
            }
        } catch (e) { }
        setSending(false);
    };

    var formatTime = function (d: string) {
        return new Date(d).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    };

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100vh" }}>

                <div style={{ display: "flex", alignItems: "center", gap: S.md, padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <button onClick={function () { router.back(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, width: 24 }}>
                        <span style={{ fontSize: 22, color: C.textPrimary }}>←</span>
                    </button>
                    {other && (
                        <div style={{ display: "flex", alignItems: "center", gap: S.sm, flex: 1 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                background: C.primary,
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 15,
                                fontWeight: 700,
                            }}>
                                {other.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <p style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, margin: 0 }}>{other.name}</p>
                                <p style={{ fontSize: 12, color: C.textSecondary, margin: 0 }}>@{other.username || "user"}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: S.lg, paddingBottom: 120 }}>
                    {loading ? (
                        <p style={{ textAlign: "center", color: C.textSecondary }}>Loading...</p>
                    ) : messages.length === 0 ? (
                        <div style={{ textAlign: "center", padding: S.xxl }}>
                            <div style={{ fontSize: 40, marginBottom: S.md }}>💬</div>
                            <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>Say hi to start the conversation.</p>
                        </div>
                    ) : (
                        messages.map(function (m: any) {
                            return (
                                <div key={m.id} style={{ display: "flex", justifyContent: m.isMine ? "flex-end" : "flex-start", marginBottom: S.sm }}>
                                    <div style={{
                                        maxWidth: "75%",
                                        padding: S.sm + "px " + S.md + "px",
                                        borderRadius: R.lg,
                                        background: m.isMine ? C.primary : C.surfaceAlt,
                                        color: m.isMine ? "#fff" : C.textPrimary,
                                    }}>
                                        <p style={{ fontSize: 14, lineHeight: 1.4, margin: 0, wordBreak: "break-word" }}>{m.content}</p>
                                        <p style={{ fontSize: 10, opacity: 0.7, margin: "4px 0 0 0", textAlign: m.isMine ? "right" : "left" }}>
                                            {formatTime(m.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                <div style={{ position: "fixed", bottom: 72, left: 0, right: 0, background: C.background, borderTop: "1px solid " + C.border, padding: S.md }}>
                    <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", gap: S.sm }}>
                        <input
                            type="text"
                            value={text}
                            onChange={function (e) { setText(e.target.value); }}
                            onKeyDown={function (e) { if (e.key === "Enter") handleSend(); }}
                            placeholder="Message..."
                            maxLength={1000}
                            style={{
                                flex: 1,
                                padding: S.md,
                                borderRadius: R.full,
                                border: "1px solid " + C.border,
                                fontSize: 14,
                                background: C.surfaceAlt,
                                color: C.textPrimary,
                                boxSizing: "border-box",
                                outline: "none",
                                fontFamily: "inherit",
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!text.trim() || sending}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                background: text.trim() ? C.primary : C.border,
                                color: text.trim() ? "#fff" : C.textTertiary,
                                border: "none",
                                fontSize: 16,
                                fontWeight: 700,
                                cursor: text.trim() ? "pointer" : "not-allowed",
                                flexShrink: 0,
                            }}
                        >
                            →
                        </button>
                    </div>
                </div>

            </div>
        </main>
    );
}