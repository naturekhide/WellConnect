import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native";
import { useColors, spacing, radius } from "../src/theme";
import { reactToPost } from "../src/api/client";

var REACTIONS = [
    { type: "hug", emoji: "🤗" },
    { type: "growth", emoji: "🌱" },
    { type: "strength", emoji: "💪" },
    { type: "grateful", emoji: "🙏" },
];

var IMAGE_BASE = "https://well-connect-web.vercel.app";

type Props = {
    post: any;
    onReactionChange?: (postId: string, reactions: any, myReaction: any) => void;
    onPress?: () => void;
};

export default function FeedPostCard({ post, onReactionChange, onPress }: Props) {
    var colors = useColors();
    var [myReaction, setMyReaction] = useState<string | null>(post.myReaction ?? null);
    var [reactions, setReactions] = useState<any>(
        post.reactions || { hug: 0, growth: 0, strength: 0, grateful: 0 }
    );

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

    var handleReact = async function (type: string) {
        try {
            var res = await reactToPost(post.id, type);
            setReactions(res.reactions);
            setMyReaction(res.myReaction);
            if (onReactionChange) onReactionChange(post.id, res.reactions, res.myReaction);
        } catch (e) { }
    };

    var displayName = post.anonymous ? "Anonymous" : post.author?.name || "User";
    var initials = post.anonymous ? "🎭" : post.author?.name?.charAt(0) || "U";

    return (
        <TouchableOpacity
            style={[styles.post, { borderBottomColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={styles.row}>
                <View style={styles.avatarColumn}>
                    <View
                        style={[
                            styles.avatar,
                            {
                                backgroundColor: post.anonymous ? colors.surfaceAlt : colors.primary,
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
                            {initials}
                        </Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text
                            style={[styles.name, { color: colors.textPrimary }]}
                            numberOfLines={1}
                        >
                            {displayName}
                        </Text>
                        {!post.anonymous && post.author?.username && (
                            <Text
                                style={[styles.username, { color: colors.textSecondary }]}
                                numberOfLines={1}
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
                        <Text style={[styles.dot, { color: colors.textTertiary }]}>·</Text>
                        <Text style={[styles.time, { color: colors.textTertiary }]}>
                            {timeAgo(post.createdAt)}
                        </Text>
                    </View>

                    {post.content ? (
                        <Text style={[styles.text, { color: colors.textPrimary }]}>
                            {post.content}
                        </Text>
                    ) : null}

                    {post.imageUrls && post.imageUrls.length > 0 && (
                        <View style={styles.imageWrap}>
                            {post.imageUrls.length === 1 && (
                                <Image
                                    source={{ uri: IMAGE_BASE + post.imageUrls[0] }}
                                    style={[styles.imageSingle, { borderColor: colors.border }]}
                                    resizeMode="cover"
                                />
                            )}
                            {post.imageUrls.length === 2 && (
                                <View style={styles.imageRow}>
                                    {post.imageUrls.map(function (url: string, i: number) {
                                        return (
                                            <Image
                                                key={i}
                                                source={{ uri: IMAGE_BASE + url }}
                                                style={[styles.imageHalf, { borderColor: colors.border }]}
                                                resizeMode="cover"
                                            />
                                        );
                                    })}
                                </View>
                            )}
                            {post.imageUrls.length === 3 && (
                                <View style={styles.imageRow}>
                                    {post.imageUrls.map(function (url: string, i: number) {
                                        return (
                                            <Image
                                                key={i}
                                                source={{ uri: IMAGE_BASE + url }}
                                                style={[styles.imageThird, { borderColor: colors.border }]}
                                                resizeMode="cover"
                                            />
                                        );
                                    })}
                                </View>
                            )}
                            {post.imageUrls.length >= 4 && (
                                <View style={styles.imageGridFour}>
                                    {post.imageUrls.slice(0, 4).map(function (url: string, i: number) {
                                        return (
                                            <Image
                                                key={i}
                                                source={{ uri: IMAGE_BASE + url }}
                                                style={[styles.imageQuarter, { borderColor: colors.border }]}
                                                resizeMode="cover"
                                            />
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    )}

                    <View style={styles.actions}>
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
                                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
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

                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={onPress}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                        >
                            <Text style={styles.actionEmoji}>💬</Text>
                            {post.replyCount > 0 && (
                                <Text
                                    style={[styles.actionCount, { color: colors.textSecondary }]}
                                >
                                    {post.replyCount}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

var styles = StyleSheet.create({
    post: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    },
    row: { flexDirection: "row", gap: spacing.md },
    avatarColumn: { width: 40 },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: { fontSize: 15, fontWeight: "700" },
    content: { flex: 1, minWidth: 0 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: 4,
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
        textTransform: "lowercase",
    },
    dot: { fontSize: 14 },
    time: { fontSize: 13 },
    text: { fontSize: 15, lineHeight: 21, marginBottom: spacing.sm },
    imageWrap: { marginTop: spacing.sm, marginBottom: spacing.sm },
    imageSingle: {
        width: "100%",
        height: 240,
        borderRadius: radius.lg,
        borderWidth: 1,
    },
    imageRow: { flexDirection: "row", gap: 2 },
    imageHalf: {
        flex: 1,
        height: 200,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    imageThird: {
        flex: 1,
        height: 160,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    imageGridFour: { flexDirection: "row", flexWrap: "wrap", gap: 2 },
    imageQuarter: {
        width: "49.5%",
        height: 140,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: radius.full,
    },
    actionEmoji: { fontSize: 16 },
    actionCount: { fontSize: 13, fontWeight: "600" },
});