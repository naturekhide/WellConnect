import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { getJournal, saveJournal } from "../../src/api/client";

export default function JournalScreen() {
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

    var formatDate = function (d: string) {
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
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
                <Text style={styles.subtitle}>Private. Just you and your thoughts.</Text>

                <View style={styles.card}>
                    <TextInput
                        style={styles.textArea}
                        placeholder="What's on your mind today?"
                        placeholderTextColor="#9ca3af"
                        multiline
                        value={content}
                        onChangeText={setContent}
                        textAlignVertical="top"
                    />
                    <TouchableOpacity
                        style={[styles.button, !content.trim() && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={!content.trim() || saving}
                    >
                        <Text style={styles.buttonText}>{saving ? "Saving..." : "Save Entry"}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Previous Entries</Text>

                {entries.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>No entries yet. Start writing!</Text>
                    </View>
                ) : (
                    entries.map(function (entry: any) {
                        return (
                            <View key={entry.id} style={styles.entryCard}>
                                <Text style={styles.entryText}>{entry.content}</Text>
                                <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
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
    textArea: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", minHeight: 120, marginBottom: 12 },
    button: { backgroundColor: "#059669", borderRadius: 12, padding: 14, alignItems: "center" },
    buttonDisabled: { opacity: 0.4 },
    buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
    sectionTitle: { fontSize: 15, fontWeight: "600", color: "#111827", marginTop: 8 },
    emptyBox: { backgroundColor: "#fff", borderRadius: 16, padding: 32, alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb" },
    emptyText: { color: "#9ca3af", fontSize: 14 },
    entryCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e5e7eb" },
    entryText: { fontSize: 14, color: "#374151", lineHeight: 20 },
    entryDate: { fontSize: 11, color: "#9ca3af", marginTop: 8 },
});