import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getUserProfile, toggleFollow } from "../../src/api/client";
import { useColors, spacing, radius } from "../../src/theme";

export default function UserProfileScreen() {
    var router = useRouter();
    var params = useLocalSearchParams();
    var userId = params.id as string;
    var colors = useColors();
    var [profile, setProfile] = useState<any>(null);
    var [loading, setLoading] = useState(true);
    var [followState, setFollowState] = useState({ isFollowing: false, followerCount: 0, followingCount: 0 });
    var [toggling, setToggling] = useState(false);

    useEffect(function () { load(); }, [userId]);

    var load = async function () {
        try {
            var data = await getUserProfile(userId);
            setProfile(data);
            setFollowState({
                isFollowing: data.isFollowing,
                followerCount: data.stats?.followers || 0,
                followingCount: data.stats?.following || 0,
            });
        } catch (e) { }
        setLoading(false);
    };

    var handleFollow = async function () {
        if (toggling) return;
        setToggling(true);
        try {
            var data = await toggleFollow(userId);
            setFollowState({
                isFollowing: data.isFollowing,
                followerCount: data.followerCount,
                followingCount: data.followingCount,
            });
        } catch (e: any) {
            Alert.alert("Failed", e.message);
        }
        setToggling(false);
    };

    var formatDate = function (d: string) {
        return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long" });
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textSecondary }}>User not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.topBar, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={styles.backBtn}>
                    <Text style={[styles.backText, { color: colors.textPrimary }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.topTitle, { color: colors.textPrimary }]}>
                    {profile.isMe ? "Your profile" : "Profile"}
                </Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerBlock}>
                    <View style={styles.bigAvatar}>
                        <Text style={styles.bigAvatarText}>
                            {profile?.name?.charAt(0) || "U"}
                        </Text>
                    </View>
                    <Text style={[styles.name, { color: colors.textPrimary }]}>{profile.name}</Text>
                    <Text style={[styles.username, { color: colors.textSecondary }]}>@{profile.username || "user"}</Text>
                    <Text style={[styles.joined, { color: colors.textTertiary }]}>
                        Joined {profile.createdAt ? formatDate(profile.createdAt) : ""}
                    </Text>

                    {!profile.isMe && (
                        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg }}>
                            <TouchableOpacity
                                onPress={handleFollow}
                                disabled={toggling}
                                style={[
                                    styles.followBtn,
                                    { marginTop: 0 },
                                    followState.isFollowing
                                        ? { backgroundColor: "transparent", borderColor: colors.border, borderWidth: 1 }
                                        : { backgroundColor: colors.primary },
                                ]}
                            >
                                <Text style={[
                                    styles.followBtnText,
                                    { color: followState.isFollowing ? colors.textPrimary : "#fff" },
                                ]}>
                                    {followState.isFollowing ? "Following" : "Follow"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={function () { router.push("/messages/" + userId); }}
                                style={[
                                    styles.followBtn,
                                    { marginTop: 0, backgroundColor: "transparent", borderColor: colors.border, borderWidth: 1 },
                                ]}
                            >
                                <Text style={[styles.followBtnText, { color: colors.textPrimary }]}>
                                    Message
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.statsRow}>
                    <StatTile value={profile.stats?.posts || 0} label="Posts" colors={colors} />
                    <StatTile value={followState.followerCount} label="Followers" colors={colors} />
                    <StatTile value={followState.followingCount} label="Following" colors={colors} />
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Recent moments</Text>
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                    Their posts will appear here soon.
                </Text>
            </ScrollView>
        </View>
    );
}

function StatTile({ value, label, colors }: any) {
    return (
        <View style={[styles.statTile, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.lg,
        paddingTop: 60,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    backBtn: { width: 32, height: 32, justifyContent: "center" },
    backText: { fontSize: 22 },
    topTitle: { fontSize: 16, fontWeight: "700" },
    content: { paddingBottom: spacing.xxl },
    headerBlock: { alignItems: "center", padding: spacing.xl },
    bigAvatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#10b981",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.lg,
    },
    bigAvatarText: { fontSize: 38, fontWeight: "700", color: "#fff" },
    name: { fontSize: 20, fontWeight: "700" },
    username: { fontSize: 14, marginTop: 4 },
    joined: { fontSize: 12, marginTop: spacing.sm },
    followBtn: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.xl,
        paddingVertical: 10,
        borderRadius: radius.full,
    },
    followBtnText: { fontSize: 14, fontWeight: "600" },
    statsRow: {
        flexDirection: "row",
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    statTile: {
        flex: 1,
        padding: spacing.md,
        borderRadius: radius.lg,
        alignItems: "center",
    },
    statValue: { fontSize: 22, fontWeight: "700" },
    statLabel: { fontSize: 12, marginTop: 2 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: 14,
        textAlign: "center",
        padding: spacing.lg,
    },
});