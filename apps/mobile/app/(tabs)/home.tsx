import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useAuthStore } from "../../src/store/authStore";
import { submitMood, getMoodStats, getMoodToday, getInsights } from "../../src/api/client";

var moodOptions = [
    { emoji: "🟢", label: "thriving", text: "Thriving", score: 9 },
    { emoji: "🟡", label: "managing", text: "Managing", score: 6 },
    { emoji: "🟠", label: "struggling", text: "Struggling", score: 3 },
    { emoji: "🔴", label: "crisis", text: "Crisis", score: 1 },
];

export default function HomeScreen() {
    var { user } = useAuthStore();
    var [selectedMood, setSelectedMood] = useState<any>(null);
    var [submitted, setSubmitted] = useState(false);
    var [checkedToday, setCheckedToday] = useState(false);
    var [stats, setStats] = useState<any>(null);
    var [insight, setInsight] = useState<any>(null);
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
        try {
            await submitMood(mood.score, mood.label);
            setSubmitted(true);
            setCheckedToday(true);
            setTimeout(function () { setSubmitted(false); setSelectedMood(null); }, 3000);
        } catch (e) { }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
            >
                <Text style={styles.greeting}>Good {getTimeOfDay()}, {user?.name?.split(" ")[0] || "Friend"} 👋</Text>

                {insight && (
                    <View style={[styles.card, styles.insightCard]}>
                        <Text style={styles.cardTitle}>💡 {insight.title}</Text>
                        <Text style={styles.insightText}>{insight.description}</Text>
                    </View>
                )}

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🧠 How are you feeling today?</Text>
                    {submitted ? (
                        <View style={styles.submittedBox}>
                            <Text style={styles.submittedText}>✅ Thanks for checking in!</Text>
                        </View>
                    ) : checkedToday ? (
                        <View style={styles.submittedBox}>
                            <Text style={{ color: "#6b7280", fontSize: 14 }}>You've already checked in today!</Text>
                        </View>
                    ) : (
                        <View style={styles.moodRow}>
                            {moodOptions.map(function (mood: any) {
                                var isSelected = selectedMood?.label === mood.label;
                                return (
                                    <TouchableOpacity
                                        key={mood.label}
                                        onPress={function () { handleMoodSubmit(mood); }}
                                        style={[styles.moodButton, isSelected && styles.moodSelected]}
                                    >
                                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                        <Text style={[styles.moodText, isSelected && styles.moodTextSelected]}>{mood.text}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                {stats && stats.totalEntries > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>📊 Your Progress</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{stats.averageScore}</Text>
                                <Text style={styles.statLabel}>Avg Mood</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{stats.totalEntries}</Text>
                                <Text style={styles.statLabel}>Check-ins</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{stats.streak}</Text>
                                <Text style={styles.statLabel}>Streak</Text>
                            </View>
                        </View>
                    </View>
                )}
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
    container: { flex: 1, backgroundColor: "#f8faf9" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8faf9" },
    content: { padding: 16, gap: 14 },
    greeting: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 4 },
    card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb" },
    cardTitle: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 12 },
    moodRow: { flexDirection: "row", gap: 8 },
    moodButton: { flex: 1, alignItems: "center", padding: 10, borderRadius: 12, borderWidth: 2, borderColor: "#e5e7eb" },
    moodSelected: { borderColor: "#059669", backgroundColor: "#ecfdf5" },
    moodEmoji: { fontSize: 28, marginBottom: 4 },
    moodText: { fontSize: 11, color: "#6b7280", fontWeight: "500" },
    moodTextSelected: { color: "#059669" },
    submittedBox: { backgroundColor: "#ecfdf5", padding: 14, borderRadius: 12, alignItems: "center" },
    submittedText: { color: "#059669", fontWeight: "600", fontSize: 14 },
    insightCard: { borderLeftWidth: 4, borderLeftColor: "#059669" },
    insightText: { fontSize: 14, color: "#374151", lineHeight: 20 },
    statsRow: { flexDirection: "row", gap: 8 },
    statBox: { flex: 1, backgroundColor: "#f9fafb", borderRadius: 10, padding: 12, alignItems: "center" },
    statNumber: { fontSize: 20, fontWeight: "700", color: "#059669" },
    statLabel: { fontSize: 10, color: "#6b7280", marginTop: 2 },
});