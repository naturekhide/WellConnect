"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useColors, S } from "@/lib/theme";

// 🚨 CSS to hide scrollbars globally for this layout
const hideScrollbarStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    var C = useColors();
    var router = useRouter();
    var params = useParams();
    var activeUserId = params?.userId as string;

    var [conversations, setConversations] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);

    useEffect(function () { load(); }, [activeUserId]);

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
        <>
            <style>{hideScrollbarStyle}</style>
            <div style={{ background: C.background, height: "calc(100vh - 72px)", display: "flex", overflow: "hidden" }}>

                {/* LEFT SIDEBAR: Responsive Window Splitting */}
                <div style={{ 
                    width: "340px", 
                    minWidth: "280px", 
                    maxWidth: "400px",
                    borderRight: "1px solid " + C.border, 
                    display: "flex", 
                    flexDirection: "column", 
                    background: C.background, 
                    flexShrink: 0 
                }}>
                    <div style={{ padding: S.lg, paddingTop: 40, borderBottom: "1px solid " + C.border }}>
                        <button onClick={function () { router.push("/connect"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: S.sm }}>
                            <span style={{ fontSize: 15, fontWeight: 500, color: C.textSecondary }}>← Back</span>
                        </button>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Chats</h1>
                    </div>

                    {/* 🚨 Applied no-scrollbar class here */}
                    <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
                        {loading ? (
                            <p style={{ padding: S.lg, textAlign: "center", color: C.textSecondary }}>Loading...</p>
                        ) : conversations.length === 0 ? (
                            <div style={{ textAlign: "center", padding: S.xxl }}>
                                <div style={{ fontSize: 40, marginBottom: S.md }}>💬</div>
                                <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>No messages yet.</p>
                            </div>
                        ) : (
                            conversations.map(function (c: any) {
                                if (!c.user) return null;
                                var isActive = activeUserId === c.user.id;
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
                                            background: isActive ? C.primaryLight : "transparent",
                                        }}
                                    >
                                        <div style={{ width: 48, height: 48, borderRadius: 24, background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
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
                                            <div style={{ minWidth: 20, height: 20, borderRadius: 10, background: C.primary, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", flexShrink: 0 }}>
                                                {c.unreadCount}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT SIDEBAR: Active Chat */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
                    {activeUserId ? (
                        children
                    ) : (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: C.textSecondary }}>
                            <div style={{ fontSize: 60, marginBottom: S.lg }}>💬</div>
                            <h2 style={{ fontSize: 20, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Direct Messages</h2>
                            <p style={{ fontSize: 14, marginTop: S.sm }}>Select a chat to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}