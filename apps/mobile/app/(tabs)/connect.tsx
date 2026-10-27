import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Modal, // 🚨 Replaced Alert with Modal
} from "react-native";
import { useRouter } from "expo-router";
import { getFeed, deleteFeedPost } from "../../src/api/client";
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

    // 🚨 State for the custom modern delete modal
    var [postToDelete, setPostToDelete] = useState<string | null>(null);
    var [isDeleting, setIsDeleting] = useState(false);

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

    var handleReactionChange = function (postId: string, reactions: any, myReaction: any) {
        setPosts(posts.map(function (p: any) {
            return p.id === postId ? { ...p, reactions, myReaction } : p;
        }));
    };

    // 🚨 Trigger the modal
    var promptDelete = function (postId: string) {
        setPostToDelete(postId);
    };

    // 🚨 Execute deletion when user confirms in the modal
    var confirmDelete = async function () {
        if (!postToDelete) return;
        setIsDeleting(true);
        try {
            await deleteFeedPost(postToDelete);
            setPosts(posts.filter(function (p: any) { return p.id !== postToDelete; }));
            setPostToDelete(null);
        } catch (e: any) {
            console.error("Failed to delete", e);
        }
        setIsDeleting(false);
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
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                            🌍 Connect
                        </Text>
                        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                            Share moments. Support each other.
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={function () { router.push("/search"); }}
                        style={{ padding: spacing.sm }}
                    >
                        <Text style={{ fontSize: 22 }}>🔍</Text>
                    </TouchableOpacity>

                </View>
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
                <View style={{ flex: 1, flexDirection: "row" }}>
                    {TABS.map(function (t: any) {
                        var active = activeTab === t.id;
                        return (
                            <TouchableOpacity
                                key={t.id}
                                style={styles.tabBtn}
                                onPress={function () { setActiveTab(t.id); }}
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

                {activeTab === "circles" && (
                    <TouchableOpacity
                        onPress={function () { router.push("/circles"); }}
                        style={{ paddingVertical: spacing.md, alignSelf: "center" }}
                    >
                        <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>
                            Browse →
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
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
                                ? "Follow people to see their moments here. Anonymous posts don't appear in this tab."
                                : activeTab === "circles"
                                    ? "Join a circle to see its posts here."
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
                                onDelete={promptDelete} // 🚨 Triggers the modal
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

            {/* 🚨 MODERN DELETE MODAL */}
            <Modal
                visible={postToDelete !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={function () { setPostToDelete(null); }}
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={function () { setPostToDelete(null); }}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Delete Moment?</Text>
                        <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                            This action cannot be undone. This moment will be permanently removed from the feed.
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
                                onPress={function () { setPostToDelete(null); }}
                            >
                                <Text style={{ color: colors.textPrimary, fontWeight: "600", fontSize: 15 }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: "#ef4444" }]}
                                onPress={confirmDelete}
                                disabled={isDeleting}
                            >
                                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: 20,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 22, fontWeight: "700" },
    headerSub: { fontSize: 13, marginTop: 2 },
    tabs: {
        flexDirection: "row",
        alignItems: "center",
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

    // 🚨 MODAL STYLES
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.lg
    },
    modalContent: {
        width: "100%",
        maxWidth: 340,
        borderRadius: radius.xl,
        padding: spacing.xl,
        borderWidth: 1
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "800",
        marginBottom: spacing.sm,
        textAlign: "center"
    },
    modalText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        marginBottom: spacing.xl
    },
    modalActions: {
        flexDirection: "row",
        gap: spacing.md
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center"
    },
});