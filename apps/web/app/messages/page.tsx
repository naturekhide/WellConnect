"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function MessagesPage() {
    var C = useColors();
    var router = useRouter();
    var [conversations, setConversations] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);

    useEffect(function () { load(); }, []);

    var load = async function () {
        try {
            var r = await fetch("/api/dm/conversations");
            if (r.ok) {
                var data = await r.json();
                setConversations(data.conversations || []);
            }
        } catch (e) { }
        setLoading(false);
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

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 100 }}>

                <div style={{ padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <button onClick={function () { router.back(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: S.sm }}>
                        <span style={{ fontSize: 15, fontWeight: 500, color: C.textSecondary }}>← Back</span>
                    </button>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>💬 Messages</h1>
                    <p style={{ color: C.textSecondary, marginTop: 2, fontSize: 13, margin: "2px 0 0 0" }}>Your conversations</p>
                </div>

                {loading ? (
                    <div style={{ padding: S.xxl, textAlign: "center", color: C.textSecondary }}>Loading...</div>
                ) : conversations.length === 0 ? (
                    <div style={{ textAlign: "center", padding: S.xxl }}>
                        <div style={{ fontSize: 40, marginBottom: S.md }}>💬</div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: 0, marginBottom: S.sm }}>No messages yet</p>
                        <p style={{ fontSize: 14, color: C.textSecondary, margin: 0, maxWidth: 260, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
                            Visit someone's profile and tap Message to start a conversation.
                        </p>
                    </div>
                ) : (
                    conversations.map(function (c: any) {
                        if (!c.user) return null;
                        return (
                            <Link
                                key={c.user.id}
                                href={"/messages/" + c.user.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: S.md,
                                    padding: S.lg,
                                    borderBottom: "1px solid " + C.border,
                                    textDecoration: "none",
                                }}
                            >
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    background: C.primary,
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 18,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                }}>
                                    {c.user.name?.charAt(0) || "U"}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: S.sm }}>
                                        <p style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {c.user.name}
                                        </p>
                                        {c.lastMessage && (
                                            <span style={{ fontSize: 11, color: C.textTertiary, flexShrink: 0 }}>
                                                {timeAgo(c.lastMessage.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    {c.lastMessage && (
                                        <p style={{ fontSize: 13, color: C.textSecondary, margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {c.lastMessage.isMine ? "You: " : ""}{c.lastMessage.content}
                                        </p>
                                    )}
                                </div>
                                {c.unreadCount > 0 && (
                                    <div style={{
                                        minWidth: 20,
                                        height: 20,
                                        borderRadius: 10,
                                        background: C.primary,
                                        color: "#fff",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "0 6px",
                                        flexShrink: 0,
                                    }}>
                                        {c.unreadCount}
                                    </div>
                                )}
                            </Link>
                        );
                    })
                )}

            </div>
        </main>
    );
}