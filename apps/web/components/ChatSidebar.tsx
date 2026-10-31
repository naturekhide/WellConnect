"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatSidebar({ activeUserId }: { activeUserId?: string }) {
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            const res = await fetch("/api/dm/conversations");
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations || []);
            }
        }
        load();
    }, []);

    return (
        <div style={{ width: "320px", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", background: "#0a0f0d" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #1e293b" }}>
                <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "14px", cursor: "pointer", marginBottom: "16px", padding: 0 }}>← Back to Home</button>
                <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0, color: "#fff" }}>Chats</h1>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
                {conversations.map((c) => {
                    const isActive = activeUserId === c.user.id;
                    return (
                        <div
                            key={c.user.id}
                            onClick={() => router.push(`/messages/${c.user.id}`)}
                            style={{
                                padding: "16px 24px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                cursor: "pointer",
                                background: isActive ? "rgba(5, 150, 105, 0.1)" : "transparent",
                                borderLeft: isActive ? "3px solid #059669" : "3px solid transparent",
                                borderBottom: "1px solid #1e293b"
                            }}
                        >
                            <div style={{ width: "44px", height: "44px", borderRadius: "22px", background: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#fff", flexShrink: 0 }}>
                                {c.user?.name?.charAt(0) || "U"}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                    <span style={{ fontWeight: "600", color: "#fff", fontSize: "15px" }}>{c.user?.name}</span>
                                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                                        {c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}
                                    </span>
                                </div>
                                <div style={{ fontSize: "13px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {c.lastMessage?.isMine ? "You: " : ""}{c.lastMessage?.content || "Start a conversation"}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}