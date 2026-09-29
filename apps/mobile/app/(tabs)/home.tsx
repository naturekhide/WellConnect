import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { submitMood, getMoodStats, getMoodToday, getInsights, getJournal, getGoals } from "../../src/api/client";
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
    var { user } = useAuthStore();
    var [selectedMood, setSelectedMood] = useState<any>(null);
    var [submitted, setSubmitted] = useState(false);
    var [checkedToday, setCheckedToday] = useState(false);
    var [stats, setStats] = useState<any>(null);
    var [insight, setInsight] = useState<any>(null);
    var [journalCount, setJournalCount] = useState(0);
    var [goalCount, setGoalCount] = useState(0);
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
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.content}>
                    <Skeleton width={200} height={28} />
                    <Skeleton width={220} height={16} style={{ marginTop: 8 }} />
                    <Skeleton width="100%" height={82} style={{ marginTop: 16 }} />
                    <Skeleton width={100} height={14} style={{ marginTop: 16 }} />
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                        <Skeleton width="31%" height={90} />
                        <Skeleton width="31%" height={90} />
                        <Skeleton width="31%" height={90} />
                    </View>
                    <Skeleton width="100%" height={110} style={{ marginTop: 16 }} />
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
                <Text style={[styles.greeting, { color: colors.textPrimary }]}>
                    Good {getTimeOfDay()}, {user?.name?.split(" ")[0] || "Friend"}
                </Text>
                <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>How are you feeling today?</Text>

                {insight && (
                    <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.primary }]}>
                        <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>💡 {insight.title}</Text>
                        <Text style={[styles.insightText, { color: colors.textSecondary }]}>{insight.description}</Text>
                    </View>
                )}

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

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Your week</Text>
                <View style={styles.weekRow}>
                    <View style={[styles.weekCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={styles.weekEmoji}>🔥</Text>
                        <Text style={[styles.weekNumber, { color: colors.primary }]}>{stats?.streak || 0}</Text>
                        <Text style={[styles.weekLabel, { color: colors.textSecondary }]}>day streak</Text>
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

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Your space</Text>
                <View style={styles.quickRow}>
                    <TouchableOpacity
                        style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={function () { router.push("/(tabs)/journal"); }}
                    >
                        <Text style={styles.quickEmoji}>📝</Text>
                        <Text style={[styles.quickTitle, { color: colors.textPrimary }]}>Journal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={function () { router.push("/(tabs)/goals"); }}
                    >
                        <Text style={styles.quickEmoji}>🎯</Text>
                        <Text style={[styles.quickTitle, { color: colors.textPrimary }]}>Goals</Text>
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
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    greeting: { fontSize: 24, fontWeight: "700" },
    greetingSub: { fontSize: 15, marginBottom: spacing.sm },
    insightCard: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderLeftWidth: 4,
        borderWidth: 1,
        ...shadow.sm,
    },
    insightTitle: { fontSize: 14, fontWeight: "600", marginBottom: spacing.xs },
    insightText: { fontSize: 13, lineHeight: 19 },
    moodGrid: { flexDirection: "row", gap: spacing.sm },
    moodCard: {
        flex: 1,
        alignItems: "center",
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 2,
        minHeight: 82,
        justifyContent: "center",
    },
    moodEmoji: { fontSize: 26, marginBottom: 4 },
    moodText: { fontSize: 11, fontWeight: "600" },
    submittedBox: { padding: spacing.lg, borderRadius: radius.lg, alignItems: "center" },
    submittedEmoji: { fontSize: 28, marginBottom: 4 },
    submittedText: { fontWeight: "600", fontSize: 14 },
    checkedBox: { padding: spacing.lg, borderRadius: radius.lg, alignItems: "center", borderWidth: 1 },
    checkedText: { fontSize: 14, textAlign: "center", fontWeight: "500" },
    sectionTitle: { fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
    weekRow: { flexDirection: "row", gap: spacing.sm },
    weekCard: {
        flex: 1,
        borderRadius: radius.lg,
        padding: spacing.md,
        alignItems: "center",
        borderWidth: 1,
        ...shadow.sm,
    },
    weekEmoji: { fontSize: 20, marginBottom: 4 },
    weekNumber: { fontSize: 22, fontWeight: "700" },
    weekLabel: { fontSize: 10, marginTop: 2, fontWeight: "500" },
    wellbeingCard: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        gap: spacing.md,
        ...shadow.sm,
    },
    wellbeingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    wellbeingLabel: { fontSize: 13 },
    wellbeingValue: { fontSize: 14, fontWeight: "600" },
    progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 4 },
    quickRow: { flexDirection: "row", gap: spacing.sm },
    quickCard: {
        flex: 1,
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: "center",
        borderWidth: 1,
        ...shadow.sm,
    },
    quickEmoji: { fontSize: 24, marginBottom: 6 },
    quickTitle: { fontSize: 13, fontWeight: "600" },
});