import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { getGoals, createGoal, toggleGoal } from "../../src/api/client";

var FREQUENCIES = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
];

export default function GoalsScreen() {
    var [goals, setGoals] = useState<any[]>([]);
    var [title, setTitle] = useState("");
    var [frequency, setFrequency] = useState("daily");
    var [loading, setLoading] = useState(true);
    var [saving, setSaving] = useState(false);
    var [refreshing, setRefreshing] = useState(false);

    useEffect(function () { loadGoals(); }, []);

    var loadGoals = async function () {
        try {
            var data = await getGoals();
            setGoals(data);
        } catch (e) { }
        setLoading(false);
    };

    var onRefresh = async function () {
        setRefreshing(true);
        await loadGoals();
        setRefreshing(false);
    };

    var handleAdd = async function () {
        if (!title.trim()) return;
        setSaving(true);
        try {
            var goal = await createGoal(title.trim(), frequency);
            setGoals([goal, ...goals]);
            setTitle("");
            setFrequency("daily");
        } catch (e) { }
        setSaving(false);
    };

    var handleToggle = async function (goal: any) {
        try {
            var updated = await toggleGoal(goal.id);
            setGoals(goals.map(function (g: any) { return g.id === goal.id ? updated : g; }));
        } catch (e) {
            console.log("Toggle error:", e);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    var canAdd = title.trim().length > 0 && !saving;
    var completedCount = goals.filter(function (g: any) { return g.completed; }).length;

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.subtitle}>Track what matters to you</Text>

                <View style={styles.card}>
                    <TextInput
                        style={styles.input}
                        placeholder="What do you want to achieve?"
                        placeholderTextColor="#9ca3af"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <View style={styles.frequencyRow}>
                        {FREQUENCIES.map(function (f: any) {
                            var active = frequency === f.id;
                            return (
                                <TouchableOpacity
                                    key={f.id}
                                    onPress={function () { setFrequency(f.id); }}
                                    style={[styles.freqButton, active && styles.freqButtonActive]}
                                >
                                    <Text style={[styles.freqText, active && styles.freqTextActive]}>{f.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, !canAdd && styles.buttonDisabled]}
                        onPress={handleAdd}
                        disabled={!canAdd}
                    >
                        <Text style={styles.buttonText}>{saving ? "Adding..." : "Add Goal"}</Text>
                    </TouchableOpacity>
                </View>

                {goals.length > 0 && (
                    <View style={styles.progressCard}>
                        <Text style={styles.progressText}>
                            <Text style={styles.progressNumber}>{completedCount}</Text> of <Text style={styles.progressNumber}>{goals.length}</Text> completed
                        </Text>
                    </View>
                )}

                <Text style={styles.sectionTitle}>Your Goals</Text>

                {goals.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyEmoji}>🎯</Text>
                        <Text style={styles.emptyText}>No goals yet</Text>
                        <Text style={styles.emptySubtext}>Set your first one above to start tracking progress.</Text>
                    </View>
                ) : (
                    goals.map(function (goal: any) {
                        return (
                            <TouchableOpacity
                                key={goal.id}
                                style={styles.goalCard}
                                onPress={function () { handleToggle(goal); }}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, goal.completed && styles.checkboxDone]}>
                                    {goal.completed && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <View style={styles.goalContent}>
                                    <Text style={[styles.goalText, goal.completed && styles.goalCompleted]}>{goal.title}</Text>
                                    <Text style={styles.goalFreq}>{goal.frequency}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8faf9" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8faf9" },
    content: { padding: 16, gap: 14, paddingBottom: 32 },
    subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 2 },
    card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb" },
    input: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", marginBottom: 12 },
    frequencyRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
    freqButton: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
    freqButtonActive: { backgroundColor: "#ecfdf5", borderColor: "#059669" },
    freqText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
    freqTextActive: { color: "#059669", fontWeight: "600" },
    button: { backgroundColor: "#059669", borderRadius: 12, padding: 14, alignItems: "center" },
    buttonDisabled: { opacity: 0.4 },
    buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
    progressCard: { backgroundColor: "#ecfdf5", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#a7f3d0" },
    progressText: { fontSize: 13, color: "#065f46" },
    progressNumber: { fontWeight: "700", fontSize: 15 },
    sectionTitle: { fontSize: 13, fontWeight: "600", color: "#6b7280", marginTop: 8, marginBottom: 2 },
    emptyBox: { backgroundColor: "#fff", borderRadius: 16, padding: 32, alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb" },
    emptyEmoji: { fontSize: 32, marginBottom: 8 },
    emptyText: { color: "#111827", fontSize: 15, fontWeight: "600", marginBottom: 4 },
    emptySubtext: { color: "#6b7280", fontSize: 13, textAlign: "center" },
    goalCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e5e7eb", flexDirection: "row", alignItems: "center", gap: 12 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#d1d5db", justifyContent: "center", alignItems: "center" },
    checkboxDone: { backgroundColor: "#059669", borderColor: "#059669" },
    checkmark: { color: "#fff", fontSize: 14, fontWeight: "700" },
    goalContent: { flex: 1 },
    goalText: { fontSize: 15, color: "#111827", fontWeight: "500" },
    goalCompleted: { textDecorationLine: "line-through", color: "#9ca3af" },
    goalFreq: { fontSize: 11, color: "#9ca3af", marginTop: 3, textTransform: "capitalize" },
});