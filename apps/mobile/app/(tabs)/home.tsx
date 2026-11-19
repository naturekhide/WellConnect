import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/store/authStore";
import { submitMood, getMoodStats, getMoodToday, getInsights, getJournal, getGoals, getDMUnreadCount } from "../../src/api/client";
import { Skeleton } from "../../src/components";
import { tapSuccess } from "../../src/haptics";
import { useColors, spacing, radius, shadow } from "../../src/theme";

var moodOptions = [
    { emoji: "😊", label: "thriving", text: "Good", score: 9, color: "#10b981" },
    { emoji: "😐", label: "managing", text: "Okay", score: 6, color: "#f59e0b" },
    { emoji: "😔", label: "struggling", text: "Low", score: 3, color: "#f97316" },
    { emoji: "😣", label: "crisis", text: "Stressed", score: 1, color: "#ef4444" },
];

export default function HomeScreen() {
    var router = useRouter();
    var colors = useColors();
    var insets = useSafeAreaInsets();
    var { user } = useAuthStore();
    var [selectedMood, setSelectedMood] = useState<any>(null);
    var [submitted, setSubmitted] = useState(false);
    var [checkedToday, setCheckedToday] = useState(false);
    var [stats, setStats] = useState<any>(null);
    var [insight, setInsight] = useState<any>(null);
    var [journalCount, setJournalCount] = useState(0);
    var [goalCount, setGoalCount] = useState(0);
    var [unreadDMs, setUnreadDMs] = useState(0);
    var [loading, setLoading] = useState(true);
    var [refreshing, setRefreshing] = useState(false);

    useEffect(function () { loadAll(); }, []);

    var loadAll = async function () {
        try {
            var todayRes = await getMoodToday();
            if (todayRes && todayRes.id) setCheckedToday(true);

            var st = await getMoodStats();
            setStats(st);

            var ins = await getInsights();
            if (ins && ins.length > 0) setInsight(ins[0]);

            var j = await getJournal();
            setJournalCount(j.length);

            var g = await getGoals();
            setGoalCount(g.length);

            try {
                var dm = await getDMUnreadCount();
                setUnreadDMs(dm.count || 0);
            } catch (e) { }
        } catch (e) { }
        setLoading(false);
    };

    var onRefresh = async function () {
        setRefreshing(true);
        await loadAll();
        setRefreshing(false);
    };

    var handleMoodSubmit = async function (mood: any) {
        setSelectedMood(mood);
        tapSuccess();
        try {
            await submitMood(mood.score, mood.label);
            setSubmitted(true);
            setCheckedToday(true);
            setTimeout(function () {
                setSubmitted(false);
                setSelectedMood(null);
                loadAll();
            }, 2500);
        } catch (e) { }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
                <View style={styles.content}>
                    <Skeleton width={200} height={24} />
                    <Skeleton width={180} height={14} style={{ marginTop: 6 }} />
                    <Skeleton width="100%" height={80} style={{ marginTop: 12 }} />
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                        <Skeleton width="31%" height={80} />
                        <Skeleton width="31%" height={80} />
                        <Skeleton width="31%" height={80} />
                    </View>
                    <Skeleton width="100%" height={70} style={{ marginTop: 12 }} />
                    <Skeleton width="100%" height={70} style={{ marginTop: 12 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + spacing.xs },
                ]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            >
                {/* GREETING */}
                <View style={styles.headerSection}>
                    <Text style={[styles.greeting, { color: colors.textPrimary }]}>
                        Good {getTimeOfDay()}, {user?.name?.split(" ")[0] || "there"}
                    </Text>
                    <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>How are you feeling today?</Text>
                </View>

                {/* INSIGHT */}
                {insight && (
                    <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.primary }]}>
                        <Text style={[styles.insightTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                            💡 {insight.title}
                        </Text>
                    </View>
                )}

                {/* MOOD CHECKER */}
                {submitted ? (
                    <View style={[styles.submittedBox, { backgroundColor: colors.primaryLight }]}>
                        <Text style={styles.submittedEmoji}>✅</Text>
                        <Text style={[styles.submittedText, { color: colors.primary }]}>Thanks for checking in</Text>
                    </View>
                ) : checkedToday ? (
                    <View style={[styles.checkedBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                        <Text style={[styles.checkedText, { color: colors.textSecondary }]}>
                            You've already checked in today. See you tomorrow 🌙
                        </Text>
                    </View>
                ) : (
                    <View style={styles.moodGrid}>
                        {moodOptions.map(function (mood: any) {
                            var isSelected = selectedMood?.label === mood.label;
                            return (
                                <TouchableOpacity
                                    key={mood.label}
                                    onPress={function () { handleMoodSubmit(mood); }}
                                    style={[
                                        styles.moodCard,
                                        { backgroundColor: colors.surface, borderColor: colors.border },
                                        isSelected && { borderColor: mood.color, backgroundColor: mood.color + "15" },
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                    <Text style={[styles.moodText, { color: colors.textSecondary }, isSelected && { color: mood.color }]}>
                                        {mood.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* YOUR WEEK */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Your week</Text>
                <View style={styles.weekRow}>
                    <View style={[styles.weekCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={styles.weekEmoji}>🔥</Text>
                        <Text style={[styles.weekNumber, { color: colors.primary }]}>{stats?.streak || 0}</Text>
                        <Text style={[styles.weekLabel, { color: colors.textSecondary }]}>streak</Text>
                    </View>
                    <View style={[styles.weekCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={styles.weekEmoji}>📝</Text>
                        <Text style={[styles.weekNumber, { color: colors.primary }]}>{journalCount}</Text>
                        <Text style={[styles.weekLabel, { color: colors.textSecondary }]}>journal</Text>
                    </View>
                    <View style={[styles.weekCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={styles.weekEmoji}>🎯</Text>
                        <Text style={[styles.weekNumber, { color: colors.primary }]}>{goalCount}</Text>
                        <Text style={[styles.weekLabel, { color: colors.textSecondary }]}>goals</Text>
                    </View>
                </View>

                {/* YOUR WELLBEING */}
                {stats && stats.totalEntries > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Your wellbeing</Text>
                        <View style={[styles.wellbeingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.wellbeingRow}>
                                <Text style={[styles.wellbeingLabel, { color: colors.textSecondary }]}>Avg mood</Text>
                                <Text style={[styles.wellbeingValue, { color: colors.textPrimary }]}>{stats.averageScore}/10</Text>
                            </View>
                            <View style={[styles.progressBar, { backgroundColor: colors.surfaceAlt }]}>
                                <View style={[styles.progressFill, { width: `${stats.averageScore * 10}%` as any, backgroundColor: colors.primary }]} />
                            </View>
                            <View style={styles.wellbeingRow}>
                                <Text style={[styles.wellbeingLabel, { color: colors.textSecondary }]}>Dominant mood</Text>
                                <Text style={[styles.wellbeingValue, { color: colors.textPrimary, textTransform: "capitalize" }]}>
                                    {stats.dominantMood}
                                </Text>
                            </View>
                        </View>
                    </>
                )}

                {/* YOUR SPACE */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Your space</Text>
                <View style={styles.quickRow}>
                    <TouchableOpacity style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={function () { router.push("/(tabs)/journal"); }}>
                        <Text style={styles.quickEmoji}>📝</Text>
                        <Text style={[styles.quickTitle, { color: colors.textPrimary }]}>Journal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={function () { router.push("/(tabs)/goals"); }}>
                        <Text style={styles.quickEmoji}>🎯</Text>
                        <Text style={[styles.quickTitle, { color: colors.textPrimary }]}>Goals</Text>
                    </TouchableOpacity>
                </View>

                {/* INBOX */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Inbox</Text>
                <TouchableOpacity style={[styles.inboxRow, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: spacing.xs }]} onPress={function () { router.push("/my-circles"); }}>
                    <Text style={styles.inboxEmoji}>🌿</Text>
                    <Text style={[styles.inboxTitle, { color: colors.textPrimary }]}>My Circles</Text>
                    <Text style={[styles.inboxArrow, { color: colors.textTertiary }]}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.inboxRow, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={function () { router.push("/messages"); }}>
                    <Text style={styles.inboxEmoji}>💬</Text>
                    <Text style={[styles.inboxTitle, { color: colors.textPrimary }]}>Messages</Text>
                    {unreadDMs > 0 && (
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.badgeText}>{unreadDMs}</Text>
                        </View>
                    )}
                    <Text style={[styles.inboxArrow, { color: colors.textTertiary }]}>›</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

function getTimeOfDay() {
    var hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
}

var styles = StyleSheet.create({
    container: { flex: 1 },

    // Reduced gap to keep it on one page, but added bottom padding
    content: { padding: spacing.md, paddingBottom: spacing.xxl },

    headerSection: { marginBottom: spacing.xs },
    greeting: { fontSize: 24, fontWeight: "700" },
    greetingSub: { fontSize: 14, marginTop: 2 },

    insightCard: {
        borderRadius: radius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderLeftWidth: 4,
        borderWidth: 1,
        marginBottom: spacing.sm,
    },
    insightTitle: { fontSize: 13, fontWeight: "600" },

    moodGrid: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xs },
    moodCard: {
        flex: 1,
        alignItems: "center",
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 2,
        minHeight: 75,
        justifyContent: "center",
    },
    moodEmoji: { fontSize: 26, marginBottom: 4 },
    moodText: { fontSize: 11, fontWeight: "600" },

    submittedBox: { padding: spacing.md, borderRadius: radius.md, alignItems: "center", marginBottom: spacing.sm },
    submittedEmoji: { fontSize: 24, marginBottom: 4 },
    submittedText: { fontWeight: "600", fontSize: 14 },
    checkedBox: { padding: spacing.md, borderRadius: radius.md, alignItems: "center", borderWidth: 1, marginBottom: spacing.sm },
    checkedText: { fontSize: 13, textAlign: "center", fontWeight: "500" },

    sectionTitle: { fontSize: 13, fontWeight: "600", marginTop: spacing.sm, marginBottom: spacing.xs },

    weekRow: { flexDirection: "row", gap: spacing.sm },
    weekCard: {
        flex: 1,
        borderRadius: radius.md,
        paddingVertical: spacing.sm,
        alignItems: "center",
        borderWidth: 1,
        ...shadow.sm,
    },
    weekEmoji: { fontSize: 18, marginBottom: 2 },
    weekNumber: { fontSize: 20, fontWeight: "700" },
    weekLabel: { fontSize: 10, marginTop: 2, fontWeight: "500" },

    wellbeingCard: {
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
        gap: spacing.xs,
        ...shadow.sm,
    },
    wellbeingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    wellbeingLabel: { fontSize: 13 },
    wellbeingValue: { fontSize: 14, fontWeight: "600" },
    progressBar: { height: 6, borderRadius: 3, overflow: "hidden", marginVertical: 2 },
    progressFill: { height: "100%", borderRadius: 3 },

    quickRow: { flexDirection: "row", gap: spacing.sm },
    quickCard: {
        flex: 1,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        alignItems: "center",
        borderWidth: 1,
        ...shadow.sm,
    },
    quickEmoji: { fontSize: 22, marginBottom: 4 },
    quickTitle: { fontSize: 13, fontWeight: "600" },

    inboxRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        ...shadow.sm,
    },
    inboxEmoji: { fontSize: 18 },
    inboxTitle: { flex: 1, fontSize: 14, fontWeight: "500" },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
    inboxArrow: { fontSize: 18 },
});