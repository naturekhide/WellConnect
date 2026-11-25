"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";
import FeedPostCard from "@/components/FeedPostCard";

export default function CircleDetailPage() {
    var C = useColors();
    var router = useRouter();
    var params = useParams();
    var circleId = params.id as string;

    var [circle, setCircle] = useState<any>(null);
    var [loading, setLoading] = useState(true);
    var [tab, setTab] = useState("feed");
    var [joining, setJoining] = useState(false);

    // 👇 Admin States
    var [showAdminMenu, setShowAdminMenu] = useState(false);
    var [pendingMembers, setPendingMembers] = useState<any[]>([]);
    var [activeMembers, setActiveMembers] = useState<any[]>([]);
    var [loadingMembers, setLoadingMembers] = useState(false);

    // 👇 Edit Circle States
    var [isEditing, setIsEditing] = useState(false);
    var [editName, setEditName] = useState("");
    var [editEmoji, setEditEmoji] = useState("");
    var [editDescription, setEditDescription] = useState("");
    var [savingEdit, setSavingEdit] = useState(false);

    useEffect(function () { load(); }, [circleId]);

    var load = async function () {
        try {
            var r = await fetch("/api/circles/" + circleId);
            if (r.ok) {
                setCircle(await r.json());
            }
        } catch (e) { }
        setLoading(false);
    };

    var handleJoin = async function () {
        if (joining) return;
        setJoining(true);
        try {
            var r = await fetch("/api/circles/" + circleId + "/join", { method: "POST" });
            if (r.ok) {
                var data = await r.json();
                setCircle({
                    ...circle,
                    myStatus: data.status,
                    myRole: data.status === "approved" ? "member" : null,
                    memberCount: data.memberCount,
                });
            }
        } catch (e) { }
        setJoining(false);
    };

    // 👇 Admin Functions
    var handleOpenAdmin = async function () {
        setShowAdminMenu(true);
        setLoadingMembers(true);

        // Pre-fill edit form
        setEditName(circle.name);
        setEditEmoji(circle.emoji || "🌿");
        setEditDescription(circle.description || "");
        setIsEditing(false);

        try {
            var r = await fetch("/api/circles/" + circleId + "/members");
            if (r.ok) {
                var members = await r.json();
                var list = Array.isArray(members) ? members : (members.members || []);

                // Split into pending and active
                setPendingMembers(list.filter((m: any) => m.status === "pending"));
                setActiveMembers(list.filter((m: any) => m.status === "approved" && m.role !== "creator"));
            }
        } catch (e) { }
        setLoadingMembers(false);
    };

    var handleApprove = async function (userId: string) {
        try {
            var r = await fetch("/api/circles/" + circleId + "/members", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId: userId, action: "approve" })
            });
            if (r.ok) {
                var approvedMember = pendingMembers.find((m: any) => m.user.id === userId);
                setPendingMembers(pendingMembers.filter((m: any) => m.user.id !== userId));
                if (approvedMember) {
                    setActiveMembers([...activeMembers, { ...approvedMember, status: "approved" }]);
                }
                setCircle({ ...circle, memberCount: circle.memberCount + 1 });
            }
        } catch (e) { }
    };

    // 👇 NEW: Save Edit
    var handleSaveEdit = async function (e: any) {
        e.preventDefault();
        setSavingEdit(true);
        try {
            var r = await fetch("/api/circles/" + circleId, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, emoji: editEmoji, description: editDescription }),
            });
            if (r.ok) {
                var updated = await r.json();
                setCircle({ ...circle, name: updated.name, emoji: updated.emoji, description: updated.description });
                setIsEditing(false);
            } else {
                alert("Failed to update circle");
            }
        } catch (e) { }
        setSavingEdit(false);
    };

    // 👇 NEW: Kick/Reject Member
    var handleKickMember = async function (memberId: string, memberName: string) {
        if (!window.confirm(`Are you sure you want to remove ${memberName} from the circle?`)) return;
        try {
            var r = await fetch("/api/circles/" + circleId + "/members/" + memberId, {
                method: "DELETE",
            });
            if (r.ok) {
                setPendingMembers(pendingMembers.filter((m: any) => m.user.id !== memberId));
                setActiveMembers(activeMembers.filter((m: any) => m.user.id !== memberId));
                setCircle({ ...circle, memberCount: Math.max(0, circle.memberCount - 1) });
            } else {
                alert("Failed to remove member");
            }
        } catch (e) { }
    };

    var handleDeleteCircle = async function () {
        if (!window.confirm("Are you sure? All messages and posts will be lost forever.")) return;
        try {
            var r = await fetch("/api/circles/" + circleId, { method: "DELETE" });
            if (r.ok) {
                router.replace("/connect");
            }
        } catch (e) { }
    };

    if (loading) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Loading...</p>
            </main>
        );
    }

    if (!circle) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>Circle not found</p>
            </main>
        );
    }

    var isMember = circle.myStatus === "approved";
    var isPending = circle.myStatus === "pending";
    var isCreator = circle.myRole === "creator";

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 100 }}>

                <div style={{ padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>

                    {/* 👇 Header with Back Button and Admin Gear */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: S.md }}>
                        <button onClick={function () { router.back(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                            <span style={{ fontSize: 15, fontWeight: 500, color: C.textSecondary }}>← Back</span>
                        </button>

                        {isCreator && (
                            <button onClick={handleOpenAdmin} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>
                                ⚙️
                            </button>
                        )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: S.md }}>
                        <div style={{ width: 64, height: 64, borderRadius: R.md, background: circle.coverColor || C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>
                            {circle.emoji || "🌿"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: S.sm }}>
                                <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0 }}>{circle.name}</h1>
                                {circle.isPrivate && (
                                    <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, border: "1px solid " + C.border, color: C.textSecondary }}>private</span>
                                )}
                            </div>
                            <p style={{ color: C.textSecondary, fontSize: 13, marginTop: 2, margin: "2px 0 0 0" }}>
                                {circle.memberCount} {circle.memberCount === 1 ? "member" : "members"} · {circle.postCount} {circle.postCount === 1 ? "post" : "posts"}
                            </p>
                        </div>
                    </div>
                    {circle.description && (
                        <p style={{ color: C.textSecondary, fontSize: 13, marginTop: S.md, margin: S.md + "px 0 0 0", lineHeight: 1.5 }}>
                            {circle.description}
                        </p>
                    )}

                    <div style={{ marginTop: S.md }}>
                        {isCreator ? (
                            <span style={{ fontSize: 12, color: C.textTertiary }}>You created this circle</span>
                        ) : isMember ? (
                            <button onClick={handleJoin} disabled={joining} style={{ padding: "8px " + S.lg + "px", borderRadius: R.full, background: "transparent", border: "1px solid " + C.border, color: C.textPrimary, fontSize: 13, fontWeight: 600, cursor: joining ? "not-allowed" : "pointer" }}>
                                {joining ? "..." : "Leave circle"}
                            </button>
                        ) : isPending ? (
                            <span style={{ fontSize: 12, color: C.textSecondary }}>⏳ Request pending</span>
                        ) : (
                            <button onClick={handleJoin} disabled={joining} style={{ padding: "8px " + S.lg + "px", borderRadius: R.full, background: C.primary, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: joining ? "not-allowed" : "pointer" }}>
                                {joining ? "..." : (circle.isPrivate ? "Request to join" : "Join")}
                            </button>
                        )}
                    </div>
                </div>

                {isMember && (
                    <div style={{ display: "flex", padding: "0 " + S.lg + "px", borderBottom: "1px solid " + C.border }}>
                        {[
                            { id: "feed", label: "Feed" },
                            { id: "chat", label: "Chat" },
                            { id: "members", label: "Members" },
                        ].map(function (t) {
                            var active = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={function () { setTab(t.id); }}
                                    style={{ padding: S.md + "px 0", marginRight: S.xl, background: "none", border: "none", borderBottom: active ? "2px solid " + C.primary : "2px solid transparent", fontSize: 15, fontWeight: active ? 700 : 500, color: active ? C.textPrimary : C.textSecondary, cursor: "pointer", position: "relative", bottom: -1 }}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {!isMember ? (
                    <div style={{ textAlign: "center", padding: S.xxl }}>
                        <div style={{ fontSize: 40, marginBottom: S.md }}>🔒</div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: 0, marginBottom: S.sm }}>
                            {isPending ? "Waiting for approval" : "Members only"}
                        </p>
                        <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>
                            {isPending ? "The creator will approve your request soon." : "Join to see the feed and chat."}
                        </p>
                    </div>
                ) : (
                    <>
                        {tab === "feed" && <CircleFeed circleId={circleId} />}
                        {tab === "chat" && <CircleChat circleId={circleId} />}
                        {tab === "members" && <CircleMembers circleId={circleId} creatorId={circle.creator?.id} />}
                    </>
                )}

            </div>

            {/* 👇 ADMIN SETTINGS MODAL (WEB) */}
            {showAdminMenu && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center", padding: S.lg }}>
                    <div style={{ background: C.surface, width: "100%", maxWidth: 500, borderRadius: R.xl, border: "1px solid " + C.border, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "80vh" }}>

                        <div style={{ padding: S.lg, borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
                                {isEditing ? "Edit Circle Details" : "Admin Settings"}
                            </h2>
                            <button onClick={function () { setShowAdminMenu(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, fontSize: 16, fontWeight: 600 }}>Close</button>
                        </div>

                        <div style={{ padding: S.lg, overflowY: "auto", flex: 1 }}>

                            {/* EDIT FORM VIEW */}
                            {isEditing ? (
                                <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: S.md }}>
                                    <div>
                                        <label style={{ fontSize: 13, color: C.textSecondary, marginBottom: 4, display: "block" }}>Circle Name</label>
                                        <input value={editName} onChange={function (e) { setEditName(e.target.value); }} required style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, background: C.background, color: C.textPrimary, boxSizing: "border-box" }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 13, color: C.textSecondary, marginBottom: 4, display: "block" }}>Emoji</label>
                                        <input value={editEmoji} onChange={function (e) { setEditEmoji(e.target.value); }} maxLength={2} style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, background: C.background, color: C.textPrimary, boxSizing: "border-box" }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 13, color: C.textSecondary, marginBottom: 4, display: "block" }}>Description</label>
                                        <textarea value={editDescription} onChange={function (e) { setEditDescription(e.target.value); }} rows={3} style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, background: C.background, color: C.textPrimary, boxSizing: "border-box", resize: "none" }} />
                                    </div>

                                    <div style={{ display: "flex", gap: S.sm, marginTop: S.md }}>
                                        <button type="button" onClick={function () { setIsEditing(false); }} style={{ flex: 1, padding: S.md, background: "transparent", border: "1px solid " + C.border, color: C.textPrimary, borderRadius: R.md, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                                        <button type="submit" disabled={savingEdit} style={{ flex: 1, padding: S.md, background: C.primary, color: "#fff", border: "none", borderRadius: R.md, cursor: savingEdit ? "not-allowed" : "pointer", fontWeight: 600 }}>{savingEdit ? "Saving..." : "Save Changes"}</button>
                                    </div>
                                </form>
                            ) : (
                                /* MAIN ADMIN MENU VIEW */
                                <>
                                    <button onClick={function () { setIsEditing(true); }} style={{ width: "100%", padding: S.md, background: "transparent", border: "1px solid " + C.border, borderRadius: R.md, fontWeight: 600, color: C.textPrimary, cursor: "pointer", marginBottom: S.xl }}>
                                        ✏️ Edit Circle Details
                                    </button>

                                    {/* PENDING REQUESTS */}
                                    <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textSecondary, margin: "0 0 " + S.md + "px 0" }}>Pending Requests</h3>
                                    {loadingMembers ? (
                                        <p style={{ color: C.textSecondary }}>Loading...</p>
                                    ) : pendingMembers.length === 0 ? (
                                        <p style={{ color: C.textTertiary, fontStyle: "italic", fontSize: 14, marginBottom: S.xl }}>No pending requests right now.</p>
                                    ) : (
                                        pendingMembers.map(function (m: any) {
                                            return (
                                                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: S.md + " 0", borderBottom: "1px solid " + C.borderLight }}>
                                                    <div>
                                                        <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 15, margin: 0 }}>{m.user.name}</p>
                                                        <p style={{ color: C.textSecondary, fontSize: 13, margin: "2px 0 0 0" }}>@{m.user.username}</p>
                                                    </div>
                                                    <div style={{ display: "flex", gap: S.sm }}>
                                                        <button onClick={function () { handleApprove(m.user.id); }} style={{ background: C.primary, color: "#fff", padding: "6px 16px", borderRadius: R.md, border: "none", fontWeight: 600, cursor: "pointer" }}>Approve</button>
                                                        <button onClick={function () { handleKickMember(m.user.id, m.user.name); }} style={{ background: C.dangerLight, color: C.danger, padding: "6px 16px", borderRadius: R.md, border: "none", fontWeight: 600, cursor: "pointer" }}>Reject</button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}

                                    {/* ACTIVE MEMBERS */}
                                    <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textSecondary, margin: S.xl + "px 0 " + S.md + "px 0" }}>Current Members</h3>
                                    {loadingMembers ? (
                                        <p style={{ color: C.textSecondary }}>Loading...</p>
                                    ) : activeMembers.length === 0 ? (
                                        <p style={{ color: C.textTertiary, fontStyle: "italic", fontSize: 14 }}>No active members yet.</p>
                                    ) : (
                                        activeMembers.map(function (m: any) {
                                            return (
                                                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: S.md + " 0", borderBottom: "1px solid " + C.borderLight }}>
                                                    <div>
                                                        <p style={{ color: C.textPrimary, fontWeight: 600, fontSize: 15, margin: 0 }}>{m.user.name}</p>
                                                        <p style={{ color: C.textSecondary, fontSize: 13, margin: "2px 0 0 0" }}>@{m.user.username}</p>
                                                    </div>
                                                    <button onClick={function () { handleKickMember(m.user.id, m.user.name); }} style={{ background: "transparent", color: C.danger, padding: "6px 16px", borderRadius: R.md, border: "1px solid " + C.danger, fontWeight: 600, cursor: "pointer" }}>Remove</button>
                                                </div>
                                            );
                                        })
                                    )}

                                    <div style={{ marginTop: S.xl, paddingTop: S.xl, borderTop: "1px solid " + C.border }}>
                                        <button onClick={handleDeleteCircle} style={{ width: "100%", padding: S.md, background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid #ef4444", borderRadius: R.md, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                                            Delete Circle
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
function CircleFeed({ circleId }: any) {
    // ... Keep your existing CircleFeed code exactly the same!
    var C = useColors();
    var router = useRouter();
    var fileInputRef = useRef<HTMLInputElement>(null);
    var [posts, setPosts] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [content, setContent] = useState("");
    var [files, setFiles] = useState<File[]>([]);
    var [previews, setPreviews] = useState<string[]>([]);
    var [posting, setPosting] = useState(false);

    var MAX_IMAGES = 4;

    useEffect(function () { load(); }, []);

    var load = async function () {
        try {
            var r = await fetch("/api/circles/" + circleId + "/posts");
            if (r.ok) {
                var data = await r.json();
                setPosts(data.posts || []);
            }
        } catch (e) { }
        setLoading(false);
    };

    var handlePick = function () {
        if (files.length >= MAX_IMAGES) return;
        if (fileInputRef.current) fileInputRef.current.click();
    };

    var handleFileChange = function (e: any) {
        var picked: FileList = e.target.files;
        if (!picked) return;

        var newFiles = files.slice();
        var newPreviews = previews.slice();

        for (var i = 0; i < picked.length && newFiles.length < MAX_IMAGES; i++) {
            var f = picked[i];
            if (!f.type.startsWith("image/")) continue;
            newFiles.push(f);
            newPreviews.push(URL.createObjectURL(f));
        }

        setFiles(newFiles);
        setPreviews(newPreviews);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    var handleRemove = function (index: number) {
        URL.revokeObjectURL(previews[index]);
        setFiles(files.filter(function (_: any, i: number) { return i !== index; }));
        setPreviews(previews.filter(function (_: any, i: number) { return i !== index; }));
    };

    var uploadFiles = async function (): Promise<string[]> {
        if (files.length === 0) return [];

        var fd = new FormData();
        for (var i = 0; i < files.length; i++) {
            fd.append("files", files[i]);
        }

        var r = await fetch("/api/upload/multi", { method: "POST", body: fd });
        if (!r.ok) {
            var t = await r.text();
            throw new Error(t || "Upload failed");
        }
        var data = await r.json();
        return data.urls || [];
    };

    var handlePost = async function () {
        if (!content.trim() && files.length === 0) return;
        setPosting(true);
        try {
            var urls = await uploadFiles();

            var r = await fetch("/api/feed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content.trim(),
                    imageUrls: urls,
                    anonymous: false,
                    circleId: circleId,
                }),
            });

            if (r.ok) {
                await load();
                setContent("");
                previews.forEach(function (p) { URL.revokeObjectURL(p); });
                setFiles([]);
                setPreviews([]);
            }
        } catch (e) { }
        setPosting(false);
    };

    return (
        <div>
            <div style={{ padding: S.lg, borderBottom: "1px solid " + C.border }}>
                <textarea
                    value={content}
                    onChange={function (e) { setContent(e.target.value); }}
                    placeholder="Share something with the circle..."
                    rows={3}
                    maxLength={500}
                    style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, background: C.surface, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit", resize: "none" }}
                />

                {previews.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.sm, marginTop: S.md }}>
                        {previews.map(function (url: string, i: number) {
                            return (
                                <div key={i} style={{ position: "relative" }}>
                                    <img src={url} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: R.md }} />
                                    <button
                                        onClick={function () { handleRemove(i); }}
                                        style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: 12, background: "rgba(0,0,0,0.7)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    >
                                        <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✕</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: S.sm, marginTop: S.md }}>
                    <button
                        onClick={handlePick}
                        disabled={files.length >= MAX_IMAGES}
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: S.sm + "px " + S.md + "px",
                            borderRadius: R.md,
                            border: "1px solid " + C.border,
                            background: "transparent",
                            cursor: files.length >= MAX_IMAGES ? "not-allowed" : "pointer",
                        }}
                    >
                        <span style={{ fontSize: 16 }}>📷</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: C.textSecondary }}>{files.length}/{MAX_IMAGES}</span>
                    </button>

                    <button
                        onClick={handlePost}
                        disabled={(!content.trim() && files.length === 0) || posting}
                        style={{
                            marginLeft: "auto",
                            padding: S.sm + "px " + S.lg + "px",
                            borderRadius: R.full,
                            background: (content.trim() || files.length > 0) ? C.primary : C.border,
                            color: (content.trim() || files.length > 0) ? "#fff" : C.textTertiary,
                            border: "none",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: (content.trim() || files.length > 0) ? "pointer" : "not-allowed",
                        }}
                    >
                        {posting ? "Posting..." : "Post"}
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
            </div>

            {loading ? (
                <p style={{ padding: S.xxl, textAlign: "center", color: C.textSecondary }}>Loading...</p>
            ) : posts.length === 0 ? (
                <div style={{ textAlign: "center", padding: S.xxl }}>
                    <div style={{ fontSize: 40, marginBottom: S.md }}>🌿</div>
                    <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>No posts yet. Be the first.</p>
                </div>
            ) : (
                posts.map(function (post: any) {
                    return (
                        <FeedPostCard
                            key={post.id}
                            post={post}
                            onPress={function () { router.push("/connect/" + post.id); }}
                        />
                    );
                })
            )}
        </div>
    );
}


