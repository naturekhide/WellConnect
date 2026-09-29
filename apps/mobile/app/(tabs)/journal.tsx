import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, RefreshControl } from "react-native";
import { getJournal, saveJournal } from "../../src/api/client";
import { Button, EmptyState, Skeleton } from "../../src/components";
import { useColors, spacing, radius, shadow } from "../../src/theme";

export default function JournalScreen() {
    var colors = useColors();
    var [entries, setEntries] = useState<any[]>([]);
    var [content, setContent] = useState("");
    var [loading, setLoading] = useState(true);
    var [saving, setSaving] = useState(false);
    var [refreshing, setRefreshing] = useState(false);

    useEffect(function () { loadEntries(); }, []);

    var loadEntries = async function () {
        try {
            var data = await getJournal();
            setEntries(data);
        } catch (e) { }
        setLoading(false);
    };

    var onRefresh = async function () {
        setRefreshing(true);
        await loadEntries();
        setRefreshing(false);
    };

    var handleSave = async function () {
        if (!content.trim()) return;
        setSaving(true);
        try {
            var entry = await saveJournal(content.trim());
            setEntries([entry, ...entries]);
            setContent("");
        } catch (e) { }
        setSaving(false);
    };

    var getSentimentEmoji = function (sentiment: string | null) {
        if (sentiment === "positive") return "🟢";
        if (sentiment === "low") return "🟠";
        return "⚪";
    };

    var formatDate = function (d: string) {
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.content}>
                    <Skeleton width={180} height={28} />
                    <Skeleton width={220} height={16} style={{ marginTop: 8 }} />
                    <Skeleton width="100%" height={180} style={{ marginTop: 16 }} />
                    <Skeleton width={120} height={14} style={{ marginTop: 16 }} />
                    <Skeleton width="100%" height={80} style={{ marginTop: 8 }} />
                    <Skeleton width="100%" height={80} style={{ marginTop: 8 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={[styles.title, { color: colors.textPrimary }]}>💭 Your thoughts</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Private. Just you and your words.</Text>

                <View style={[styles.composerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary }]}
                        placeholder="What's on your mind today?"
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        value={content}
                        onChangeText={setContent}
                        textAlignVertical="top"
                    />
                    <View style={{ marginTop: spacing.md }}>
                        <Button label={saving ? "Saving..." : "Save Entry"} onPress={handleSave} loading={saving} disabled={!content.trim()} />
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Previous entries</Text>

                {entries.length === 0 ? (
                    <EmptyState emoji="📝" title="No entries yet" subtitle="Start writing — your thoughts are safe here." />
                ) : (
                    entries.map(function (entry: any) {
                        return (
                            <View key={entry.id} style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryEmoji}>{getSentimentEmoji(entry.sentiment)}</Text>
                                    <Text style={[styles.entryDate, { color: colors.textTertiary }]}>{formatDate(entry.createdAt)}</Text>
                                </View>
                                <Text style={[styles.entryText, { color: colors.textPrimary }]}>{entry.content}</Text>
                            </View>
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
        ...shadow.sm,
    },
    textArea: {
        borderRadius: radius.md,
        padding: spacing.md,
        fontSize: 15,
        minHeight: 130,
    },
    sectionTitle: { fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
    entryCard: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        ...shadow.sm,
    },
    entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
    entryEmoji: { fontSize: 14 },
    entryDate: { fontSize: 11 },
    entryText: { fontSize: 14, lineHeight: 20 },
});