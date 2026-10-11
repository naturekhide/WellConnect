"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { C, S, R } from "@/lib/theme";


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
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Loading...</p>
            </main>
        );
    }

    var success = message.indexOf("✅") !== -1;

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>

                {/* Header */}
                <div style={{ padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: S.xs, color: C.textSecondary, fontSize: 14, textDecoration: "none", marginBottom: S.sm }}>
                        ← Back
                    </Link>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>👤 Profile</h1>
                    <p style={{ color: C.textSecondary, marginTop: 2, fontSize: 13, margin: "2px 0 0 0" }}>Manage your account</p>
                </div>

                {/* Identity */}
                <div style={{ padding: S.xl, textAlign: "center", borderBottom: "1px solid " + C.border }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: R.full,
                        background: "linear-gradient(135deg, #10b981, #14b8a6)",
                        color: C.textInverse,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 32,
                        fontWeight: 700,
                        margin: "0 auto " + S.lg + "px",
                    }}>
                        {profile?.name?.charAt(0) || "U"}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 16, color: C.textPrimary, margin: 0 }}>{profile?.name}</p>
                    <p style={{ color: C.textSecondary, fontSize: 14, marginTop: 2, margin: "2px 0 0 0" }}>@{profile?.username || "user"}</p>
                    <p style={{ color: C.textTertiary, fontSize: 12, marginTop: S.sm, margin: S.sm + "px 0 0 0" }}>
                        Joined {profile?.createdAt ? formatDate(profile.createdAt) : ""}
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid " + C.border }}>
                    <Stat label="Check-ins" value={profile?.stats?.checkIns || 0} C={C} S={S} />
                    <Stat label="Journal" value={profile?.stats?.journalEntries || 0} C={C} S={S} />
                    <Stat label="Goals" value={profile?.stats?.goals || 0} C={C} S={S} last />
                </div>

                {/* Quick links */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid " + C.border }}>
                    <QuickLink href="/achievements" emoji="🏆" title="Achievements" sub="See what you've earned" C={C} S={S} />
                    <QuickLink href="/stats" emoji="📈" title="Stats" sub="Your progress" C={C} S={S} last />
                </div>

                {/* Edit form */}
                <div style={{ padding: S.lg, paddingBottom: S.xxl }}>
                    <h2 style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary, marginBottom: S.lg }}>Edit Profile</h2>

                    {message && (
                        <div style={{
                            background: success ? C.primaryLight : C.dangerLight,
                            color: success ? C.primary : C.danger,
                            padding: S.md,
                            borderRadius: R.md,
                            fontSize: 14,
                            marginBottom: S.md,
                            textAlign: "center",
                        }}>
                            {message}
                        </div>
                    )}

                    <label style={{ fontSize: 12, color: C.textSecondary, display: "block", marginBottom: S.xs }}>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={function (e: any) { setName(e.target.value); }}
                        style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, marginBottom: S.md, background: C.surface, color: C.textPrimary, boxSizing: "border-box" }}
                    />

                    <label style={{ fontSize: 12, color: C.textSecondary, display: "block", marginBottom: S.xs }}>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={function (e: any) { setUsername(e.target.value); }}
                        style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, marginBottom: S.lg, background: C.surface, color: C.textPrimary, boxSizing: "border-box" }}
                    />

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            width: "100%",
                            padding: S.md,
                            borderRadius: R.md,
                            background: C.primary,
                            color: C.textInverse,
                            border: "none",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: saving ? "not-allowed" : "pointer",
                            opacity: saving ? 0.5 : 1,
                        }}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

            </div>
        </main>
    );
}

function Stat({ label, value, C, S, last }: any) {
    return (
        <div style={{ padding: S.lg, textAlign: "center", borderRight: last ? "none" : "1px solid " + C.border }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>{value}</p>
            <p style={{ fontSize: 12, color: C.textSecondary, margin: S.xs + "px 0 0 0" }}>{label}</p>
        </div>
    );
}

function QuickLink({ href, emoji, title, sub, C, S, last }: any) {
    return (
        <Link
            href={href}
            style={{ textDecoration: "none", padding: S.lg, background: C.surface, borderRight: last ? "none" : "1px solid " + C.border, display: "block" }}
        >
            <span style={{ fontSize: 24 }}>{emoji}</span>
            <p style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary, marginTop: S.sm, marginBottom: 2, margin: S.sm + "px 0 2px 0" }}>{title}</p>
            <p style={{ fontSize: 12, color: C.textSecondary, margin: 0 }}>{sub}</p>
        </Link>
    );
}