import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useColors, spacing, radius, shadow } from "../../src/theme";
import { createFeedPost, uploadImages } from "../../src/api/client";

var MAX_CHARS = 500;
var MAX_IMAGES = 4;

export default function NewFeedPostScreen() {
    var router = useRouter();
    var colors = useColors();
    var [content, setContent] = useState("");
    var [images, setImages] = useState<string[]>([]);
    var [anonymous, setAnonymous] = useState(false);
    var [posting, setPosting] = useState(false);

    var handlePickImage = async function () {
        if (images.length >= MAX_IMAGES) {
            Alert.alert("Maximum " + MAX_IMAGES + " images");
            return;
        }

        var result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            selectionLimit: MAX_IMAGES - images.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            var prepared: string[] = [];

            for (var i = 0; i < result.assets.length; i++) {
                var asset = result.assets[i];
                try {
                    var manipulated = await ImageManipulator.manipulateAsync(
                        asset.uri,
                        [{ resize: { width: 1024 } }],
                        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
                    );
                    prepared.push(manipulated.uri);
                } catch (e) {
                    prepared.push(asset.uri);
                }
            }

            setImages(images.concat(prepared).slice(0, MAX_IMAGES));
        }
    };

    var handleRemoveImage = function (index: number) {
        setImages(images.filter(function (_: any, i: number) { return i !== index; }));
    };

    var handlePost = async function () {
        if (!content.trim()) return;
        setPosting(true);

        try {
            var uploadedUrls: string[] = [];

            if (images.length > 0) {
                var uploadResult = await uploadImages(images);
                uploadedUrls = uploadResult.urls || [];
            }

            await createFeedPost(content.trim(), uploadedUrls, anonymous);

            router.back();
        } catch (e: any) {
            Alert.alert("Failed to post", e.message || "Try again");
        }

        setPosting(false);
    };

    var remaining = MAX_CHARS - content.length;
    var canPost = content.trim().length > 0 && remaining >= 0 && !posting;

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={styles.backButton}>
                    <Text style={[styles.backText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Share a Moment</Text>
                <TouchableOpacity
                    onPress={handlePost}
                    disabled={!canPost}
                    style={[styles.postButton, { backgroundColor: canPost ? colors.primary : colors.border }]}
                >
                    <Text style={[styles.postButtonText, { color: canPost ? "#fff" : colors.textTertiary }]}>
                        {posting ? "Posting..." : "Post"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="What's on your mind?"
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    value={content}
                    onChangeText={setContent}
                    maxLength={MAX_CHARS + 50}
                    autoFocus
                    textAlignVertical="top"
                />

                {images.length > 0 && (
                    <View style={styles.imageGrid}>
                        {images.map(function (uri: string, i: number) {
                            return (
                                <View key={i} style={styles.imageWrapper}>
                                    <Image source={{ uri: uri }} style={styles.imageThumb} />
                                    <TouchableOpacity
                                        style={styles.imageRemove}
                                        onPress={function () { handleRemoveImage(i); }}
                                    >
                                        <Text style={styles.imageRemoveText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={styles.toolbar}>
                    <TouchableOpacity
                        style={[styles.toolButton, { borderColor: colors.border }]}
                        onPress={handlePickImage}
                        disabled={images.length >= MAX_IMAGES}
                    >
                        <Text style={styles.toolEmoji}>📷</Text>
                        <Text style={[styles.toolText, { color: colors.textSecondary }]}>
                            {images.length}/{MAX_IMAGES}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toolButton, { borderColor: colors.border }, anonymous && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                        onPress={function () { setAnonymous(!anonymous); }}
                    >
                        <Text style={styles.toolEmoji}>🎭</Text>
                        <Text style={[styles.toolText, { color: anonymous ? colors.primary : colors.textSecondary }]}>
                            {anonymous ? "Anonymous" : "Public"}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.charCounter}>
                        <Text style={[styles.charText, { color: remaining < 50 ? colors.danger : colors.textTertiary }]}>
                            {remaining}
                        </Text>
                    </View>
                </View>

                {anonymous && (
                    <View style={[styles.noteBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                        <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                            🎭 Your name and username won't be shown on this post.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.lg,
        paddingTop: 60,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    backButton: { paddingVertical: spacing.sm, paddingRight: spacing.md },
    backText: { fontSize: 15, fontWeight: "500" },
    title: { fontSize: 16, fontWeight: "700" },
    postButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full },
    postButtonText: { fontSize: 14, fontWeight: "600" },
    content: { padding: spacing.lg, gap: spacing.md },
    input: { fontSize: 18, lineHeight: 24, minHeight: 120, paddingTop: spacing.sm },
    imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    imageWrapper: { position: "relative", width: "48%" },
    imageThumb: { width: "100%", height: 140, borderRadius: radius.md },
    imageRemove: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: "rgba(0,0,0,0.7)",
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    imageRemoveText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    toolbar: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm },
    toolButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
    toolEmoji: { fontSize: 16 },
    toolText: { fontSize: 13, fontWeight: "500" },
    charCounter: { marginLeft: "auto" },
    charText: { fontSize: 14, fontWeight: "600" },
    noteBox: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
    noteText: { fontSize: 12, lineHeight: 17 },
});