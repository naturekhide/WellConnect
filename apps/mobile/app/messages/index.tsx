import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getConversations } from "../../src/api/client";
import { useColors, spacing, radius } from "../../src/theme";

export default function MessagesInbox() {
    var router = useRouter();
    var colors = useColors();
    var [conversations, setConversations] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [refreshing, setRefreshing] = useState(false);
    var [search, setSearch] = useState("");
    var [activeTab, setActiveTab] = useState("All");

    var loadConversations = async function () {
        try {
            var data = await getConversations();
            setConversations(data.conversations || []);
        } catch (e) { }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(function () {
        loadConversations();
        var interval = setInterval(loadConversations, 10000); // Poll every 10s
        return function () { clearInterval(interval); };
    }, []);

    var onRefresh = function () {
        setRefreshing(true);
        loadConversations();
    };

    // Filtering logic (Only All and Unread now)
    var filtered = conversations.filter(function (c) {
        var matchesSearch = c.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.user?.username?.toLowerCase().includes(search.toLowerCase());

        if (activeTab === "Unread") return matchesSearch && c.unreadCount > 0;
        return matchesSearch;
    });

    var renderItem = function ({ item }: any) {
        var lastMsg = item.lastMessage;
        var time = lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : "";

        return (
            <TouchableOpacity
                style={[styles.row, { borderBottomColor: colors.border }]}
                onPress={function () { router.push("/messages/" + item.user.id); }}
            >
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>{item.user?.name?.charAt(0) || "U"}</Text>
                </View>
                <View style={styles.rowContent}>
                    <View style={styles.rowHeader}>
                        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
                            {item.user?.name || "User"}
                        </Text>
                        <Text style={[styles.time, { color: colors.textTertiary }]}>{time}</Text>
                    </View>
                    <Text style={[styles.message, { color: item.unreadCount > 0 ? colors.textPrimary : colors.textSecondary, fontWeight: item.unreadCount > 0 ? "600" : "400" }]} numberOfLines={1}>
                        {lastMsg?.isMine ? "You: " : ""}{lastMsg?.content || "Start a conversation"}
                    </Text>
                </View>
                {item.unreadCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.badgeText}>{item.unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Conversations</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Connect • Feel • Grow</Text>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="search" size={20} color={colors.textTertiary} style={{ marginRight: 8 }} />
                <TextInput
                    placeholder="Search conversations"
                    placeholderTextColor={colors.textTertiary}
                    style={{ flex: 1, color: colors.textPrimary, fontSize: 15 }}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Tabs (Removed Groups) */}
            <View style={styles.tabs}>
                {["All", "Unread"].map(function (tab) {
                    var active = activeTab === tab;
                    return (
                        <TouchableOpacity
                            key={tab}
                            onPress={function () { setActiveTab(tab); }}
                            style={[styles.tab, active && { backgroundColor: colors.primary }]}
                        >
                            <Text style={{ color: active ? "#fff" : colors.textSecondary, fontWeight: "600", fontSize: 13 }}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* List */}
            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={function (item) { return item.user.id; }}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Text style={{ fontSize: 40, marginBottom: 16 }}>💬</Text>
                            <Text style={{ color: colors.textSecondary }}>No conversations found.</Text>
                        </View>
                    }
                />
            )}

            {/* Floating Action Button (New Message) */}
            <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}>
                <Ionicons name="pencil" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },
    title: { fontSize: 28, fontWeight: "800" },
    subtitle: { fontSize: 14, fontWeight: "500", marginTop: 2 },
    searchBar: {
        flexDirection: "row", alignItems: "center",
        marginHorizontal: spacing.lg, marginBottom: spacing.md,
        paddingHorizontal: spacing.md, height: 44, borderRadius: radius.full, borderWidth: 1,
    },
    tabs: { flexDirection: "row", paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
    tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full },
    row: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1 },
    avatar: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", marginRight: spacing.md },
    avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
    rowContent: { flex: 1, justifyContent: "center" },
    rowHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    name: { fontSize: 16, fontWeight: "700" },
    time: { fontSize: 12 },
    message: { fontSize: 14 },
    badge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, marginLeft: 8 },
    badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
    emptyBox: { alignItems: "center", marginTop: 60 },
    fab: {
        position: "absolute", bottom: 30, right: 30,
        width: 56, height: 56, borderRadius: 28,
        alignItems: "center", justifyContent: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 5, elevation: 8,
    }
});