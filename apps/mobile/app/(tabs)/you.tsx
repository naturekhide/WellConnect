import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { getMoodStats, getJournal, getGoals } from "../../src/api/client";
import { Skeleton } from "../../src/components";
import { useColors, spacing, radius, shadow } from "../../src/theme";

export default function YouScreen() {
    var router = useRouter();
    var colors = useColors();
    var { user, logout } = useAuthStore();
    var [stats, setStats] = useState<any>(null);
    var [journalCount, setJournalCount] = useState(0);
    var [goalCount, setGoalCount] = useState(0);
    var [loading, setLoading] = useState(true);
    var [refreshing, setRefreshing] = useState(false);

    useEffect(function () { loadAll(); }, []);

    var loadAll = async function () {
        try {
            var s = await getMoodStats();
            setStats(s);
            var j = await getJournal();
            setJournalCount(j.length);
            var g = await getGoals();
            setGoalCount(g.length);
        } catch (e) { }
        setLoading(false);
    };

    var onRefresh = async function () {
        setRefreshing(true);
        await loadAll();
        setRefreshing(false);
    };

    var handleLogout = async function () {
        await logout();
        router.replace("/auth/login");
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.content}>
                    <View style={{ alignItems: "center", marginTop: 8, gap: 12 }}>
                        <Skeleton width={88} height={88} style={{ borderRadius: 44 }} />
                        <Skeleton width={140} height={22} />
                        <Skeleton width={100} height={14} />
                    </View>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
                        <Skeleton width="31%" height={80} />
                        <Skeleton width="31%" height={80} />
                        <Skeleton width="31%" height={80} />
                    </View>
                    <Skeleton width="100%" height={60} style={{ marginTop: 16 }} />
                    <Skeleton width="100%" height={280} style={{ marginTop: 16 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            >
                <View style={styles.profileHeader}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || "U"}</Text>
                    </View>
                    <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.name || "Friend"}</Text>
                    <Text style={[styles.username, { color: colors.textSecondary }]}>@{user?.username || "user"}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.statNumber, { color: colors.primary }]}>{stats?.totalEntries || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Check-ins</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.statNumber, { color: colors.primary }]}>{journalCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Journal</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.statNumber, { color: colors.primary }]}>{goalCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Goals</Text>
                    </View>
                </View>

                {stats && stats.streak > 0 && (
                    <View style={[styles.streakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <View style={styles.streakContent}>
                            <Text style={[styles.streakNumber, { color: colors.textPrimary }]}>{stats.streak} day streak</Text>
                            <Text style={[styles.streakText, { color: colors.textSecondary }]}>Keep showing up for yourself</Text>
                        </View>
                    </View>
                )}

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Your space</Text>

                <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
                        onPress={function () { router.push("/(tabs)/journal"); }}
                    >
                        <Text style={styles.menuIcon}>💭</Text>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Journal</Text>
                            <Text style={[styles.menuSub, { color: colors.textTertiary }]}>{journalCount} entries</Text>
                        </View>
                        <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
                        onPress={function () { router.push("/(tabs)/goals"); }}
                    >
                        <Text style={styles.menuIcon}>🎯</Text>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Goals</Text>
                            <Text style={[styles.menuSub, { color: colors.textTertiary }]}>{goalCount} active</Text>
                        </View>
                        <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, styles.lastMenuItem]}
                        onPress={function () { router.push("/achievements"); }}
                    >
                        <Text style={styles.menuIcon}>🏆</Text>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Achievements</Text>
                            <Text style={[styles.menuSub, { color: colors.textTertiary }]}>See what you've earned</Text>
                        </View>
                        <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>

                <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
                        onPress={function () { router.push("/notifications"); }}
                    >
                        <Text style={styles.menuIcon}>🔔</Text>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Notifications</Text>
                        </View>
                        <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
                        onPress={function () { router.push("/privacy"); }}
                    >
                        <Text style={styles.menuIcon}>🔒</Text>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Privacy</Text>
                        </View>
                        <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}>
                        <Text style={styles.menuIcon}>⚙️</Text>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Settings</Text>
                        </View>
                        <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem]}>
                        <Text style={styles.menuIcon}>❓</Text>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Help & Support</Text>
                        </View>
                        <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.danger }]}
                    onPress={handleLogout}
                >
                    <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={[styles.footer, { color: colors.textTertiary }]}>WellConnect v1.0</Text>
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    profileHeader: { alignItems: "center", marginTop: spacing.sm, marginBottom: spacing.sm },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    avatarText: { fontSize: 36, fontWeight: "700", color: "#fff" },
    name: { fontSize: 22, fontWeight: "700" },
    username: { fontSize: 14, marginTop: 2 },
    statsRow: { flexDirection: "row", gap: spacing.sm },
    statCard: {
        flex: 1,
        borderRadius: radius.lg,
        padding: spacing.md,
        alignItems: "center",
        borderWidth: 1,
        ...shadow.sm,
    },
    statNumber: { fontSize: 22, fontWeight: "700" },
    statLabel: { fontSize: 10, marginTop: 3, fontWeight: "500" },
    streakCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        gap: spacing.md,
    },
    streakEmoji: { fontSize: 26 },
    streakContent: { flex: 1 },
    streakNumber: { fontSize: 15, fontWeight: "700" },
    streakText: { fontSize: 12, marginTop: 2 },
    sectionTitle: { fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
    menu: {
        borderRadius: radius.lg,
        borderWidth: 1,
        overflow: "hidden",
        ...shadow.sm,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.lg,
        borderBottomWidth: 1,
        gap: spacing.md,
    },
    lastMenuItem: { borderBottomWidth: 0 },
    menuIcon: { fontSize: 20 },
    menuContent: { flex: 1 },
    menuText: { fontSize: 15, fontWeight: "500" },
    menuSub: { fontSize: 11, marginTop: 2 },
    menuArrow: { fontSize: 22 },
    logoutButton: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: "center",
        borderWidth: 1,
        marginTop: spacing.sm,
    },
    logoutText: { fontWeight: "600", fontSize: 15 },
    footer: { fontSize: 11, textAlign: "center", marginTop: spacing.md },
});