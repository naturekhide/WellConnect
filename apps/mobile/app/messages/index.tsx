import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { getConversations } from "../../src/api/client";
import { useColors, spacing, radius } from "../../src/theme";

export default function MessagesScreen() {
    var router = useRouter();
    var colors = useColors();
    var [conversations, setConversations] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [refreshing, setRefreshing] = useState(false);

    useEffect(function () { load(); }, []);

    var load = async function () {
        try {
            var data = await getConversations();
            setConversations(data.conversations || []);
        } catch (e) { }
        setLoading(false);
    };

    var onRefresh = async function () {
        setRefreshing(true);
        await load();
        setRefreshing(false);
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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={styles.backBtn}>
                    <Text style={[styles.backText, { color: colors.textPrimary }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.topTitle, { color: colors.textPrimary }]}>Messages</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {loading ? (
                    <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
                ) : conversations.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={{ fontSize: 40, marginBottom: spacing.md }}>💬</Text>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No messages yet</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Visit someone's profile and tap Message to start a conversation.
                        </Text>
                    </View>
                ) : (
                    conversations.map(function (c: any) {
                        if (!c.user) return null;
                        return (
                            <TouchableOpacity
                                key={c.user.id}
                                onPress={function () { router.push("/messages/" + c.user.id); }}
                                style={[styles.row, { borderBottomColor: colors.border }]}
                            >
                                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.avatarText}>
                                        {c.user.name?.charAt(0) || "U"}
                                    </Text>
                                </View>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm }}>
                                        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
                                            {c.user.name}
                                        </Text>
                                        {c.lastMessage && (
                                            <Text style={[styles.time, { color: colors.textTertiary }]}>
                                                {timeAgo(c.lastMessage.createdAt)}
                                            </Text>
                                        )}
                                    </View>
                                    {c.lastMessage && (
                                        <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={1}>
                                            {c.lastMessage.isMine ? "You: " : ""}{c.lastMessage.content}
                                        </Text>
                                    )}
                                </View>
                                {c.unreadCount > 0 && (
                                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                        <Text style={styles.badgeText}>{c.unreadCount}</Text>
                                    </View>
                                )}
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
    topBar: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, borderBottomWidth: 1,
    },
    backBtn: { width: 32, height: 32, justifyContent: "center" },
    backText: { fontSize: 22 },
    topTitle: { fontSize: 16, fontWeight: "700" },
    content: { paddingBottom: spacing.xxl },
    emptyBox: { alignItems: "center", paddingVertical: spacing.xxl * 2, paddingHorizontal: spacing.lg },
    emptyTitle: { fontSize: 16, fontWeight: "600", marginBottom: spacing.sm },
    emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20, maxWidth: 280 },
    row: {
        flexDirection: "row", alignItems: "center", gap: spacing.md,
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1,
    },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    avatarText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    name: { fontSize: 15, fontWeight: "600", flex: 1 },
    time: { fontSize: 11 },
    preview: { fontSize: 13, marginTop: 2 },
    badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, flexShrink: 0 },
    badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});