import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getFeedPost, replyToPost, reactToPost } from "../../src/api/client";
import { useColors, spacing, radius } from "../../src/theme";

var REACTIONS = [
    { type: "hug", emoji: "🤗" },
    { type: "growth", emoji: "🌱" },
    { type: "strength", emoji: "💪" },
    { type: "grateful", emoji: "🙏" },
];

var IMAGE_BASE = "https://well-connect-web.vercel.app";

export default function FeedPostDetail() {
    var router = useRouter();
    var params = useLocalSearchParams();
    var postId = params.id as string;
    var colors = useColors();
    var [post, setPost] = useState<any>(null);
    var [loading, setLoading] = useState(true);
    var [replyText, setReplyText] = useState("");
    var [replying, setReplying] = useState(false);
    var [anonymousReply, setAnonymousReply] = useState(false);
    var [myReaction, setMyReaction] = useState<string | null>(null);
    var [reactions, setReactions] = useState<any>({});

    useEffect(
        function () {
            load();
        },
        [postId]
    );

    var load = async function () {
        try {
            var data = await getFeedPost(postId);
            setPost(data);
            setMyReaction(data.myReaction);
            setReactions(data.reactions);
        } catch (e) { }
        setLoading(false);
    };

    var handleReact = async function (type: string) {
        try {
            var res = await reactToPost(postId, type);
            setReactions(res.reactions);
            setMyReaction(res.myReaction);
        } catch (e) { }
    };

    var handleReply = async function () {
        if (!replyText.trim()) return;
        setReplying(true);
        try {
            var newReply = await replyToPost(postId, replyText.trim(), anonymousReply);
            setPost({ ...post, replies: (post.replies || []).concat([newReply]) });
            setReplyText("");
        } catch (e: any) {
            Alert.alert("Failed", e.message);
        }
        setReplying(false);
    };

    var timeAgo = function (d: string) {
        var diff = Date.now() - new Date(d).getTime();
        var mins = Math.floor(diff / 60000);
        var hrs = Math.floor(diff / 3600000);
        var days = Math.floor(diff / 86400000);
        if (mins < 1) return "now";
        if (mins < 60) return mins + "m";
        if (hrs < 24) return hrs + "h";
        return days + "d";
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textSecondary }}>Post not found</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View
                style={[
                    styles.topBar,
                    {
                        borderBottomColor: colors.border,
                        backgroundColor: colors.background,
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={function () {
                        router.back();
                    }}
                    style={styles.backBtn}
                >
                    <Text style={[styles.backText, { color: colors.textPrimary }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.topTitle, { color: colors.textPrimary }]}>
                    Moment
                </Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <View
                    style={[styles.postBlock, { borderBottomColor: colors.border }]}
                >
                    <View style={styles.postHeader}>
                        <View
                            style={[
                                styles.avatar,
                                {
                                    backgroundColor: post.anonymous
                                        ? colors.surfaceAlt
                                        : colors.primary,
                                    borderColor: post.anonymous ? colors.border : "transparent",
                                    borderWidth: post.anonymous ? 1 : 0,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.avatarText,
                                    { color: post.anonymous ? colors.textSecondary : "#fff" },
                                ]}
                            >
                                {post.anonymous
                                    ? "🎭"
                                    : post.author?.name?.charAt(0) || "U"}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={styles.nameRow}>
                                <Text style={[styles.name, { color: colors.textPrimary }]}>
                                    {post.anonymous ? "Anonymous" : post.author?.name || "User"}
                                </Text>
                                {!post.anonymous && post.author?.username && (
                                    <Text
                                        style={[styles.username, { color: colors.textSecondary }]}
                                    >
                                        @{post.author.username}
                                    </Text>
                                )}
                                {post.anonymous && (
                                    <Text
                                        style={[
                                            styles.anonBadge,
                                            { color: colors.primary, borderColor: colors.primary },
                                        ]}
                                    >
                                        anonymous
                                    </Text>
                                )}
                            </View>
                            <Text style={[styles.time, { color: colors.textTertiary }]}>
                                {timeAgo(post.createdAt)}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.postText, { color: colors.textPrimary }]}>
                        {post.content}
                    </Text>

                    {post.imageUrls && post.imageUrls.length > 0 && (
                        <View style={styles.imageWrap}>
                            {post.imageUrls.map(function (url: string, i: number) {
                                return (
                                    <Image
                                        key={i}
                                        source={{ uri: IMAGE_BASE + url }}
                                        style={[styles.image, { borderColor: colors.border }]}
                                        resizeMode="cover"
                                    />
                                );
                            })}
                        </View>
                    )}

                    <View style={[styles.actions, { borderTopColor: colors.border }]}>
                        {REACTIONS.map(function (r: any) {
                            var isActive = myReaction === r.type;
                            var count = (reactions && reactions[r.type]) || 0;
                            return (
                                <TouchableOpacity
                                    key={r.type}
                                    style={[
                                        styles.actionBtn,
                                        isActive && { backgroundColor: colors.primaryLight },
                                    ]}
                                    onPress={function () {
                                        handleReact(r.type);
                                    }}
                                >
                                    <Text style={styles.actionEmoji}>{r.emoji}</Text>
                                    {count > 0 && (
                                        <Text
                                            style={[
                                                styles.actionCount,
                                                {
                                                    color: isActive ? colors.primary : colors.textSecondary,
                                                },
                                            ]}
                                        >
                                            {count}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    {(post.replies || []).length}{" "}
                    {(post.replies || []).length === 1 ? "reply" : "replies"}
                </Text>

                {(post.replies || []).map(function (reply: any) {
                    return (
                        <View
                            key={reply.id}
                            style={[styles.replyBlock, { borderBottomColor: colors.border }]}
                        >
                            <View style={styles.replyHeader}>
                                <View
                                    style={[
                                        styles.replyAvatar,
                                        {
                                            backgroundColor: reply.anonymous
                                                ? colors.surfaceAlt
                                                : colors.primary,
                                            borderColor: reply.anonymous
                                                ? colors.border
                                                : "transparent",
                                            borderWidth: reply.anonymous ? 1 : 0,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.replyAvatarText,
                                            {
                                                color: reply.anonymous
                                                    ? colors.textSecondary
                                                    : "#fff",
                                            },
                                        ]}
                                    >
                                        {reply.anonymous
                                            ? "🎭"
                                            : reply.author?.name?.charAt(0) || "U"}
                                    </Text>
                                </View>
                                <Text style={[styles.replyName, { color: colors.textPrimary }]}>
                                    {reply.anonymous ? "Anonymous" : reply.author?.name || "User"}
                                </Text>
                                <Text style={[styles.replyTime, { color: colors.textTertiary }]}>
                                    {timeAgo(reply.createdAt)}
                                </Text>
                            </View>
                            <Text style={[styles.replyText, { color: colors.textPrimary }]}>
                                {reply.content}
                            </Text>
                        </View>
                    );
                })}

                {(post.replies || []).length === 0 && (
                    <View style={styles.emptyReplies}>
                        <Text
                            style={[styles.emptyReplyText, { color: colors.textSecondary }]}
                        >
                            No replies yet. Be the first to respond with kindness.
                        </Text>
                    </View>
                )}
            </ScrollView>

            <View
                style={[
                    styles.composer,
                    {
                        backgroundColor: colors.background,
                        borderTopColor: colors.border,
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.anonToggle,
                        {
                            backgroundColor: anonymousReply
                                ? colors.primaryLight
                                : colors.surfaceAlt,
                            borderColor: anonymousReply ? colors.primary : colors.border,
                        },
                    ]}
                    onPress={function () {
                        setAnonymousReply(!anonymousReply);
                    }}
                >
                    <Text style={styles.anonEmoji}>🎭</Text>
                </TouchableOpacity>
                <TextInput
                    style={[
                        styles.replyInput,
                        {
                            backgroundColor: colors.surfaceAlt,
                            color: colors.textPrimary,
                            borderColor: colors.border,
                        },
                    ]}
                    placeholder="Reply with kindness..."
                    placeholderTextColor={colors.textTertiary}
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                    maxLength={300}
                />
                <TouchableOpacity
                    onPress={handleReply}
                    disabled={!replyText.trim() || replying}
                    style={[
                        styles.sendBtn,
                        {
                            backgroundColor: replyText.trim()
                                ? colors.primary
                                : colors.surfaceAlt,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.sendText,
                            { color: replyText.trim() ? "#fff" : colors.textTertiary },
                        ]}
                    >
                        {replying ? "..." : "→"}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.lg,
        paddingTop: 60,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    backBtn: { width: 32, height: 32, justifyContent: "center" },
    backText: { fontSize: 22 },
    topTitle: { fontSize: 16, fontWeight: "700" },
    content: { paddingBottom: spacing.xl },
    postBlock: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    postHeader: {
        flexDirection: "row",
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: { fontSize: 16, fontWeight: "700" },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 4,
    },
    name: { fontSize: 15, fontWeight: "700" },
    username: { fontSize: 14 },
    anonBadge: {
        fontSize: 10,
        fontWeight: "600",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
    },
    time: { fontSize: 13, marginTop: 2 },
    postText: { fontSize: 17, lineHeight: 24, marginBottom: spacing.md },
    imageWrap: { gap: spacing.sm, marginBottom: spacing.md },
    image: {
        width: "100%",
        height: 220,
        borderRadius: radius.lg,
        borderWidth: 1,
    },
    actions: {
        flexDirection: "row",
        gap: spacing.sm,
        paddingTop: spacing.md,
        borderTopWidth: 1,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: radius.full,
    },
    actionEmoji: { fontSize: 18 },
    actionCount: { fontSize: 14, fontWeight: "600" },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
    replyBlock: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    },
    replyHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginBottom: 6,
    },
    replyAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    replyAvatarText: { fontSize: 12, fontWeight: "700" },
    replyName: { fontSize: 14, fontWeight: "600", flex: 1 },
    replyTime: { fontSize: 12 },
    replyText: { fontSize: 15, lineHeight: 21 },
    emptyReplies: { paddingVertical: spacing.xxl, alignItems: "center" },
    emptyReplyText: { fontSize: 14, textAlign: "center" },
    composer: {
        flexDirection: "row",
        alignItems: "flex-end",
        padding: spacing.md,
        borderTopWidth: 1,
        gap: spacing.sm,
    },
    anonToggle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    anonEmoji: { fontSize: 18 },
    replyInput: {
        flex: 1,
        borderRadius: radius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
        fontSize: 14,
        maxHeight: 100,
        borderWidth: 1,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    sendText: { fontSize: 18, fontWeight: "700" },
});