// ─────────────────────────────────────────────────────────────
// CHAT COMPONENT (Updated with Reactions & Voice Notes)
// ─────────────────────────────────────────────────────────────

function CircleChat({ circleId }: any) {
    var C = useColors();
    var [messages, setMessages] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [replyingTo, setReplyingTo] = useState<any>(null);
    var [activeMenu, setActiveMenu] = useState<string | null>(null);
    var [editingMessage, setEditingMessage] = useState<any>(null);
    var bottomRef = useRef<HTMLDivElement>(null);

    useEffect(function () {
        loadInitial();
        var interval = setInterval(poll, 3000);
        return function () { clearInterval(interval); };
    }, []);

    useEffect(function () {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    var loadInitial = async function () {
        try {
            var r = await fetch("/api/circles/" + circleId + "/messages");
            if (r.ok) {
                var data = await r.json();
                setMessages(data.messages || []);
            }
        } catch (e) { }
        setLoading(false);
    };

    var poll = async function () {
        if (!messages.length) return;
        var last = messages[messages.length - 1].createdAt;
        try {
            var r = await fetch("/api/circles/" + circleId + "/messages?since=" + encodeURIComponent(last));
            if (r.ok) {
                var data = await r.json();
                if (data.messages && data.messages.length > 0) {
                    setMessages(messages.concat(data.messages));
                }
            }
        } catch (e) { }
    };

    // 🚨 REACTION HANDLER
    var handleReaction = async function (messageId: string, emoji: string) {
        setActiveMenu(null);
        // Optimistic update
        setMessages(messages.map(function (m) {
            if (m.id !== messageId) return m;
            var existing = (m.reactions || []).find(function (r: any) { return r.mine; });

            if (existing && existing.emoji === emoji) {
                // Toggle off
                return { ...m, reactions: m.reactions.filter(function (r: any) { return !r.mine; }) };
            }
            if (existing) {
                // Change emoji
                return { ...m, reactions: m.reactions.map(function (r: any) { return r.mine ? { ...r, emoji } : r; }) };
            }
            // Add new
            return { ...m, reactions: [...(m.reactions || []), { emoji, count: 1, mine: true }] };
        }));

        try {
            await fetch("/api/circles/" + circleId + "/messages/" + messageId + "/react", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emoji }),
            });
            // Re-fetch to sync exactly with backend
            loadInitial();
        } catch (e) { }
    };

    var handleDelete = async function (messageId: string) {
        if (!window.confirm("Delete this message?")) return;
        setActiveMenu(null);
        try {
            var r = await fetch("/api/circles/" + circleId + "/messages/" + messageId, {
                method: "DELETE",
            });
            if (r.ok) {
                setMessages(messages.filter(function (m) { return m.id !== messageId; }));
            }
        } catch (e) { }
    };

    var handleReply = function (m: any) {
        setReplyingTo(m);
        setEditingMessage(null);
    };

    var handleEdit = function (m: any) {
        setEditingMessage(m);
        setReplyingTo(null);
    };

    return (
        <div>
            <div className="no-scrollbar" style={{ minHeight: 300, maxHeight: "60vh", overflowY: "auto", padding: S.lg }}>
                {loading ? (
                    <p style={{ textAlign: "center", color: C.textSecondary }}>Loading...</p>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: "center", padding: S.xxl }}>
                        <div style={{ fontSize: 40, marginBottom: S.md }}>💬</div>
                        <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>No messages yet. Say hi.</p>
                    </div>
                ) : (
                    messages.map(function (m: any) {
                        var isMine = m.isMine;
                        var isEditing = editingMessage && editingMessage.id === m.id;
                        var isEditable = isMine && (Date.now() - new Date(m.createdAt).getTime() < 15 * 60 * 1000);
                        var isAudio = m.content.startsWith("🎤 ");

                        return (
                            <div
                                key={m.id}
                                style={{ display: "flex", flexDirection: isMine ? "row-reverse" : "row", alignItems: "flex-end", marginBottom: S.sm, gap: 8 }}
                                onMouseLeave={function () { setActiveMenu(null); }}
                            >
                                {!isEditing && (
                                    <div style={{ position: "relative", paddingBottom: 6 }}>
                                        <button onClick={function () { setActiveMenu(activeMenu === m.id ? null : m.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.textTertiary, fontSize: 18, padding: "0 6px" }}>···</button>

                                        {activeMenu === m.id && (
                                            <div style={{ position: "absolute", bottom: "100%", [isMine ? "right" : "left"]: 0, background: C.surface, border: "1px solid " + C.border, borderRadius: R.md, padding: 4, zIndex: 10, minWidth: 140, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>

                                                {/* 🚨 QUICK REACTIONS ROW (Top of Menu) */}
                                                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: "1px solid " + C.border, marginBottom: 4 }}>
                                                    {["❤️", "😂", "👍", "😮", "😢"].map(function (emoji) {
                                                        return (
                                                            <button key={emoji} onClick={function () { handleReaction(m.id, emoji); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 2 }}>
                                                                {emoji}
                                                            </button>
                                                        )
                                                    })}
                                                </div>

                                                <button onClick={function () { handleReply(m); setActiveMenu(null); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "6px 12px", cursor: "pointer", fontSize: 13, color: C.textPrimary }}>Reply</button>
                                                {isMine && (
                                                    <>
                                                        {isEditable && (
                                                            <button onClick={function () { handleEdit(m); setActiveMenu(null); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "6px 12px", cursor: "pointer", fontSize: 13, color: C.textPrimary }}>Edit</button>
                                                        )}
                                                        <button onClick={function () { handleDelete(m.id); setActiveMenu(null); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "6px 12px", cursor: "pointer", fontSize: 13, color: C.danger }}>Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ maxWidth: isEditing ? "100%" : "75%", flex: isEditing ? 1 : "none", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>

                                    {!isMine && !isEditing && <p style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, margin: "0 0 2px 4px" }}>{m.user?.name}</p>}

                                    <div style={{ padding: S.sm + "px " + S.md + "px", borderRadius: R.lg, background: isMine ? C.primary : C.surfaceAlt, color: isMine ? "#fff" : C.textPrimary, position: "relative", overflow: "hidden", width: isEditing ? "100%" : "auto" }}>

                                        {!isEditing && m.replyTo && (
                                            <div style={{ background: isMine ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)", padding: 6, borderRadius: 6, marginBottom: 6, borderLeft: "3px solid " + (isMine ? "#fff" : C.primary) }}>
                                                <p style={{ fontSize: 11, fontWeight: 700, color: isMine ? "#fff" : C.primary, margin: 0 }}>{m.replyTo.senderName}</p>
                                                <p style={{ fontSize: 12, color: isMine ? "rgba(255,255,255,0.8)" : C.textSecondary, margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.replyTo.content}</p>
                                            </div>
                                        )}

                                        {isEditing ? (
                                            <CircleChatInput
                                                circleId={circleId}
                                                initialText={m.content}
                                                editingMessageId={m.id}
                                                onCancelEdit={function () { setEditingMessage(null); }}
                                                onSent={loadInitial}
                                                isEditingStyle={true}
                                            />
                                        ) : (
                                            isAudio ? (
                                                <audio controls src={m.content.replace("🎤 ", "")} style={{ maxWidth: "100%", height: 40, marginTop: 4 }} />
                                            ) : (
                                                <p style={{ fontSize: 14, lineHeight: 1.4, margin: 0, wordBreak: "break-word" }}>{m.content}</p>
                                            )
                                        )}

                                        {!isEditing && (
                                            <p style={{ fontSize: 10, opacity: 0.7, margin: "4px 0 0 0", textAlign: isMine ? "right" : "left" }}>
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                                            </p>
                                        )}
                                    </div>

                                    {/* 🚨 RENDER REACTIONS PILLS */}
                                    {m.reactions && m.reactions.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4, justifyContent: isMine ? "flex-end" : "flex-start" }}>
                                            {m.reactions.map(function (r: any, i: number) {
                                                return (
                                                    <div key={i} style={{ background: r.mine ? C.primaryLight : C.surface, border: "1px solid " + (r.mine ? C.primary : C.border), borderRadius: 12, padding: "2px 6px", display: "flex", alignItems: "center", gap: 4 }}>
                                                        <span style={{ fontSize: 12 }}>{r.emoji}</span>
                                                        <span style={{ fontSize: 10, color: r.mine ? C.primary : C.textSecondary }}>{r.count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* COMPOSER AREA */}
            <div style={{ position: "fixed", bottom: 72, left: 0, right: 0, background: C.background, borderTop: "1px solid " + C.border, padding: S.md }}>
                <div style={{ maxWidth: 600, margin: "0 auto" }}>
                    {!editingMessage && (
                        <CircleChatInput
                            circleId={circleId}
                            replyingTo={replyingTo}
                            onCancelReply={function () { setReplyingTo(null); }}
                            onSent={function (msg: any) {
                                setMessages(messages.concat([msg]));
                                setReplyingTo(null);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// NEW: COMPOSER COMPONENT (TEXT + VOICE + EDIT)
// ─────────────────────────────────────────────────────────────

function CircleChatInput({ circleId, replyingTo, onCancelReply, onSent, initialText = "", editingMessageId, onCancelEdit, isEditingStyle }: any) {
    var C = useColors();
    var [text, setText] = useState(initialText);
    var [sending, setSending] = useState(false);
    var [isRecording, setIsRecording] = useState(false);
    var mediaRecorderRef = useRef<MediaRecorder | null>(null);
    var audioChunksRef = useRef<Blob[]>([]);

    var handleSend = async function (overrideContent?: string) {
        var content = overrideContent || text;
        if (!content.trim() || sending) return;
        setSending(true);

        try {
            var payload: any = { content: content.trim() };
            if (replyingTo) payload.replyToId = replyingTo.id;

            if (editingMessageId) {
                var rEdit = await fetch("/api/circles/" + circleId + "/messages/edit?messageId=" + editingMessageId, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: text.trim() }),
                });
                if (rEdit.ok) onSent(); // triggers reload
            } else {
                var r = await fetch("/api/circles/" + circleId + "/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (r.ok) {
                    var msg = await r.json();
                    onSent(msg);
                    setText("");
                }
            }
        } catch (e) { }
        setSending(false);
    };

    var startRecording = async function () {
        try {
            var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            var recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = function (e) {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = async function () {
                var audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                stream.getTracks().forEach(function (track) { track.stop(); }); // stop mic

                // Upload
                setSending(true);
                try {
                    var fd = new FormData();
                    fd.append("files", audioBlob, "voice-note.webm");
                    var upRes = await fetch("/api/upload/multi", { method: "POST", body: fd });
                    if (upRes.ok) {
                        var data = await upRes.json();
                        var url = data.urls[0];
                        await handleSend("🎤 " + url);
                    }
                } catch (e) { }
                setSending(false);
            };

            recorder.start();
            setIsRecording(true);
        } catch (e) {
            alert("Microphone access denied or not available.");
        }
    };

    var stopRecording = function () {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div style={{ width: "100%" }}>
            {replyingTo && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surfaceAlt, padding: S.sm, borderRadius: R.md, marginBottom: S.sm, borderLeft: "3px solid " + C.primary }}>
                    <div style={{ overflow: "hidden" }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: C.primary, margin: 0 }}>Replying to {replyingTo.user?.name}</p>
                        <p style={{ fontSize: 12, color: C.textSecondary, margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{replyingTo.content}</p>
                    </div>
                    <button onClick={onCancelReply} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, fontSize: 16 }}>✕</button>
                </div>
            )}

            <div style={{ display: "flex", gap: S.sm, alignItems: "center" }}>
                <input
                    type="text"
                    value={text}
                    onChange={function (e) { setText(e.target.value); }}
                    onKeyDown={function (e) { if (e.key === "Enter") handleSend(); }}
                    placeholder={isRecording ? "Recording..." : "Message the circle..."}
                    disabled={isRecording || sending}
                    maxLength={500}
                    style={{ flex: 1, padding: S.md, borderRadius: R.full, border: "1px solid " + C.border, fontSize: 14, background: C.surfaceAlt, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                />

                {text.trim().length === 0 && !isRecording ? (
                    <button
                        onClick={startRecording}
                        disabled={sending}
                        style={{ width: 40, height: 40, borderRadius: 20, background: C.border, color: C.textPrimary, border: "none", fontSize: 16, cursor: "pointer", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}
                    >
                        🎤
                    </button>
                ) : (
                    <button
                        onClick={isRecording ? stopRecording : function () { handleSend(); }}
                        disabled={sending}
                        style={{ width: 40, height: 40, borderRadius: 20, background: isRecording ? C.danger : C.primary, color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer", flexShrink: 0 }}
                    >
                        {isRecording ? "■" : "→"}
                    </button>
                )}

                {isEditingStyle && (
                    <button onClick={onCancelEdit} style={{ background: "none", border: "none", color: C.textSecondary, cursor: "pointer", fontSize: 13 }}>Cancel</button>
                )}
            </div>
        </div>
    );
}

function CircleMembers({ circleId, creatorId }: any) {
    var C = useColors();
    var [members, setMembers] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);

    useEffect(function () { load(); }, []);

    var load = async function () {
        try {
            var r = await fetch("/api/circles/" + circleId + "/members");
            if (r.ok) {
                var data = await r.json();
                // 👇 Handle both direct array or wrapped object
                var list = Array.isArray(data) ? data : (data.members || []);
                setMembers(list);
            }
        } catch (e) { }
        setLoading(false);
    };

    if (loading) {
        return <p style={{ padding: S.xxl, textAlign: "center", color: C.textSecondary }}>Loading...</p>;
    }

    if (members.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: S.xxl }}>
                <div style={{ fontSize: 40, marginBottom: S.md }}>👥</div>
                <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>No members yet.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: S.md }}>
            {members.map(function (m: any) {
                var isCreator = m.id === creatorId || m.role === "creator";
                return (
                    <div
                        key={m.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: S.md,
                            padding: S.md,
                            borderBottom: "1px solid " + C.border,
                        }}
                    >
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                background: m.avatarColor || C.surfaceAlt,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                                fontWeight: 600,
                                color: C.textPrimary,
                                flexShrink: 0,
                                overflow: "hidden",
                            }}
                        >
                            {m.user?.avatarUrl ? (
                                <img
                                    src={m.user.avatarUrl}
                                    alt={m.user.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                (m.user?.name || "?").charAt(0).toUpperCase()
                            )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <p
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: C.textPrimary,
                                        margin: 0,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {m.user?.name}
                                </p>
                                {isCreator && (
                                    <span
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 600,
                                            padding: "1px 6px",
                                            borderRadius: 4,
                                            background: C.primaryLight,
                                            color: C.primary,
                                        }}
                                    >
                                        creator
                                    </span>
                                )}
                            </div>
                            {m.user?.username && (
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: C.textSecondary,
                                        margin: "2px 0 0 0",
                                    }}
                                >
                                    @{m.user?.username}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
} 