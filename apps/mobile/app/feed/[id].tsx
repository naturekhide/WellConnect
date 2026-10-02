import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getFeedPost, replyToPost, reactToPost } from "../../src/api/client";
import { useColors, spacing, radius, shadow } from "../../src/theme";

var REACTIONS = [
    { type: "hug", emoji: "🤗" },
    { type: "growth", emoji: "🌱" },
    { type: "strength", emoji: "💪" },
    { type: "grateful", emoji: "🙏" },
];

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

    useEffect(function () { load(); }, [postId]);

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
            <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={styles.backButton}>
                    <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.postHeader}>
                        <View style={[styles.avatar, { backgroundColor: post.anonymous ? colors.textTertiary : colors.primary }]}>
                            <Text style={styles.avatarText}>{post.anonymous ? "?" : (post.author?.name?.charAt(0) || "U")}</Text>
                        </View>
                        <View style={styles.postHeaderText}>
                            <Text style={[styles.name, { color: colors.textPrimary }]}>
                                {post.anonymous ? "Anonymous" : (post.author?.name || "User")}
                            </Text>
                            {!post.anonymous && post.author?.username && (
                                <Text style={[styles.username, { color: colors.textSecondary }]}>@{post.author.username}</Text>
                            )}
                        </View>
                        <Text style={[styles.time, { color: colors.textTertiary }]}>{timeAgo(post.createdAt)}</Text>
                    </View>

                    <Text style={[styles.postContent, { color: colors.textPrimary }]}>{post.content}</Text>

                    {post.imageUrls && post.imageUrls.length > 0 && (
                        <View style={styles.imageGrid}>
                            {post.imageUrls.map(function (url: string, i: number) {
                                return (
                                    <Image
                                        key={i}
                                        source={{ uri: "https://well-connect-web.vercel.app" + url }}
                                        style={post.imageUrls.length === 1 ? styles.imageSingle : styles.imageMulti}
                                    />
                                );
                            })}
                        </View>
                    )}

                    <View style={styles.reactionsRow}>
                        {REACTIONS.map(function (r: any) {
                            var isActive = myReaction === r.type;
                            return (
                                <TouchableOpacity
                                    key={r.type}
                                    style={[styles.reactionBtn, isActive && { backgroundColor: colors.primaryLight }]}
                                    onPress={function () { handleReact(r.type); }}
                                >
                                    <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                                    {reactions[r.type] > 0 && (
                                        <Text style={[styles.reactionCount, { color: isActive ? colors.primary : colors.textSecondary }]}>
                                            {reactions[r.type]}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    {(post.replies || []).length} {(post.replies || []).length === 1 ? "reply" : "replies"}
                </Text>

                {(post.replies || []).map(function (reply: any) {
                    return (
                        <View key={reply.id} style={[styles.replyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.replyHeader}>
                                <View style={[styles.replyAvatar, { backgroundColor: reply.anonymous ? colors.textTertiary : colors.primary }]}>
                                    <Text style={styles.replyAvatarText}>{reply.anonymous ? "?" : (reply.author?.name?.charAt(0) || "U")}</Text>
                                </View>
                                <Text style={[styles.replyName, { color: colors.textPrimary }]}>
                                    {reply.anonymous ? "Anonymous" : (reply.author?.name || "User")}
                                </Text>
                                <Text style={[styles.replyTime, { color: colors.textTertiary }]}>{timeAgo(reply.createdAt)}</Text>
                            </View>
                            <Text style={[styles.replyContent, { color: colors.textPrimary }]}>{reply.content}</Text>
                        </View>
                    );
                })}

                {(post.replies || []).length === 0 && (
                    <View style={styles.emptyReplies}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No replies yet. Be the first to respond with kindness.
                        </Text>
                    </View>
                )}
            </ScrollView>

            <View style={[styles.composer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.anonToggle, anonymousReply && { backgroundColor: colors.primaryLight }]}
                    onPress={function () { setAnonymousReply(!anonymousReply); }}
                >
                    <Text style={styles.anonEmoji}>🎭</Text>
                </TouchableOpacity>
                <TextInput
                    style={[styles.replyInput, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary }]}
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
                    style={[styles.sendButton, { backgroundColor: replyText.trim() ? colors.primary : colors.border }]}
                >
                    <Text style={styles.sendText}>{replying ? "..." : "Send"}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingTop: 60,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
    },
    backButton: { paddingVertical: spacing.sm },
    backText: { fontSize: 15, fontWeight: "600" },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    postCard: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        ...shadow.sm,
    },
    postHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
    avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    postHeaderText: { flex: 1 },
    name: { fontSize: 15, fontWeight: "600" },
    username: { fontSize: 12, marginTop: 1 },
    time: { fontSize: 11 },
    postContent: { fontSize: 16, lineHeight: 23, marginBottom: spacing.md },
    imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: spacing.md },
    imageSingle: { width: "100%", height: 220, borderRadius: radius.md },
    imageMulti: { width: "48%", height: 140, borderRadius: radius.md },
    reactionsRow: { flexDirection: "row", gap: spacing.sm },
    reactionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.md },
    reactionEmoji: { fontSize: 18 },
    reactionCount: { fontSize: 13, fontWeight: "600" },
    sectionTitle: { fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
    replyCard: {
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
    },
    replyHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
    replyAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    replyAvatarText: { color: "#fff", fontWeight: "700", fontSize: 12 },
    replyName: { fontSize: 13, fontWeight: "600", flex: 1 },
    replyTime: { fontSize: 11 },
    replyContent: { fontSize: 14, lineHeight: 20 },
    emptyReplies: { padding: spacing.lg, alignItems: "center" },
    emptyText: { fontSize: 13, textAlign: "center" },
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
    },
    anonEmoji: { fontSize: 20 },
    replyInput: {
        flex: 1,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + 4,
        borderRadius: radius.md,
        justifyContent: "center",
    },
    sendText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});