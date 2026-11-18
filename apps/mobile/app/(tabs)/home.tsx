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
                    <Skeleton width="100%" height={64} style={{ marginTop: 12 }} />
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                        <Skeleton width="31%" height={72} />
                        <Skeleton width="31%" height={72} />
                        <Skeleton width="31%" height={72} />
                    </View>
                    <Skeleton width="100%" height={64} style={{ marginTop: 12 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + spacing.sm },
                ]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            >
                {/* GREETING */}
                <Text style={[styles.greeting, { color: colors.textPrimary }]}>
                    Good {getTimeOfDay()}, {user?.name?.split(" ")[0] || "there"}
                </Text>
                <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>How are you feeling today?</Text>

                {/* INSIGHT — single-line banner, tap to expand later */}
                {insight && (
                    <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.primary }]}>
                        <Text style={[styles.insightTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                            💡 {insight.title}
                        </Text>
                    </View>
                )}

                {/* MOOD */}
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

                {/* YOUR WEEK — 3 compact stats */}
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

                {/* WELLBEING — only shows when data exists, one compact row */}
                {stats && stats.totalEntries > 0 && (
                    <View style={[styles.wellbeingRowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.wellbeingLabel, { color: colors.textSecondary }]}>Avg mood</Text>
                        <Text style={[styles.wellbeingValue, { color: colors.textPrimary }]}>{stats.averageScore}/10</Text>
                        <View style={[styles.progressBar, { backgroundColor: colors.surfaceAlt }]}>
                            <View style={[styles.progressFill, { width: `${stats.averageScore * 10}%` as any, backgroundColor: colors.primary }]} />
                        </View>
                    </View>
                )}

                {/* INBOX + QUICK — single row of chips */}
                <View style={styles.chipRow}>
                    <TouchableOpacity
                        style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={function () { router.push("/(tabs)/journal"); }}
                    >
                        <Text style={styles.chipEmoji}>📝</Text>
                        <Text style={[styles.chipText, { color: colors.textPrimary }]}>Journal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={function () { router.push("/(tabs)/goals"); }}
                    >
                        <Text style={styles.chipEmoji}>🎯</Text>
                        <Text style={[styles.chipText, { color: colors.textPrimary }]}>Goals</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={function () { router.push("/my-circles"); }}
                    >
                        <Text style={styles.chipEmoji}>🌿</Text>
                        <Text style={[styles.chipText, { color: colors.textPrimary }]}>Circles</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={function () { router.push("/messages"); }}
                    >
                        <Text style={styles.chipEmoji}>💬</Text>
                        <Text style={[styles.chipText, { color: colors.textPrimary }]}>Inbox</Text>
                        {unreadDMs > 0 && (
                            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.badgeText}>{unreadDMs}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
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
    // Increased gap back to md for breathing room, kept padding md
    content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },

    greeting: { fontSize: 24, fontWeight: "700" },
    greetingSub: { fontSize: 14 },

    // Insight banner
    insightCard: {
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderLeftWidth: 3,
        borderWidth: 1,
    },
    insightTitle: { fontSize: 14, fontWeight: "600" },

    // Mood grid — taller cards
    moodGrid: { flexDirection: "row", gap: spacing.sm },
    moodCard: {
        flex: 1,
        alignItems: "center",
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        borderWidth: 2,
        minHeight: 78, // Brought back up from 64
        justifyContent: "center",
    },
    moodEmoji: { fontSize: 26, marginBottom: 4 },
    moodText: { fontSize: 11, fontWeight: "600" },

    submittedBox: { paddingVertical: spacing.lg, borderRadius: radius.md, alignItems: "center" },
    submittedEmoji: { fontSize: 24, marginBottom: 4 },
    submittedText: { fontWeight: "600", fontSize: 14 },
    checkedBox: { paddingVertical: spacing.lg, paddingHorizontal: spacing.md, borderRadius: radius.md, alignItems: "center", borderWidth: 1 },
    checkedText: { fontSize: 13, textAlign: "center", fontWeight: "500" },

    sectionTitle: { fontSize: 13, fontWeight: "600", marginTop: spacing.xs },

    // Week cards — taller and roomier
    weekRow: { flexDirection: "row", gap: spacing.sm },
    weekCard: {
        flex: 1,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        alignItems: "center",
        borderWidth: 1,
        ...shadow.sm,
    },
    weekEmoji: { fontSize: 18, marginBottom: 2 },
    weekNumber: { fontSize: 20, fontWeight: "700" },
    weekLabel: { fontSize: 10, marginTop: 2, fontWeight: "500" },

    // Wellbeing row
    wellbeingRowCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
    },
    wellbeingLabel: { fontSize: 13 },
    wellbeingValue: { fontSize: 13, fontWeight: "700" },
    progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 4 },

    // Chips row — taller, with better gaps
    chipRow: { flexDirection: "row", gap: spacing.sm },
    chip: {
        flex: 1,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        ...shadow.sm,
        position: "relative",
    },
    chipEmoji: { fontSize: 20, marginBottom: 4 },
    chipText: { fontSize: 12, fontWeight: "600" },

    badge: {
        position: "absolute",
        top: 6,
        right: 6,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});