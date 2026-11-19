import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/store/authStore";
import {
    submitMood,
    getMoodStats,
    getMoodToday,
    getInsights,
    getJournal,
    getGoals,
    getDMUnreadCount,
} from "../../src/api/client";
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
    var { height: windowHeight, width: windowWidth } = useWindowDimensions();
    var { user } = useAuthStore();

    // Responsive layout
    var compact = windowHeight < 760;
    var veryCompact = windowHeight < 680;
    var horizontalPadding = windowWidth < 380 ? spacing.md : spacing.lg;

    var sectionGap = veryCompact ? spacing.xs : compact ? spacing.sm : spacing.md;
    var cardPadding = veryCompact ? spacing.sm : compact ? spacing.md : spacing.md;

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

    useEffect(function () {
        loadAll();
    }, []);

    var loadAll = async function () {
        try {
            var todayRes = await getMoodToday();
            if (todayRes && todayRes.id) {
                setCheckedToday(true);
            }

            var st = await getMoodStats();
            setStats(st);

            var ins = await getInsights();
            if (ins && ins.length > 0) {
                setInsight(ins[0]);
            }

            var j = await getJournal();
            setJournalCount(j.length);

            var g = await getGoals();
            setGoalCount(g.length);

            try {
                var dm = await getDMUnreadCount();
                setUnreadDMs(dm.count || 0);
            } catch (e) {
                // Unread count is optional.
            }
        } catch (e) {
            console.log("Dashboard loading error:", e);
        }

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
        } catch (e) {
            setSelectedMood(null);
        }
    };

    if (loading) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}
            >
                <View
                    style={[
                        styles.loadingContent,
                        {
                            paddingTop: insets.top + spacing.md,
                            paddingHorizontal: horizontalPadding,
                        },
                    ]}
                >
                    <Skeleton width={220} height={28} />
                    <Skeleton width={190} height={18} style={{ marginTop: 8 }} />
                    <Skeleton width="100%" height={90} style={{ marginTop: 20 }} />

                    <View style={styles.weekRow}>
                        <Skeleton width="31%" height={100} />
                        <Skeleton width="31%" height={100} />
                        <Skeleton width="31%" height={100} />
                    </View>

                    <Skeleton width="100%" height={90} />
                    <Skeleton width="100%" height={100} />
                    <Skeleton width="100%" height={100} />
                </View>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
        >
            {/* 👇 Replaced ScrollView with View to lock it to one screen, but kept RefreshControl capability using a wrapper trick */}
            <View
                style={[
                    styles.content,
                    {
                        paddingTop: insets.top + spacing.sm,
                        paddingBottom: Math.max(insets.bottom, spacing.sm),
                        paddingHorizontal: horizontalPadding,
                        gap: sectionGap,
                    },
                ]}
            >
                {/* GREETING */}
                <View style={styles.headerSection}>
                    <Text
                        style={[
                            styles.greeting,
                            {
                                color: colors.textPrimary,
                                fontSize: compact ? 23 : 26,
                            },
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                    >
                        Good {getTimeOfDay()}, {user?.name?.split(" ")[0] || "there"}
                    </Text>

                    <Text
                        style={[
                            styles.greetingSub,
                            { color: colors.textSecondary },
                        ]}
                    >
                        How are you feeling today?
                    </Text>
                </View>

                {/* INSIGHT */}
                {insight && (
                    <View
                        style={[
                            styles.insightCard,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                borderLeftColor: colors.primary,
                                paddingVertical: cardPadding,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.insightTitle,
                                { color: colors.textPrimary },
                            ]}
                            numberOfLines={1}
                        >
                            💡 {insight.title}
                        </Text>
                    </View>
                )}

                {/* MOOD CHECKER */}
                {submitted ? (
                    <View
                        style={[
                            styles.submittedBox,
                            { backgroundColor: colors.primaryLight },
                        ]}
                    >
                        <Text style={styles.submittedEmoji}>✅</Text>
                        <Text
                            style={[
                                styles.submittedText,
                                { color: colors.primary },
                            ]}
                        >
                            Thanks for checking in
                        </Text>
                    </View>
                ) : checkedToday ? (
                    <View
                        style={[
                            styles.checkedBox,
                            {
                                backgroundColor: colors.surfaceAlt,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.checkedText,
                                { color: colors.textSecondary },
                            ]}
                        >
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
                                    onPress={function () {
                                        handleMoodSubmit(mood);
                                    }}
                                    disabled={!!selectedMood}
                                    style={[
                                        styles.moodCard,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            minHeight: veryCompact ? 60 : compact ? 70 : 80,
                                            paddingVertical: cardPadding,
                                        },
                                        isSelected && {
                                            borderColor: mood.color,
                                            backgroundColor: mood.color + "15",
                                        },
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.moodEmoji,
                                            { fontSize: compact ? 24 : 28 },
                                        ]}
                                    >
                                        {mood.emoji}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.moodText,
                                            { color: colors.textSecondary },
                                            isSelected && { color: mood.color },
                                        ]}
                                    >
                                        {mood.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* YOUR WEEK */}
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Your week
                    </Text>

                    <View style={styles.weekRow}>
                        <View
                            style={[
                                styles.weekCard,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    paddingVertical: cardPadding,
                                },
                            ]}
                        >
                            <Text style={styles.weekEmoji}>🔥</Text>
                            <Text
                                style={[
                                    styles.weekNumber,
                                    { color: colors.primary },
                                ]}
                            >
                                {stats?.streak || 0}
                            </Text>
                            <Text
                                style={[
                                    styles.weekLabel,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                streak
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.weekCard,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    paddingVertical: cardPadding,
                                },
                            ]}
                        >
                            <Text style={styles.weekEmoji}>📝</Text>
                            <Text
                                style={[
                                    styles.weekNumber,
                                    { color: colors.primary },
                                ]}
                            >
                                {journalCount}
                            </Text>
                            <Text
                                style={[
                                    styles.weekLabel,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                journal
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.weekCard,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    paddingVertical: cardPadding,
                                },
                            ]}
                        >
                            <Text style={styles.weekEmoji}>🎯</Text>
                            <Text
                                style={[
                                    styles.weekNumber,
                                    { color: colors.primary },
                                ]}
                            >
                                {goalCount}
                            </Text>
                            <Text
                                style={[
                                    styles.weekLabel,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                goals
                            </Text>
                        </View>
                    </View>
                </View>

                {/* YOUR WELLBEING */}
                {stats && stats.totalEntries > 0 && (
                    <View style={styles.section}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                { color: colors.textSecondary },
                            ]}
                        >
                            Your wellbeing
                        </Text>

                        <View
                            style={[
                                styles.wellbeingCard,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    padding: cardPadding,
                                },
                            ]}
                        >
                            <View style={styles.wellbeingRow}>
                                <Text
                                    style={[
                                        styles.wellbeingLabel,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Avg mood
                                </Text>

                                <Text
                                    style={[
                                        styles.wellbeingValue,
                                        { color: colors.textPrimary },
                                    ]}
                                >
                                    {stats.averageScore}/10
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.progressBar,
                                    { backgroundColor: colors.surfaceAlt },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${Math.min(100, Math.max(0, Number(stats.averageScore) * 10))}%` as any,
                                            backgroundColor: colors.primary,
                                        },
                                    ]}
                                />
                            </View>

                            <View style={styles.wellbeingRow}>
                                <Text
                                    style={[
                                        styles.wellbeingLabel,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Dominant mood
                                </Text>

                                <Text
                                    style={[
                                        styles.wellbeingValue,
                                        {
                                            color: colors.textPrimary,
                                            textTransform: "capitalize",
                                        },
                                    ]}
                                >
                                    {stats.dominantMood}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* YOUR SPACE */}
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Your space
                    </Text>

                    <View style={styles.quickRow}>
                        <TouchableOpacity
                            style={[
                                styles.quickCard,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    paddingVertical: cardPadding,
                                },
                            ]}
                            onPress={function () {
                                router.push("/(tabs)/journal");
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.quickEmoji}>📝</Text>
                            <Text
                                style={[
                                    styles.quickTitle,
                                    { color: colors.textPrimary },
                                ]}
                            >
                                Journal
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.quickCard,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    paddingVertical: cardPadding,
                                },
                            ]}
                            onPress={function () {
                                router.push("/(tabs)/goals");
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.quickEmoji}>🎯</Text>
                            <Text
                                style={[
                                    styles.quickTitle,
                                    { color: colors.textPrimary },
                                ]}
                            >
                                Goals
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* INBOX */}
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Inbox
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.inboxRow,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                paddingVertical: cardPadding,
                            },
                        ]}
                        onPress={function () {
                            router.push("/my-circles");
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.inboxEmoji}>🌿</Text>

                        <Text
                            style={[
                                styles.inboxTitle,
                                { color: colors.textPrimary },
                            ]}
                        >
                            My Circles
                        </Text>

                        <Text
                            style={[
                                styles.inboxArrow,
                                { color: colors.textTertiary },
                            ]}
                        >
                            ›
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.inboxRow,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                paddingVertical: cardPadding,
                                marginTop: spacing.sm,
                            },
                        ]}
                        onPress={function () {
                            router.push("/messages");
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.inboxEmoji}>💬</Text>

                        <Text
                            style={[
                                styles.inboxTitle,
                                { color: colors.textPrimary },
                            ]}
                        >
                            Messages
                        </Text>

                        {unreadDMs > 0 && (
                            <View
                                style={[
                                    styles.badge,
                                    { backgroundColor: colors.primary },
                                ]}
                            >
                                <Text style={styles.badgeText}>
                                    {unreadDMs}
                                </Text>
                            </View>
                        )}

                        <Text
                            style={[
                                styles.inboxArrow,
                                { color: colors.textTertiary },
                            ]}
                        >
                            ›
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
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
    container: {
        flex: 1,
    },

    loadingContent: {
        flex: 1,
        justifyContent: "space-evenly",
        gap: spacing.md,
    },

    content: {
        flex: 1,
        justifyContent: "space-between", // 👈 Forces everything to spread evenly and fit the screen
    },

    headerSection: {
        gap: 4,
    },

    greeting: {
        fontWeight: "800",
        letterSpacing: -0.6,
    },

    greetingSub: {
        fontSize: 14,
        fontWeight: "400",
        marginTop: 2,
    },

    section: {
        width: "100%",
    },

    insightCard: {
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        borderLeftWidth: 4,
        borderWidth: 1,
    },

    insightTitle: {
        fontSize: 13,
        fontWeight: "600",
    },

    moodGrid: {
        flexDirection: "row",
        gap: spacing.sm,
    },

    moodCard: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.lg,
        borderWidth: 2,
    },

    moodEmoji: {
        marginBottom: 2,
    },

    moodText: {
        fontSize: 11,
        fontWeight: "700",
    },

    submittedBox: {
        padding: spacing.lg,
        borderRadius: radius.lg,
        alignItems: "center",
    },

    submittedEmoji: {
        fontSize: 28,
        marginBottom: 4,
    },

    submittedText: {
        fontWeight: "600",
        fontSize: 15,
    },

    checkedBox: {
        padding: spacing.lg,
        borderRadius: radius.lg,
        alignItems: "center",
        borderWidth: 1,
    },

    checkedText: {
        fontSize: 14,
        textAlign: "center",
        fontWeight: "500",
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: spacing.xs,
    },

    weekRow: {
        flexDirection: "row",
        gap: spacing.sm,
    },

    weekCard: {
        flex: 1,
        borderRadius: radius.lg,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        ...shadow.sm,
    },

    weekEmoji: {
        fontSize: 20,
        marginBottom: 2,
    },

    weekNumber: {
        fontSize: 20,
        fontWeight: "800",
    },

    weekLabel: {
        fontSize: 10,
        marginTop: 1,
        fontWeight: "500",
    },

    wellbeingCard: {
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.xs,
        ...shadow.sm,
    },

    wellbeingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    wellbeingLabel: {
        fontSize: 13,
    },

    wellbeingValue: {
        fontSize: 14,
        fontWeight: "700",
    },

    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: "hidden",
        marginVertical: 2,
    },

    progressFill: {
        height: "100%",
        borderRadius: 3,
    },

    quickRow: {
        flexDirection: "row",
        gap: spacing.md,
    },

    quickCard: {
        flex: 1,
        borderRadius: radius.lg,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        ...shadow.sm,
    },

    quickEmoji: {
        fontSize: 22,
        marginBottom: 3,
    },

    quickTitle: {
        fontSize: 14,
        fontWeight: "700",
    },

    inboxRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        ...shadow.sm,
    },

    inboxEmoji: {
        fontSize: 20,
    },

    inboxTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
    },

    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },

    badgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700",
    },

    inboxArrow: {
        fontSize: 18,
    },
});