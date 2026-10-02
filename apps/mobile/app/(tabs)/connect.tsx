import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { getFeed } from "../../src/api/client";
import FeedPostCard from "../../components/FeedPostCard";
import { Skeleton } from "../../src/components";
import { useColors, spacing, radius, shadow } from "../../src/theme";

export default function FeedScreen() {
    var router = useRouter();
    var colors = useColors();
    var [posts, setPosts] = useState<any[]>([]);
    var [cursor, setCursor] = useState<string | null>(null);
    var [hasMore, setHasMore] = useState(false);
    var [loading, setLoading] = useState(true);
    var [loadingMore, setLoadingMore] = useState(false);
    var [refreshing, setRefreshing] = useState(false);

    useEffect(function () { loadFeed(); }, []);

    useFocusEffect(
        useCallback(function () {
            loadFeed();
        }, [])
    );

    var loadFeed = async function () {
        try {
            var data = await getFeed();
            setPosts(data.posts || []);
            setCursor(data.nextCursor);
            setHasMore(data.hasMore);
        } catch (e) { }
        setLoading(false);
    };

    var loadMore = async function () {
        if (!hasMore || loadingMore || !cursor) return;
        setLoadingMore(true);
        try {
            var data = await getFeed(cursor);
            setPosts(posts.concat(data.posts || []));
            setCursor(data.nextCursor);
            setHasMore(data.hasMore);
        } catch (e) { }
        setLoadingMore(false);
    };

    var onRefresh = async function () {
        setRefreshing(true);
        await loadFeed();
        setRefreshing(false);
    };

    var handleReactionChange = function (postId: string, reactions: any, myReaction: any) {
        setPosts(posts.map(function (p: any) {
            return p.id === postId ? { ...p, reactions, myReaction } : p;
        }));
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.content}>
                    <Skeleton width="100%" height={140} />
                    <Skeleton width="100%" height={140} style={{ marginTop: 12 }} />
                    <Skeleton width="100%" height={140} style={{ marginTop: 12 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            >
                <Text style={[styles.title, { color: colors.textPrimary }]}>🌍 Connect</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Share moments. Support each other.
                </Text>

                {posts.length === 0 ? (
                    <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={styles.emptyEmoji}>✨</Text>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No posts yet</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Tap the + button to share something with the community.
                        </Text>
                    </View>
                ) : (
                    posts.map(function (post: any) {
                        return (
                            <FeedPostCard
                                key={post.id}
                                post={post}
                                onReactionChange={handleReactionChange}
                                onPress={function () { router.push("/feed/" + post.id); }}
                            />
                        );
                    })
                )}

                {hasMore && (
                    <TouchableOpacity
                        style={[styles.loadMore, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={loadMore}
                        disabled={loadingMore}
                    >
                        {loadingMore ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : (
                            <Text style={[styles.loadMoreText, { color: colors.primary }]}>Load more</Text>
                        )}
                    </TouchableOpacity>
                )}

                {!hasMore && posts.length > 0 && (
                    <Text style={[styles.caughtUp, { color: colors.textTertiary }]}>
                        You're caught up 🌿
                    </Text>
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
    emptyBox: {
        borderRadius: radius.lg,
        padding: spacing.xxl,
        alignItems: "center",
        borderWidth: 1,
        ...shadow.sm,
    },
    emptyEmoji: { fontSize: 32, marginBottom: spacing.sm },
    emptyTitle: { fontSize: 15, fontWeight: "600", marginBottom: spacing.xs },
    emptyText: { fontSize: 13, textAlign: "center", lineHeight: 19 },
    loadMore: {
        borderRadius: radius.lg,
        padding: spacing.md,
        alignItems: "center",
        borderWidth: 1,
    },
    loadMoreText: { fontSize: 14, fontWeight: "600" },
    caughtUp: { fontSize: 12, textAlign: "center", marginTop: spacing.md },
});