import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { createCircle } from "../../src/api/client";
import { useColors, spacing, radius } from "../../src/theme";

var EMOJI_CHOICES = ["🌿", "🧠", "💚", "🌱", "☀️", "🌙", "📚", "🎯", "🎨", "🏃", "💪", "🧘", "🍃", "✨", "🔥", "🌊"];
var COLOR_CHOICES = ["#059669", "#10b981", "#14b8a6", "#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444"];

export default function CreateCircleScreen() {
    var router = useRouter();
    var colors = useColors();

    var [name, setName] = useState("");
    var [description, setDescription] = useState("");
    var [emoji, setEmoji] = useState("🌿");
    var [coverColor, setCoverColor] = useState("#059669");
    var [isPrivate, setIsPrivate] = useState(false);
    var [creating, setCreating] = useState(false);

    var canCreate = name.trim().length >= 3 && !creating;

    var handleCreate = async function () {
        if (!canCreate) return;
        setCreating(true);

        try {
            var circle = await createCircle(name.trim(), description.trim(), emoji, coverColor, isPrivate);
            router.replace("/circles/" + circle.id);
        } catch (e: any) {
            Alert.alert("Failed", e.message || "Could not create circle");
        }
        setCreating(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={function () { router.back(); }}>
                    <Text style={{ fontSize: 15, fontWeight: "500", color: colors.textSecondary }}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Create a Circle</Text>
                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={!canCreate}
                    style={[styles.createBtn, { backgroundColor: canCreate ? colors.primary : colors.border }]}
                >
                    <Text style={[styles.createBtnText, { color: canCreate ? "#fff" : colors.textTertiary }]}>
                        {creating ? "..." : "Create"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.preview, { backgroundColor: colors.surface }]}>
                    <View style={[styles.previewEmoji, { backgroundColor: coverColor }]}>
                        <Text style={{ fontSize: 28 }}>{emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.previewName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {name.trim() || "Circle name"}
                        </Text>
                        <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>
                            {isPrivate ? "🔒 Private" : "🌍 Public"} · 1 member
                        </Text>
                    </View>
                </View>

                <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Mindful Mornings"
                    placeholderTextColor={colors.textTertiary}
                    maxLength={50}
                />

                <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
                <TextInput
                    style={[styles.textarea, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What is this circle about?"
                    placeholderTextColor={colors.textTertiary}
                    maxLength={200}
                    multiline
                    numberOfLines={3}
                />

                <Text style={[styles.label, { color: colors.textSecondary }]}>Emoji</Text>
                <View style={styles.grid}>
                    {EMOJI_CHOICES.map(function (e) {
                        var active = emoji === e;
                        return (
                            <TouchableOpacity
                                key={e}
                                onPress={function () { setEmoji(e); }}
                                style={[
                                    styles.emojiBtn,
                                    { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryLight : colors.surface },
                                ]}
                            >
                                <Text style={{ fontSize: 20 }}>{e}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
                <View style={styles.grid}>
                    {COLOR_CHOICES.map(function (c) {
                        var active = coverColor === c;
                        return (
                            <TouchableOpacity
                                key={c}
                                onPress={function () { setCoverColor(c); }}
                                style={[
                                    styles.colorBtn,
                                    { backgroundColor: c, borderWidth: active ? 3 : 0, borderColor: colors.textPrimary },
                                ]}
                            />
                        );
                    })}
                </View>

                <TouchableOpacity
                    onPress={function () { setIsPrivate(!isPrivate); }}
                    style={[styles.privacyRow, { backgroundColor: colors.surface }]}
                >
                    <View style={[styles.toggle, { backgroundColor: isPrivate ? colors.primary : colors.border }]}>
                        <View style={[styles.toggleDot, { left: isPrivate ? 22 : 2 }]} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.privacyTitle, { color: colors.textPrimary }]}>
                            {isPrivate ? "Private circle" : "Public circle"}
                        </Text>
                        <Text style={[styles.privacySub, { color: colors.textSecondary }]}>
                            {isPrivate ? "People must request to join." : "Anyone can join instantly."}
                        </Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, borderBottomWidth: 1,
    },
    title: { fontSize: 16, fontWeight: "700" },
    createBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full },
    createBtnText: { fontSize: 14, fontWeight: "600" },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    preview: {
        flexDirection: "row", alignItems: "center", gap: spacing.md,
        padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.lg,
    },
    previewEmoji: {
        width: 56, height: 56, borderRadius: radius.md,
        alignItems: "center", justifyContent: "center",
    },
    previewName: { fontSize: 16, fontWeight: "700" },
    previewMeta: { fontSize: 12, marginTop: 2 },
    label: { fontSize: 12, marginBottom: spacing.xs, marginTop: spacing.md },
    input: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, fontSize: 15 },
    textarea: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, fontSize: 14, minHeight: 80, textAlignVertical: "top" },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    emojiBtn: { width: 40, height: 40, borderRadius: radius.md, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    colorBtn: { width: 40, height: 40, borderRadius: 20 },
    privacyRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.lg },
    toggle: { width: 48, height: 28, borderRadius: 14, position: "relative" },
    toggleDot: { position: "absolute", top: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff" },
    privacyTitle: { fontSize: 14, fontWeight: "600" },
    privacySub: { fontSize: 12, marginTop: 2 },
});