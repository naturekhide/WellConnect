import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useColors, spacing, radius, shadow } from "../src/theme";
import { getAuthToken } from "../src/api/client";

var API_URL = "https://well-connect-web.vercel.app";

export default function NotificationsScreen() {
    var router = useRouter();
    var colors = useColors();
    var [notifications, setNotifications] = useState<any[]>([]);
    var [unreadCount, setUnreadCount] = useState(0);
    var [loading, setLoading] = useState(true);
    var [refreshing, setRefreshing] = useState(false);

    useEffect(function () { loadNotifications(); }, []);

    var loadNotifications = async function () {
        try {
            var token = getAuthToken();
            var res = await fetch(API_URL + "/api/notifications", {
                headers: { "Authorization": "Bearer " + token },
            });
            if (res.ok) {
                var data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (e) { }
        setLoading(false);
    };

    var onRefresh = async function () {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    var markRead = async function (id: string) {
        try {
            var token = getAuthToken();
            await fetch(API_URL + "/api/notifications", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token,
                },
                body: JSON.stringify({ notificationId: id }),
            });
            setNotifications(notifications.map(function (n: any) {
                return n.id === id ? { ...n, isRead: true } : n;
            }));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (e) { }
    };

    var markAllRead = async function () {
        try {
            var token = getAuthToken();
            await fetch(API_URL + "/api/notifications", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token,
                },
                body: JSON.stringify({ markAll: true }),
            });
            setNotifications(notifications.map(function (n: any) { return { ...n, isRead: true }; }));
            setUnreadCount(0);
        } catch (e) { }
    };

    var handleTap = function (n: any) {
        if (!n.isRead) markRead(n.id);
    };

    var getIcon = function (type: string) {
        if (type === "achievement") return "🏆";
        if (type === "insight") return "💡";
        if (type === "streak") return "🔥";
        if (type === "goal") return "🎯";
        return "🔔";
    };

    var timeAgo = function (d: string) {
        var diff = Date.now() - new Date(d).getTime();
        var mins = Math.floor(diff / 60000);
        var hrs = Math.floor(diff / 3600000);
        var days = Math.floor(diff / 86400000);
        if (mins < 1) return "just now";
        if (mins < 60) return mins + "m ago";
        if (hrs < 24) return hrs + "h ago";
        return days + "d ago";
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={styles.backButton}>
                    <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
                </TouchableOpacity>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllRead}>
                        <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            >
                <Text style={[styles.title, { color: colors.textPrimary }]}>🔔 Notifications</Text>
                {unreadCount > 0 && (
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{unreadCount} unread</Text>
                )}

                {notifications.length === 0 ? (
                    <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={styles.emptyEmoji}>🔔</Text>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No notifications yet</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Keep checking in, journaling, and hitting goals — you'll start seeing updates here.
                        </Text>
                    </View>
                ) : (
                    notifications.map(function (n: any) {
                        return (
                            <TouchableOpacity
                                key={n.id}
                                onPress={function () { handleTap(n); }}
                                style={[
                                    styles.card,
                                    { backgroundColor: colors.surface, borderColor: colors.border },
                                    !n.isRead && { borderLeftWidth: 4, borderLeftColor: colors.primary },
                                ]}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.icon}>{getIcon(n.type)}</Text>
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{n.title}</Text>
                                        {!n.isRead && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
                                    </View>
                                    <Text style={[styles.cardBody, { color: colors.textSecondary }]}>{n.body}</Text>
                                    <Text style={[styles.cardTime, { color: colors.textTertiary }]}>{timeAgo(n.createdAt)}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingTop: 60,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
    },
    backButton: { paddingVertical: spacing.sm },
    backText: { fontSize: 15, fontWeight: "600" },
    markAllText: { fontSize: 13, fontWeight: "600" },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    title: { fontSize: 24, fontWeight: "700" },
    subtitle: { fontSize: 14 },
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
    card: {
        flexDirection: "row",
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        gap: spacing.md,
        ...shadow.sm,
    },
    icon: { fontSize: 24 },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
    cardTitle: { fontSize: 14, fontWeight: "600", flex: 1 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    cardBody: { fontSize: 13, lineHeight: 19 },
    cardTime: { fontSize: 11, marginTop: spacing.xs },
});