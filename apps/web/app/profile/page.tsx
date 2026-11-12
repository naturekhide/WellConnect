"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function ProfilePage() {
    var C = useColors();
    var router = useRouter();
    var [profile, setProfile] = useState<any>(null);
    var [name, setName] = useState("");
    var [username, setUsername] = useState("");
    var [loading, setLoading] = useState(true);
    var [saving, setSaving] = useState(false);
    var [message, setMessage] = useState("");
    var [showEdit, setShowEdit] = useState(false);
    var [streak, setStreak] = useState(0);
    var [deleting, setDeleting] = useState(false);
    var [downloading, setDownloading] = useState(false);
    var [downloadingPdf, setDownloadingPdf] = useState(false);

    // 🚨 Linktree States
    var [links, setLinks] = useState<any[]>([]);
    var [showAddLink, setShowAddLink] = useState(false);
    var [newLinkTitle, setNewLinkTitle] = useState("");
    var [newLinkUrl, setNewLinkUrl] = useState("");
    var [savingLink, setSavingLink] = useState(false);

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

                if (data.id) {
                    fetchLinks(data.id);
                }
            } else if (r.status === 401) {
                router.push("/login");
            }

            var statsRes = await fetch("/api/mood/stats");
            if (statsRes.ok) {
                var stats = await statsRes.json();
                if (stats) setStreak(stats.streak || 0);
            }
        } catch (e) { }
        setLoading(false);
    };

    var fetchLinks = async function (userId: string) {
        try {
            var r = await fetch(`/api/users/${userId}/links`);
            if (r.ok) {
                var data = await r.json();
                setLinks(data.links || []);
            }
        } catch (e) { }
    };

    var handleAddLink = async function () {
        if (!newLinkTitle.trim() || !newLinkUrl.trim() || !profile?.id) return;
        setSavingLink(true);
        try {
            var r = await fetch(`/api/users/${profile.id}/links`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newLinkTitle, url: newLinkUrl }),
            });
            if (r.ok) {
                var newLink = await r.json();
                setLinks([...links, newLink]);
                setNewLinkTitle("");
                setNewLinkUrl("");
                setShowAddLink(false);
            } else {
                var err = await r.json();
                alert("Failed to add link: " + (err.error || "Unknown error"));
            }
        } catch (e) { }
        setSavingLink(false);
    };

    var handleDeleteLink = async function (linkId: string) {
        if (!window.confirm("Delete this link?")) return;
        try {
            var r = await fetch(`/api/users/${profile.id}/links?linkId=${linkId}`, {
                method: "DELETE",
            });
            if (r.ok) {
                setLinks(links.filter((l) => l.id !== linkId));
            }
        } catch (e) { }
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
                setTimeout(function () { setMessage(""); setShowEdit(false); }, 2000);
            } else {
                var err = await r.json();
                setMessage(err.error || "Failed to update");
            }
        } catch (e) {
            setMessage("Something went wrong");
        }

        setSaving(false);
    };

    var handleSignOut = async function () {
        var { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });
        router.push("/login");
        router.refresh();
    };

    var handleDeleteAccount = async function () {
        if (!window.confirm("Are you absolutely sure? This will delete your account, posts, messages, and all data permanently. This cannot be undone.")) {
            return;
        }

        setDeleting(true);
        try {
            var r = await fetch("/api/users/delete", { method: "DELETE" });
            if (r.ok) {
                var { signOut } = await import("next-auth/react");
                await signOut({ redirect: false });
                router.push("/login");
                router.refresh();
            } else {
                alert("Failed to delete account. Please try again.");
                setDeleting(false);
            }
        } catch (e) {
            alert("An error occurred.");
            setDeleting(false);
        }
    };

    var handleDownloadData = async function () {
        setDownloading(true);
        try {
            var r = await fetch("/api/users/export");
            if (r.ok) {
                var blob = await r.blob();
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = url;
                a.download = "wellconnect-data-" + (profile?.username || "export") + ".json";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                alert("Failed to download data. Please try again.");
            }
        } catch (e) {
            alert("An error occurred while downloading.");
        }
        setDownloading(false);
    };

    var handleDownloadPdf = async function () {
        setDownloadingPdf(true);
        try {
            var r = await fetch("/api/users/export-pdf");
            if (r.ok) {
                var blob = await r.blob();
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = url;
                a.download = "wellconnect-report-" + (profile?.username || "export") + ".pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                alert("Failed to generate PDF. Please try again.");
            }
        } catch (e) {
            alert("An error occurred.");
        }
        setDownloadingPdf(false);
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
            <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 100 }}>

                <div style={{ padding: S.xl, paddingTop: 60, textAlign: "center" }}>
                    <div style={{
                        width: 96,
                        height: 96,
                        borderRadius: R.full,
                        background: "linear-gradient(135deg, #10b981, #14b8a6)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 38,
                        fontWeight: 700,
                        margin: "0 auto " + S.lg + "px",
                    }}>
                        {profile?.name?.charAt(0) || "U"}
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 20, color: C.textPrimary, margin: 0 }}>{profile?.name}</p>
                    <p style={{ color: C.textSecondary, fontSize: 14, marginTop: 4, margin: "4px 0 0 0" }}>
                        @{profile?.username || "user"}
                    </p>
                    <p style={{ color: C.textTertiary, fontSize: 12, marginTop: S.sm, margin: S.sm + "px 0 0 0" }}>
                        Joined {profile?.createdAt ? formatDate(profile.createdAt) : ""}
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: S.sm, paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.lg }}>
                    <StatTile value={profile?.stats?.checkIns || 0} label="Check-ins" />
                    <StatTile value={profile?.stats?.journalEntries || 0} label="Journal" />
                    <StatTile value={profile?.stats?.goals || 0} label="Goals" />
                </div>

                <div style={{ marginLeft: S.lg, marginRight: S.lg, marginBottom: S.lg, padding: S.lg, borderRadius: R.lg, background: C.surface, display: "flex", alignItems: "center", gap: S.md }}>
                    <span style={{ fontSize: 32 }}>🔥</span>
                    <div>
                        <p style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
                            {streak} day streak
                        </p>
                        <p style={{ fontSize: 13, color: C.textSecondary, marginTop: 2, margin: "2px 0 0 0" }}>
                            Keep showing up for yourself
                        </p>
                    </div>
                </div>

                {/* 🚨 YOUR LINKS SECTION */}
                <div style={{ paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.sm }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: S.sm }}>
                        <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: 0 }}>Your Links</h2>
                        <button
                            onClick={function () { setShowAddLink(!showAddLink); }}
                            style={{ background: "none", border: "none", color: C.primary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                        >
                            + Add Link
                        </button>
                    </div>

                    {/* Add Link Form */}
                    {showAddLink && (
                        <div style={{ background: C.surface, padding: S.md, borderRadius: R.lg, marginBottom: S.md, border: "1px solid " + C.border }}>
                            <input
                                placeholder="Title (e.g., My Portfolio)"
                                value={newLinkTitle}
                                onChange={(e) => setNewLinkTitle(e.target.value)}
                                style={{ width: "100%", padding: S.sm, borderRadius: R.md, border: "1px solid " + C.border, marginBottom: S.sm, background: C.background, color: C.textPrimary, boxSizing: "border-box", outline: "none" }}
                            />
                            <input
                                placeholder="URL (e.g., mywebsite.com)"
                                value={newLinkUrl}
                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                style={{ width: "100%", padding: S.sm, borderRadius: R.md, border: "1px solid " + C.border, marginBottom: S.sm, background: C.background, color: C.textPrimary, boxSizing: "border-box", outline: "none" }}
                            />
                            <div style={{ display: "flex", gap: S.sm, justifyContent: "flex-end" }}>
                                <button onClick={() => setShowAddLink(false)} style={{ background: "none", border: "none", color: C.textSecondary, cursor: "pointer", fontSize: 13 }}>Cancel</button>
                                <button onClick={handleAddLink} disabled={savingLink} style={{ background: C.primary, color: "#fff", border: "none", padding: "6px 12px", borderRadius: R.md, fontSize: 13, fontWeight: 600, cursor: savingLink ? "not-allowed" : "pointer" }}>
                                    {savingLink ? "Saving..." : "Save Link"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 🚨 CLEAN LINKS LIST */}
                    <div style={{ display: "flex", flexDirection: "column", gap: S.sm, marginBottom: S.lg }}>
                        {links.map((link) => (
                            <div key={link.id} style={{ display: "flex", alignItems: "center", background: C.surface, padding: S.md, borderRadius: R.lg, border: "1px solid " + C.border }}>

                                {/* The whole left side is a clickable link */}
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: "flex", alignItems: "center", flex: 1, textDecoration: "none", minWidth: 0 }}
                                >
                                    <span style={{ fontSize: 20, marginRight: S.md }}>{link.icon || "🔗"}</span>
                                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.textPrimary }}>
                                        {link.title}
                                    </p>
                                </a>

                                {/* The delete button stays on the right */}
                                <button
                                    onClick={() => handleDeleteLink(link.id)}
                                    style={{ background: "none", border: "none", color: C.textSecondary, cursor: "pointer", fontSize: 16, padding: S.xs }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        {links.length === 0 && !showAddLink && (
                            <p style={{ fontSize: 13, color: C.textTertiary, textAlign: "center", margin: 0 }}>No links added yet. Add your website, socials, or portfolio!</p>
                        )}
                    </div>
                </div>

                <div style={{ paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.sm }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: 0 }}>Your space</h2>
                </div>
                <div style={{ marginLeft: S.lg, marginRight: S.lg, marginBottom: S.lg, borderRadius: R.lg, background: C.surface, overflow: "hidden" }}>
                    <RowLink href="/messages" emoji="💬" title="Messages" sub="Your conversations" />
                    <RowLink href="/journal" emoji="📝" title="Journal" sub={(profile?.stats?.journalEntries || 0) + " entries"} />
                    <RowLink href="/goals" emoji="🎯" title="Goals" sub={(profile?.stats?.goals || 0) + " active"} />
                    <RowLink href="/achievements" emoji="🏆" title="Achievements" sub="See what you've earned" last />
                </div>

                <div style={{ paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.sm }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: 0 }}>Account</h2>
                </div>
                <div style={{ marginLeft: S.lg, marginRight: S.lg, marginBottom: S.lg, borderRadius: R.lg, background: C.surface, overflow: "hidden" }}>
                    <button
                        onClick={function () { setShowEdit(!showEdit); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: S.md, padding: S.lg, background: "none", border: "none", borderBottom: "1px solid " + C.border, cursor: "pointer", textAlign: "left" }}
                    >
                        <span style={{ fontSize: 20 }}>✏️</span>
                        <span style={{ flex: 1, fontSize: 15, color: C.textPrimary, fontWeight: 500 }}>Edit Profile</span>
                        <span style={{ fontSize: 16, color: C.textTertiary }}>›</span>
                    </button>
                    <Link
                        href="/privacy"
                        style={{ display: "flex", alignItems: "center", gap: S.md, padding: S.lg, borderBottom: "1px solid " + C.border, textDecoration: "none" }}
                    >
                        <span style={{ fontSize: 20 }}>🔒</span>
                        <span style={{ flex: 1, fontSize: 15, color: C.textPrimary, fontWeight: 500 }}>Privacy</span>
                        <span style={{ fontSize: 16, color: C.textTertiary }}>›</span>
                    </Link>

                    {/* JSON Download */}
                    <button
                        onClick={handleDownloadData}
                        disabled={downloading}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: S.md, padding: S.lg, background: "none", border: "none", borderBottom: "1px solid " + C.border, cursor: downloading ? "not-allowed" : "pointer", textAlign: "left", opacity: downloading ? 0.6 : 1 }}
                    >
                        <span style={{ fontSize: 20 }}>📥</span>
                        <span style={{ flex: 1, fontSize: 15, color: C.textPrimary, fontWeight: 500 }}>
                            {downloading ? "Preparing Data..." : "Download Data (JSON)"}
                        </span>
                        <span style={{ fontSize: 16, color: C.textTertiary }}>›</span>
                    </button>

                    {/* PDF Download */}
                    <button
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: S.md, padding: S.lg, background: "none", border: "none", borderBottom: "1px solid " + C.border, cursor: downloadingPdf ? "not-allowed" : "pointer", textAlign: "left", opacity: downloadingPdf ? 0.6 : 1 }}
                    >
                        <span style={{ fontSize: 20 }}>📄</span>
                        <span style={{ flex: 1, fontSize: 15, color: C.textPrimary, fontWeight: 500 }}>
                            {downloadingPdf ? "Generating PDF..." : "Download Report (PDF)"}
                        </span>
                        <span style={{ fontSize: 16, color: C.textTertiary }}>›</span>
                    </button>

                    <button
                        onClick={handleSignOut}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: S.md, padding: S.lg, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                    >
                        <span style={{ fontSize: 20 }}>🚪</span>
                        <span style={{ flex: 1, fontSize: 15, color: C.danger, fontWeight: 500 }}>Sign Out</span>
                    </button>
                </div>

                {showEdit && (
                    <div style={{ marginLeft: S.lg, marginRight: S.lg, marginBottom: S.xxl, padding: S.lg, borderRadius: R.lg, background: C.surface }}>
                        <h2 style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary, marginBottom: S.lg, marginTop: 0 }}>Edit Profile</h2>

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
                            style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, marginBottom: S.md, background: C.background, color: C.textPrimary, boxSizing: "border-box", outline: "none" }}
                        />

                        <label style={{ fontSize: 12, color: C.textSecondary, display: "block", marginBottom: S.xs }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={function (e: any) { setUsername(e.target.value); }}
                            style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, marginBottom: S.lg, background: C.background, color: C.textPrimary, boxSizing: "border-box", outline: "none" }}
                        />

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                width: "100%",
                                padding: S.md,
                                borderRadius: R.md,
                                background: C.primary,
                                color: "#fff",
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
                )}

                {/* DANGER ZONE */}
                <div style={{ paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.sm, marginTop: S.lg }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, color: C.danger, margin: 0 }}>Danger Zone</h2>
                </div>
                <div style={{ marginLeft: S.lg, marginRight: S.lg, marginBottom: S.xxl, borderRadius: R.lg, background: C.danger + "10", border: "1px solid " + C.danger + "40", padding: S.lg }}>
                    <p style={{ fontSize: 14, color: C.textPrimary, fontWeight: 600, margin: "0 0 " + S.xs + "px 0" }}>
                        Delete Account
                    </p>
                    <p style={{ fontSize: 13, color: C.textSecondary, margin: "0 0 " + S.md + "px 0" }}>
                        Once you delete your account, there is no going back. All your posts, messages, and data will be permanently wiped.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        style={{
                            padding: "10px 16px",
                            borderRadius: R.md,
                            background: C.danger,
                            color: "#fff",
                            border: "none",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: deleting ? "not-allowed" : "pointer",
                            opacity: deleting ? 0.7 : 1,
                        }}
                    >
                        {deleting ? "Deleting..." : "Delete My Account"}
                    </button>
                </div>

            </div>
        </main>
    );
}

function StatTile({ value, label }: any) {
    var C = useColors();
    return (
        <div style={{ padding: S.md, borderRadius: R.lg, background: C.surface, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.primary }}>{value}</div>
            <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{label}</div>
        </div>
    );
}

function RowLink({ href, emoji, title, sub, last }: any) {
    var C = useColors();
    return (
        <Link
            href={href}
            style={{
                display: "flex",
                alignItems: "center",
                gap: S.md,
                padding: S.lg,
                borderBottom: last ? "none" : "1px solid " + C.border,
                textDecoration: "none",
            }}
        >
            <span style={{ fontSize: 20 }}>{emoji}</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: C.textPrimary, fontWeight: 500 }}>{title}</div>
                <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{sub}</div>
            </div>
            <span style={{ fontSize: 16, color: C.textTertiary }}>›</span>
        </Link>
    );
}