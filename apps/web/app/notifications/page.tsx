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
                    // Safety check: Ensure the API actually returned an array
                    if (Array.isArray(data)) {
                        setNotifications(data);
                    } else {
                        console.error("API did not return an array:", data);
                        setError("Failed to load notifications.");
                    }
                } else {
                    setError("You must be logged in to view notifications.");
                }
            } catch (e) {
                console.error("Failed to load notifications", e);
                setError("A network error occurred.");
            }
            setLoading(false);
        }
        fetchNotifications();
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-6 pb-24 min-h-screen bg-[#0f0f0f]">
            <div className="flex items-center gap-4 mb-8 pt-10">
                <button
                    onClick={() => router.back()}
                    className="text-2xl text-gray-400 hover:text-white transition"
                >
                    ←
                </button>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-red-500/10 rounded-xl border border-red-500/20">
                    <p className="text-red-400">{error}</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-5xl mb-4">🔔</div>
                    <p className="text-gray-400">No notifications yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {notifications.map((n) => {
                        const isSupport = n.type === "system_support";
                        return (
                            <div
                                key={n.id}
                                className={`p-4 rounded-xl border ${isSupport
                                        ? "bg-emerald-500/10 border-emerald-500/30"
                                        : "bg-[#1a1a1a] border-[#2a2a2a]"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{isSupport ? "🫂" : "🔔"}</span>
                                    <h3 className={`font-bold ${isSupport ? "text-emerald-400" : "text-white"}`}>
                                        {n.title}
                                    </h3>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
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