import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useColors, spacing, radius } from "../../src/theme";
import { createFeedPost, uploadImages } from "../../src/api/client";

export default function ComposeMomentScreen() {
    var colors = useColors();
    var router = useRouter();

    var [content, setContent] = useState("");
    var [images, setImages] = useState<string[]>([]);
    var [anonymous, setAnonymous] = useState(false);
    var [posting, setPosting] = useState(false);

    var handlePickImage = async function () {
        var result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 4 - images.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            var newUris = result.assets.map(function (asset: any) { return asset.uri; });
            setImages(images.concat(newUris).slice(0, 4));
        }
    };

    var handleRemoveImage = function (index: number) {
        setImages(images.filter(function (_: any, i: number) { return i !== index; }));
    };

    var handlePost = async function () {
        if (!content.trim() && images.length === 0) return;
        setPosting(true);

        try {
            var urls: string[] = [];
            if (images.length > 0) {
                var uploadResult = await uploadImages(images);
                urls = uploadResult.urls || [];
            }

            await createFeedPost(content.trim(), urls, anonymous, null);
            router.back(); // Go back to the feed
        } catch (e: any) {
            Alert.alert("Failed to post", e.message);
        }
        setPosting(false);
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={{ padding: spacing.sm }}>
                    <Text style={{ fontSize: 15, color: colors.textSecondary, fontWeight: "500" }}>Cancel</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.textPrimary }}>Share a Moment</Text>
                <TouchableOpacity
                    onPress={handlePost}
                    disabled={posting || (!content.trim() && images.length === 0)}
                    style={[styles.postBtn, { backgroundColor: (content.trim() || images.length > 0) ? colors.primary : colors.border }]}
                >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
                        {posting ? "..." : "Post"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
                <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="What's on your mind?"
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    value={content}
                    onChangeText={setContent}
                    maxLength={500}
                    autoFocus
                />

                {/* Image Previews */}
                {images.length > 0 && (
                    <View style={styles.imageGrid}>
                        {images.map(function (uri: string, i: number) {
                            return (
                                <View key={i} style={styles.imageWrapper}>
                                    <Image source={{ uri: uri }} style={styles.imageThumb} />
                                    <TouchableOpacity style={styles.imageRemove} onPress={function () { handleRemoveImage(i); }}>
                                        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={handlePickImage}
                        disabled={images.length >= 4}
                        style={[styles.actionBtn, { borderColor: colors.border }]}
                    >
                        <Text style={{ fontSize: 16 }}>📷</Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: "500" }}>{images.length}/4</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={function () { setAnonymous(!anonymous); }}
                        style={[styles.actionBtn, { borderColor: anonymous ? colors.primary : colors.border, backgroundColor: anonymous ? colors.primaryLight : "transparent" }]}
                    >
                        <Text style={{ fontSize: 16 }}>🎭</Text>
                        <Text style={{ fontSize: 13, color: anonymous ? colors.primary : colors.textSecondary, fontWeight: "500" }}>
                            {anonymous ? "Anonymous" : "Public"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, borderBottomWidth: 1 },
    postBtn: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full },
    input: { fontSize: 18, lineHeight: 26, minHeight: 120, textAlignVertical: "top" },
    imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.lg },
    imageWrapper: { width: "48%", position: "relative" },
    imageThumb: { width: "100%", height: 120, borderRadius: radius.md },
    imageRemove: { position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.7)", width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
});