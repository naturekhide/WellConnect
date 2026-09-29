import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { getGoals, createGoal, toggleGoal } from "../../src/api/client";
import { Button, EmptyState, Skeleton } from "../../src/components";
import { tapLight } from "../../src/haptics";
import { useColors, spacing, radius, shadow } from "../../src/theme";

var FREQUENCIES = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
];

export default function GoalsScreen() {
    var colors = useColors();
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
        tapLight();
        try {
            var updated = await toggleGoal(goal.id);
            setGoals(goals.map(function (g: any) { return g.id === goal.id ? updated : g; }));
        } catch (e) { }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.content}>
                    <Skeleton width={160} height={28} />
                    <Skeleton width={200} height={16} style={{ marginTop: 8 }} />
                    <Skeleton width="100%" height={190} style={{ marginTop: 16 }} />
                    <Skeleton width={120} height={14} style={{ marginTop: 16 }} />
                    <Skeleton width="100%" height={70} style={{ marginTop: 8 }} />
                    <Skeleton width="100%" height={70} style={{ marginTop: 8 }} />
                </View>
            </View>
        );
    }

    var completedCount = goals.filter(function (g: any) { return g.completed; }).length;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={[styles.title, { color: colors.textPrimary }]}>🎯 Your goals</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Small steps. Real progress.</Text>

                <View style={[styles.composerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary }]}
                        placeholder="What do you want to achieve?"
                        placeholderTextColor={colors.textTertiary}
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
                                    style={[
                                        styles.freqButton,
                                        { borderColor: colors.border },
                                        active && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                                    ]}
                                >
                                    <Text style={[styles.freqText, { color: colors.textSecondary }, active && { color: colors.primary, fontWeight: "600" }]}>
                                        {f.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Button label={saving ? "Adding..." : "Add Goal"} onPress={handleAdd} loading={saving} disabled={!title.trim()} />
                </View>

                {goals.length > 0 && (
                    <View style={[styles.progressCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                        <Text style={{ fontSize: 14 }}>
                            <Text style={{ fontWeight: "700", fontSize: 16, color: colors.primary }}>{completedCount}</Text>
                            <Text style={{ color: colors.primary, fontSize: 14 }}> of </Text>
                            <Text style={{ fontWeight: "700", fontSize: 16, color: colors.primary }}>{goals.length}</Text>
                            <Text style={{ color: colors.primary, fontSize: 14 }}> completed</Text>
                        </Text>
                    </View>
                )}

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Active goals</Text>

                {goals.length === 0 ? (
                    <EmptyState emoji="🎯" title="No goals yet" subtitle="Set your first one above to start tracking progress." />
                ) : (
                    goals.map(function (goal: any) {
                        return (
                            <TouchableOpacity
                                key={goal.id}
                                style={[styles.goalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={function () { handleToggle(goal); }}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        { borderColor: colors.textTertiary },
                                        goal.completed && { backgroundColor: colors.primary, borderColor: colors.primary },
                                    ]}
                                >
                                    {goal.completed && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <View style={styles.goalContent}>
                                    <Text
                                        style={[
                                            styles.goalText,
                                            { color: colors.textPrimary },
                                            goal.completed && { textDecorationLine: "line-through", color: colors.textTertiary },
                                        ]}
                                    >
                                        {goal.title}
                                    </Text>
                                    <Text style={[styles.goalFreq, { color: colors.textTertiary }]}>{goal.frequency}</Text>
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
    container: { flex: 1 },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    title: { fontSize: 24, fontWeight: "700" },
    subtitle: { fontSize: 14, marginBottom: spacing.sm },
    composerCard: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        gap: spacing.md,
        ...shadow.sm,
    },
    input: {
        borderRadius: radius.md,
        padding: spacing.md,
        fontSize: 15,
    },
    frequencyRow: { flexDirection: "row", gap: spacing.sm },
    freqButton: {
        flex: 1,
        padding: spacing.sm + 2,
        borderRadius: radius.md,
        borderWidth: 1,
        alignItems: "center",
    },
    freqText: { fontSize: 13, fontWeight: "500" },
    progressCard: {
        borderRadius: radius.lg,
        padding: spacing.md,
        alignItems: "center",
        borderWidth: 1,
    },
    sectionTitle: { fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
    goalCard: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        ...shadow.sm,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 7,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    checkmark: { color: "#fff", fontSize: 14, fontWeight: "700" },
    goalContent: { flex: 1 },
    goalText: { fontSize: 15, fontWeight: "500" },
    goalFreq: { fontSize: 11, marginTop: 3, textTransform: "capitalize" },
});