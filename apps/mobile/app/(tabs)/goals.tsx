import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { getGoals, createGoal } from "../../src/api/client";

export default function GoalsScreen() {
    var [goals, setGoals] = useState<any[]>([]);
    var [title, setTitle] = useState("");
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
            var goal = await createGoal(title.trim(), "daily");
            setGoals([goal, ...goals]);
            setTitle("");
        } catch (e) { }
        setSaving(false);
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
                <Text style={styles.subtitle}>Track what matters to you</Text>

                <View style={styles.card}>
                    <TextInput
                        style={styles.input}
                        placeholder="What do you want to achieve?"
                        placeholderTextColor="#9ca3af"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TouchableOpacity
                        style={[styles.button, !title.trim() && styles.buttonDisabled]}
                        onPress={handleAdd}
                        disabled={!title.trim() || saving}
                    >
                        <Text style={styles.buttonText}>{saving ? "Adding..." : "Add Goal"}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Your Goals</Text>

                {goals.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>No goals yet. Set your first one!</Text>
                    </View>
                ) : (
                    goals.map(function (goal: any) {
                        return (
                            <View key={goal.id} style={styles.goalCard}>
                                <Text style={[styles.goalText, goal.completed && styles.goalCompleted]}>{goal.title}</Text>
                                <Text style={styles.goalFreq}>{goal.frequency}</Text>
                            </View>
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
    content: { padding: 16, gap: 14 },
    subtitle: { fontSize: 14, color: "#6b7280" },
    card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb" },
    input: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", marginBottom: 12 },
    button: { backgroundColor: "#059669", borderRadius: 12, padding: 14, alignItems: "center" },
    buttonDisabled: { opacity: 0.4 },
    buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
    sectionTitle: { fontSize: 15, fontWeight: "600", color: "#111827", marginTop: 8 },
    emptyBox: { backgroundColor: "#fff", borderRadius: 16, padding: 32, alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb" },
    emptyText: { color: "#9ca3af", fontSize: 14 },
    goalCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e5e7eb" },
    goalText: { fontSize: 15, color: "#111827", fontWeight: "500" },
    goalCompleted: { textDecorationLine: "line-through", color: "#9ca3af" },
    goalFreq: { fontSize: 12, color: "#9ca3af", marginTop: 4, textTransform: "capitalize" },
});