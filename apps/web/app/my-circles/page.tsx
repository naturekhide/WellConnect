"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyCirclesPage() {
    const router = useRouter();
    const [circles, setCircles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCircles() {
            try {
                const res = await fetch("/api/circles");
                if (res.ok) {
                    const data = await res.json();
                    // Filter to show ONLY circles the user is in
                    const joined = (data.circles || []).filter((c: any) => c.myStatus === "approved");
                    setCircles(joined);
                }
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        }
        fetchCircles();
    }, []);

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "80px 24px 100px", minHeight: "100vh", backgroundColor: "#0f0f0f" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button onClick={() => router.back()} style={{ fontSize: "24px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>←</button>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#ffffff", margin: 0 }}>My Circles</h1>
                </div>
                <Link href="/circles" style={{ fontSize: "14px", color: "#10b981", fontWeight: "600", textDecoration: "none" }}>
                    Browse All
                </Link>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>Loading...</div>
            ) : circles.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", backgroundColor: "#1a1a1a", borderRadius: "12px", border: "1px dashed #2a2a2a" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌿</div>
                    <p style={{ color: "#9ca3af", marginBottom: "24px" }}>You haven't joined any circles yet.</p>
                    <Link href="/circles" style={{ backgroundColor: "#10b981", color: "#fff", padding: "12px 24px", borderRadius: "999px", fontWeight: "600", textDecoration: "none" }}>
                        Discover Circles
                    </Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {circles.map((c) => (
                        <Link key={c.id} href={`/circles/${c.id}`} style={{ textDecoration: "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", cursor: "pointer" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: c.coverColor || "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                                    {c.emoji || "🌿"}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#ffffff" }}>{c.name}</div>
                                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{c.memberCount} members</div>
                                </div>
                                <div style={{ color: "#4b5563", fontSize: "20px" }}>›</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}