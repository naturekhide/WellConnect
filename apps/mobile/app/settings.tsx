import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, ActivityIndicator, FlatList } from "react-native";
import { useRouter, useFocusEffect } from "expo-router"; // 👈 Imported useFocusEffect
import { useState, useEffect, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors, spacing, radius, shadow } from "../src/theme";
import { useThemeStore } from "../src/store/themeStore";
import { getBlockedUsers, unblockUser } from "../src/api/client";

export default function SettingsScreen() {
    var router = useRouter();
    var colors = useColors();
    var insets = useSafeAreaInsets();
    var { mode, toggleTheme } = useThemeStore();

    var [pushEnabled, setPushEnabled] = useState(true);
    var [analyticsEnabled, setAnalyticsEnabled] = useState(false);

    var [showBlockedModal, setShowBlockedModal] = useState(false);
    var [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    var [loadingBlocked, setLoadingBlocked] = useState(false);

    var fetchBlocked = async function () {
        setLoadingBlocked(true);
        try {
            var data = await getBlockedUsers();
            setBlockedUsers(data || []);
        } catch (e) {
            console.log("Failed to fetch blocked users", e);
        }
        setLoadingBlocked(false);
    };

    var handleOpenBlocked = function () {
        setShowBlockedModal(true);
    };

    // 👇 This forces the list to refresh every time you open the Settings screen
    useFocusEffect(
        useCallback(() => {
            fetchBlocked();
        }, [])
    );

    var handleUnblock = async function (id: string) {
        try {
            await unblockUser(id);
            // Remove them from the local state immediately so the UI updates
            setBlockedUsers(blockedUsers.filter(function (u) { return u.id !== id; }));
        } catch (e) {
            console.log("Failed to unblock", e);
        }
    };

    // ... the rest of the return() JSX stays exactly the same!

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* 👇 Applied safe area insets to the header */}
            <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background, paddingTop: insets.top + spacing.sm }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={styles.backButton}>
                    <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>App Preferences</Text>

                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
                            <Text style={[styles.rowDetail, { color: colors.textSecondary }]}>
                                {mode === "dark" ? "Currently using dark theme" : "Currently using light theme"}
                            </Text>
                        </View>
                        <Switch
                            value={mode === "dark"}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>

                    <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Push Notifications</Text>
                            <Text style={[styles.rowDetail, { color: colors.textSecondary }]}>Get alerts for messages and reminders.</Text>
                        </View>
                        <Switch
                            value={pushEnabled}
                            onValueChange={setPushEnabled}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Share Analytics</Text>
                            <Text style={[styles.rowDetail, { color: colors.textSecondary }]}>Help us improve the app anonymously.</Text>
                        </View>
                        <Switch
                            value={analyticsEnabled}
                            onValueChange={setAnalyticsEnabled}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>
                </View>

                {/* 🚨 SAFETY & PRIVACY SECTION */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: spacing.lg }]}>Safety & Privacy</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity style={styles.row} onPress={handleOpenBlocked}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Blocked Users</Text>
                            <Text style={[styles.rowDetail, { color: colors.textSecondary }]}>Manage people you have blocked.</Text>
                        </View>
                        <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: spacing.lg }]}>About</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.row}>
                        <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>App Version</Text>
                        <Text style={{ color: colors.textTertiary }}>1.0.0</Text>
                    </View>
                </View>

            </ScrollView>

            {/* 🚨 BLOCKED USERS MODAL */}
            <Modal visible={showBlockedModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={function () { setShowBlockedModal(false); }}>
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Blocked Users</Text>
                        <TouchableOpacity onPress={function () { setShowBlockedModal(false); }}>
                            <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 16 }}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    {loadingBlocked ? (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : blockedUsers.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl }}>
                            <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🕊️</Text>
                            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600", marginBottom: spacing.xs }}>No blocked users</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center" }}>Anyone you block will appear here.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={blockedUsers}
                            keyExtractor={function (item) { return item.id; }}
                            contentContainerStyle={{ padding: spacing.lg }}
                            renderItem={function ({ item }) {
                                return (
                                    <View style={[styles.userRow, { borderBottomColor: colors.borderLight }]}>
                                        <View style={[styles.avatar, { backgroundColor: colors.surfaceAlt }]}>
                                            <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>{item.name?.charAt(0) || "U"}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "600" }}>{item.name}</Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>@{item.username}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.unblockBtn, { borderColor: colors.danger }]}
                                            onPress={function () { handleUnblock(item.id); }}
                                        >
                                            <Text style={{ color: colors.danger, fontWeight: "600", fontSize: 13 }}>Unblock</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            }}
                        />
                    )}
                </View>
            </Modal>

        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.lg,
        // Removed paddingTop: 60 because we use insets now
        paddingBottom: spacing.md,
        borderBottomWidth: 1
    },
    backButton: { paddingVertical: spacing.sm, width: 60 },
    backText: { fontSize: 15, fontWeight: "600" },
    title: { fontSize: 18, fontWeight: "700" },
    content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
    sectionTitle: { fontSize: 13, fontWeight: "600", marginBottom: spacing.sm, marginLeft: 4 },
    card: {
        borderRadius: radius.lg,
        borderWidth: 1,
        overflow: "hidden",
        ...shadow.sm,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: spacing.lg,
    },
    rowContent: { flex: 1, paddingRight: spacing.md },
    rowLabel: { fontSize: 15, fontWeight: "500" },
    rowDetail: { fontSize: 12, marginTop: 3, lineHeight: 17 },

    // Modal Styles
    modalContainer: { flex: 1 },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: spacing.lg,
        paddingTop: 60, // safe area for pageSheet
        borderBottomWidth: 1,
    },
    modalTitle: { fontSize: 18, fontWeight: "700" },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        gap: spacing.md,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    unblockBtn: {
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: radius.md,
        borderWidth: 1,
    }
});