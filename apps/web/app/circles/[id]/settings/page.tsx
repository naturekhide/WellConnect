"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";

// Define the shape of the props based on your circle API
type Circle = {
    id: string;
    name: string;
    description: string | null;
    emoji: string | null;
    coverColor: string | null;
    isPrivate: boolean;
    creator: { id: string; name: string; username: string };
    members: any[]; // Replace with your actual Member type
};

export default function CircleSettings({ initialCircle, currentUserId }: { initialCircle: Circle, currentUserId: string }) {
    var C = useColors();
    var router = useRouter();

    var [isEditModalOpen, setIsEditModalOpen] = useState(false);
    var [isUpdating, setIsUpdating] = useState(false);

    // Form State
    var [name, setName] = useState(initialCircle.name);
    var [description, setDescription] = useState(initialCircle.description || "");
    var [emoji, setEmoji] = useState(initialCircle.emoji || "🌿");

    // 1. Handle Circle Update
    var handleUpdateCircle = async function (e: any) {
        e.preventDefault();
        setIsUpdating(true);

        try {
            var res = await fetch(`/api/circles/${initialCircle.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, emoji }),
            });

            if (res.ok) {
                setIsEditModalOpen(false);
                router.refresh(); // Refresh the server component data
            } else {
                alert("Failed to update circle");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    // 2. Handle Kick Member
    var handleKickMember = async function (memberId: string, memberName: string) {
        if (!confirm(`Are you sure you want to remove ${memberName} from the circle?`)) return;

        try {
            var res = await fetch(`/api/circles/${initialCircle.id}/members/${memberId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.refresh(); // Refresh the member list
            } else {
                alert("Failed to remove member");
            }
        } catch (err) {
            console.error(err);
        }
    };

    var isCreator = initialCircle.creator.id === currentUserId;

    return (
        <div style={{ padding: S.lg, color: C.textPrimary }}>

            {/* Header / Edit Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: S.xl }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
                        {initialCircle.emoji} {initialCircle.name} Settings
                    </h1>
                    <p style={{ color: C.textSecondary, margin: "4px 0 0 0" }}>Manage your circle details and members.</p>
                </div>
                {isCreator && (
                    <button
                        onClick={function () { setIsEditModalOpen(true); }}
                        style={{ padding: `${S.sm}px ${S.md}px`, background: C.primary, color: "#fff", borderRadius: R.md, border: "none", fontWeight: 600, cursor: "pointer" }}
                    >
                        Edit Circle
                    </button>
                )}
            </div>

            {/* Members List */}
            <div style={{ background: C.surface, borderRadius: R.lg, border: `1px solid ${C.border}`, padding: S.lg }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: S.md }}>Members</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
                    {initialCircle.members.map((member: any) => (
                        <div key={member.userId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: S.sm, borderBottom: `1px solid ${C.border}` }}>
                            <div>
                                <p style={{ fontWeight: 500, margin: 0 }}>{member.user.name}</p>
                                <p style={{ fontSize: 12, color: C.textSecondary, margin: 0 }}>@{member.user.username || "user"}</p>
                            </div>

                            {/* Kick Button (Only show for creator, and don't show for themselves) */}
                            {isCreator && member.userId !== currentUserId && (
                                <button
                                    onClick={function () { handleKickMember(member.userId, member.user.name); }}
                                    style={{ padding: "4px 8px", background: C.dangerLight, color: C.danger, border: "none", borderRadius: R.sm, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Circle Modal */}
            {isEditModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ background: C.surface, padding: S.xl, borderRadius: R.lg, width: "100%", maxWidth: 400, border: `1px solid ${C.border}` }}>
                        <h2 style={{ marginTop: 0, marginBottom: S.md, fontSize: 20 }}>Edit Circle</h2>

                        <form onSubmit={handleUpdateCircle} style={{ display: "flex", flexDirection: "column", gap: S.md }}>
                            <div>
                                <label style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4, display: "block" }}>Circle Name</label>
                                <input
                                    value={name}
                                    onChange={function (e) { setName(e.target.value); }}
                                    required
                                    style={{ width: "100%", padding: S.sm, borderRadius: R.md, border: `1px solid ${C.border}`, background: C.background, color: C.textPrimary }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4, display: "block" }}>Emoji</label>
                                <input
                                    value={emoji}
                                    onChange={function (e) { setEmoji(e.target.value); }}
                                    maxLength={2}
                                    style={{ width: "100%", padding: S.sm, borderRadius: R.md, border: `1px solid ${C.border}`, background: C.background, color: C.textPrimary }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4, display: "block" }}>Description</label>
                                <textarea
                                    value={description}
                                    onChange={function (e) { setDescription(e.target.value); }}
                                    rows={3}
                                    style={{ width: "100%", padding: S.sm, borderRadius: R.md, border: `1px solid ${C.border}`, background: C.background, color: C.textPrimary, resize: "none" }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: S.sm, marginTop: S.md }}>
                                <button
                                    type="button"
                                    onClick={function () { setIsEditModalOpen(false); }}
                                    style={{ flex: 1, padding: S.sm, background: "transparent", border: `1px solid ${C.border}`, color: C.textPrimary, borderRadius: R.md, cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    style={{ flex: 1, padding: S.sm, background: C.primary, color: "#fff", border: "none", borderRadius: R.md, cursor: isUpdating ? "not-allowed" : "pointer", opacity: isUpdating ? 0.7 : 1 }}
                                >
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}