"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
    var router = useRouter();
    var [profile, setProfile] = useState<any>(null);
    var [name, setName] = useState("");
    var [username, setUsername] = useState("");
    var [loading, setLoading] = useState(true);
    var [saving, setSaving] = useState(false);
    var [message, setMessage] = useState("");

    useEffect(function () {
        fetchProfile();
    }, []);

    var fetchProfile = async function () {
        try {
            var r = await fetch("/api/profile");
            if (r.ok) {
                var data = await r.json();
                setProfile(data);
                setName(data.name || "");
                setUsername(data.username || "");
            } else if (r.status === 401) {
                router.push("/login");
            }
        } catch (e) { }
        setLoading(false);
    };

    var handleSave = async function () {
        setSaving(true);
        setMessage("");

        try {
            var r = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, username }),
            });

            if (r.ok) {
                var updated = await r.json();
                setProfile(updated);
                setMessage("Profile updated ✅");
                setTimeout(function () { setMessage(""); }, 3000);
            } else {
                var err = await r.json();
                setMessage(err.error || "Failed to update");
            }
        } catch (e) {
            setMessage("Something went wrong");
        }

        setSaving(false);
    };

    var formatDate = function (d: string) {
        return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long" });
    };

    if (loading) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <p style={{ color: "#6b7280" }}>Loading...</p>
            </main>
        );
    }

    return (
        <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#6b7280", fontSize: "0.875rem", textDecoration: "none", marginBottom: "1rem" }}>
                ← Back
            </Link>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>👤 Profile</h1>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>Manage your account</p>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginTop: "1.5rem", textAlign: "center" }}>
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #14b8a6)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    fontWeight: 700,
                    margin: "0 auto 1rem",
                }}>
                    {profile?.name?.charAt(0) || "U"}
                </div>
                <p style={{ fontWeight: 600 }}>{profile?.name}</p>
                <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>@{profile?.username || "user"}</p>
                <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                    Joined {profile?.createdAt ? formatDate(profile.createdAt) : ""}
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginTop: "1rem" }}>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
                    <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#059669" }}>{profile?.stats?.checkIns || 0}</p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Check-ins</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
                    <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#059669" }}>{profile?.stats?.journalEntries || 0}</p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Journal</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
                    <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#059669" }}>{profile?.stats?.goals || 0}</p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Goals</p>
                </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginTop: "1rem" }}>
                <h2 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem" }}>Edit Profile</h2>

                {message && (
                    <div style={{
                        background: message.includes("✅") ? "#ecfdf5" : "#fee2e2",
                        color: message.includes("✅") ? "#059669" : "#dc2626",
                        padding: "0.75rem",
                        borderRadius: "0.75rem",
                        fontSize: "0.875rem",
                        marginBottom: "0.75rem",
                        textAlign: "center",
                    }}>
                        {message}
                    </div>
                )}

                <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={function (e: any) { setName(e.target.value); }}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.875rem", marginBottom: "0.75rem" }}
                />

                <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={function (e: any) { setUsername(e.target.value); }}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.875rem", marginBottom: "1rem" }}
                />

                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        width: "100%",
                        padding: "0.875rem",
                        borderRadius: "0.75rem",
                        background: "#059669",
                        color: "#fff",
                        border: "none",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: saving ? "not-allowed" : "pointer",
                        opacity: saving ? 0.5 : 1,
                    }}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </main>
    );
}