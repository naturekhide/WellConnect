"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setNotifications(data);
                    } else {
                        setError("Failed to load notifications.");
                    }
                } else {
                    setError("You must be logged in to view notifications.");
                }
            } catch (e) {
                setError("A network error occurred.");
            }
            setLoading(false);
        }
        fetchNotifications();
    }, []);

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "80px 24px 100px", minHeight: "100vh", backgroundColor: "#0f0f0f" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                <button
                    onClick={() => router.back()}
                    style={{ fontSize: "24px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                    ←
                </button>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#ffffff", margin: 0 }}>Notifications</h1>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                    <div style={{ color: "#10b981", fontWeight: "bold" }}>Loading...</div>
                </div>
            ) : error ? (
                <div style={{ textAlign: "center", padding: "80px 0", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                    <p style={{ color: "#f87171" }}>{error}</p>
                </div>
            ) : notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔔</div>
                    <p style={{ color: "#9ca3af" }}>No notifications yet.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {notifications.map((n) => {
                        const isSupport = n.type === "system_support";
                        return (
                            <div
                                key={n.id}
                                style={{
                                    padding: "16px",
                                    borderRadius: "12px",
                                    border: isSupport ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid #2a2a2a",
                                    backgroundColor: isSupport ? "rgba(16, 185, 129, 0.1)" : "#1a1a1a",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                    <span style={{ fontSize: "20px" }}>{isSupport ? "🫂" : "🔔"}</span>
                                    <h3 style={{ fontSize: "16px", fontWeight: "bold", color: isSupport ? "#34d399" : "#ffffff", margin: 0 }}>
                                        {n.title}
                                    </h3>
                                </div>
                                <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                                    {n.body}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}