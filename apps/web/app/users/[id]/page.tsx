"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";

export default function UserProfilePage() {
    var C = useColors();
    var router = useRouter();
    var params = useParams();
    var userId = params.id as string;

    var [profile, setProfile] = useState<any>(null);
    var [loading, setLoading] = useState(true);
    var [followState, setFollowState] = useState({ isFollowing: false, followerCount: 0, followingCount: 0 });
    var [toggling, setToggling] = useState(false);

    useEffect(function () { load(); }, [userId]);

    var load = async function () {
        try {
            var r = await fetch("/api/users/" + userId);
            if (r.ok) {
                var data = await r.json();
                setProfile(data);
                setFollowState({
                    isFollowing: data.isFollowing,
                    followerCount: data.stats?.followers || 0,
                    followingCount: data.stats?.following || 0,
                });
            }
        } catch (e) { }
        setLoading(false);
    };

    var handleFollow = async function () {
        if (toggling) return;
        setToggling(true);
        try {
            var r = await fetch("/api/users/" + userId + "/follow", { method: "POST" });
            if (r.ok) {
                var data = await r.json();
                setFollowState({
                    isFollowing: data.isFollowing,
                    followerCount: data.followerCount,
                    followingCount: data.followingCount,
                });
            }
        } catch (e) { }
        setToggling(false);
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

    if (!profile) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.background }}>
                <p style={{ color: C.textSecondary }}>User not found</p>
            </main>
        );
    }

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 100 }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <button onClick={function () { router.back(); }} style={{ background: "none", border: "none", cursor: "pointer", width: 32, textAlign: "left", padding: 0 }}>
                        <span style={{ fontSize: 22, color: C.textPrimary }}>←</span>
                    </button>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>
                        {profile.isMe ? "Your profile" : "Profile"}
                    </span>
                    <div style={{ width: 32 }} />
                </div>

                <div style={{ padding: S.xl, textAlign: "center" }}>
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
                    <p style={{ fontWeight: 700, fontSize: 20, color: C.textPrimary, margin: 0 }}>{profile.name}</p>
                    <p style={{ color: C.textSecondary, fontSize: 14, marginTop: 4, margin: "4px 0 0 0" }}>
                        @{profile.username || "user"}
                    </p>
                    <p style={{ color: C.textTertiary, fontSize: 12, marginTop: S.sm, margin: S.sm + "px 0 0 0" }}>
                        Joined {profile.createdAt ? formatDate(profile.createdAt) : ""}
                    </p>

                    {!profile.isMe && (
                        <button
                            onClick={handleFollow}
                            disabled={toggling}
                            style={{
                                marginTop: S.lg,
                                padding: "10px " + S.xl + "px",
                                borderRadius: R.full,
                                background: followState.isFollowing ? "transparent" : C.primary,
                                color: followState.isFollowing ? C.textPrimary : "#fff",
                                border: followState.isFollowing ? "1px solid " + C.border : "none",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: toggling ? "not-allowed" : "pointer",
                                opacity: toggling ? 0.6 : 1,
                            }}
                        >
                            {followState.isFollowing ? "Following" : "Follow"}
                        </button>
                    )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: S.sm, paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.lg }}>
                    <StatTile value={profile.stats?.posts || 0} label="Posts" />
                    <StatTile value={followState.followerCount} label="Followers" />
                    <StatTile value={followState.followingCount} label="Following" />
                </div>

                <div style={{ paddingLeft: S.lg, paddingRight: S.lg, paddingBottom: S.sm }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: 0 }}>Recent moments</h2>
                </div>
                <div style={{ padding: S.lg, paddingTop: S.sm }}>
                    <p style={{ fontSize: 14, color: C.textTertiary, textAlign: "center", margin: 0 }}>
                        Their posts will appear here soon.
                    </p>
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