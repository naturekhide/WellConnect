import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { getFeed } from "../../src/api/client";
import FeedPostCard from "../../components/FeedPostCard";
import { Skeleton } from "../../src/components";
import { useColors, spacing, radius } from "../../src/theme";

var TABS = [
    { id: "for-you", label: "For You" },
    { id: "following", label: "Following" },
    { id: "circles", label: "Circles" },
];

export default function FeedScreen() {
    var router = useRouter();
    var colors = useColors();
    var [posts, setPosts] = useState<any[]>([]);
    var [cursor, setCursor] = useState<string | null>(null);
    var [hasMore, setHasMore] = useState(false);
    var [loading, setLoading] = useState(true);
    var [loadingMore, setLoadingMore] = useState(false);
    var [refreshing, setRefreshing] = useState(false);
    var [activeTab, setActiveTab] = useState("for-you");

    useEffect(
        function () {
            setPosts([]);
            setCursor(null);
            setHasMore(false);
            setLoading(true);
            loadFeed();
        },
        [activeTab]
    );

    var loadFeed = async function () {
        try {
            var data = await getFeed(activeTab);
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
            var data = await getFeed(activeTab, cursor);
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

    var handleReactionChange = function (
        postId: string,
        reactions: any,
        myReaction: any
    ) {
        setPosts(
            posts.map(function (p: any) {
                return p.id === postId ? { ...p, reactions, myReaction } : p;
            })
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View
                style={[
                    styles.header,
                    {
                        borderBottomColor: colors.border,
                        backgroundColor: colors.background,
                    },
                ]}
            >
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    🌍 Connect
                </Text>
                <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                    Share moments. Support each other.
                </Text>
            </View>

            <View
                style={[
                    styles.tabs,
                    {
                        borderBottomColor: colors.border,
                        backgroundColor: colors.background,
                    },
                ]}
            >
                {TABS.map(function (t: any) {
                    var active = activeTab === t.id;
                    return (
                        <TouchableOpacity
                            key={t.id}
                            style={styles.tabBtn}
                            onPress={function () {
                                setActiveTab(t.id);
                            }}
                        >
                            <Text
                                style={[
                                    styles.tabLabel,
                                    { color: active ? colors.textPrimary : colors.textSecondary },
                                    active && { fontWeight: "700" },
                                ]}
                            >
                                {t.label}
                            </Text>
                            {active && (
                                <View
                                    style={[
                                        styles.tabUnderline,
                                        { backgroundColor: colors.primary },
                                    ]}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {loading ? (
                    <View style={{ gap: 12 }}>
                        <Skeleton width="100%" height={120} />
                        <Skeleton width="100%" height={120} />
                        <Skeleton width="100%" height={120} />
                    </View>
                ) : posts.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyEmoji}>🌿</Text>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                            Your space is quiet
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {activeTab === "following"
                                ? "Follow people to see their moments here."
                                : activeTab === "circles"
                                    ? "Join a circle to share with your people."
                                    : "Tap the + button to share your first moment."}
                        </Text>
                    </View>
                ) : (
                    posts.map(function (post: any) {
                        return (
                            <FeedPostCard
                                key={post.id}
                                post={post}
                                onReactionChange={handleReactionChange}
                                onPress={function () {
                                    router.push("/feed/" + post.id);
                                }}
                            />
                        );
                    })
                )}

                {hasMore && !loading && (
                    <TouchableOpacity
                        style={[styles.loadMore, { borderColor: colors.border }]}
                        onPress={loadMore}
                        disabled={loadingMore}
                    >
                        {loadingMore ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : (
                            <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                                Load more
                            </Text>
                        )}
                    </TouchableOpacity>
                )}

                {!hasMore && posts.length > 0 && !loading && (
                    <View style={styles.caughtUp}>
                        <Text style={styles.caughtUpEmoji}>🌿</Text>
                        <Text style={[styles.caughtUpText, { color: colors.textSecondary }]}>
                            You're caught up. Take a breath.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: 60,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 22, fontWeight: "700" },
    headerSub: { fontSize: 13, marginTop: 2 },
    tabs: {
        flexDirection: "row",
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
    },
    tabBtn: {
        paddingVertical: spacing.md,
        marginRight: spacing.xl,
        position: "relative",
    },
    tabLabel: { fontSize: 15, fontWeight: "500" },
    tabUnderline: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        borderRadius: 1,
    },
    content: { paddingBottom: spacing.xxl },
    emptyBox: {
        alignItems: "center",
        paddingVertical: spacing.xxl * 2,
        paddingHorizontal: spacing.lg,
    },
    emptyEmoji: { fontSize: 40, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, fontWeight: "600", marginBottom: spacing.sm },
    emptyText: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        maxWidth: 260,
    },
    loadMore: {
        margin: spacing.lg,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        alignItems: "center",
    },
    loadMoreText: { fontSize: 14, fontWeight: "600" },
    caughtUp: { alignItems: "center", paddingVertical: spacing.xxl },
    caughtUpEmoji: { fontSize: 24, marginBottom: spacing.sm },
    caughtUpText: { fontSize: 13, fontWeight: "500" },
});