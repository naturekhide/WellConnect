import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert, ActivityIndicator, TextInput, Linking } from "react-native";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useAuthStore } from "../../src/store/authStore";
import { getMoodStats, getJournal, getGoals, apiFetch } from "../../src/api/client";
import { Skeleton } from "../../src/components";
import { useColors, spacing, radius, shadow } from "../../src/theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://well-connect-web.vercel.app";

export default function YouScreen() {
    var router = useRouter();
    var colors = useColors();
    var { user, logout } = useAuthStore();
    var [stats, setStats] = useState<any>(null);
    var [journalCount, setJournalCount] = useState(0);
    var [goalCount, setGoalCount] = useState(0);
    var [loading, setLoading] = useState(true);
    var [refreshing, setRefreshing] = useState(false);
    var [downloadingPdf, setDownloadingPdf] = useState(false);
    var [downloadingJson, setDownloadingJson] = useState(false);
    var [deleting, setDeleting] = useState(false);

    // 🚨 Linktree States
    var [links, setLinks] = useState<any[]>([]);
    var [showAddLink, setShowAddLink] = useState(false);
    var [newLinkTitle, setNewLinkTitle] = useState("");
    var [newLinkUrl, setNewLinkUrl] = useState("");
    var [savingLink, setSavingLink] = useState(false);

    useEffect(function () { loadAll(); }, []);

    var loadAll = async function () {
        try {
            var s = await getMoodStats();
            setStats(s);
            var j = await getJournal();
            setJournalCount(j.length);
            var g = await getGoals();
            setGoalCount(g.length);

            // 👇 Fetch links after we have the user ID
            if (user?.id) {
                fetchLinks(user.id);
            }
        } catch (e) { }
        setLoading(false);
    };

    var fetchLinks = async function (userId: string) {
        try {
            var r = await fetch(`${API_URL}/api/users/${userId}/links`);
            if (r.ok) {
                var data = await r.json();
                setLinks(data.links || []);
            }
        } catch (e) {}
    };

    var handleAddLink = async function () {
        if (!newLinkTitle.trim() || !newLinkUrl.trim() || !user?.id) return;
        setSavingLink(true);
        try {
            var r = await fetch(`${API_URL}/api/users/${user.id}/links`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Add auth header if needed, e.g., "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title: newLinkTitle, url: newLinkUrl }),
            });
            if (r.ok) {
                var newLink = await r.json();
                setLinks([...links, newLink]);
                setNewLinkTitle("");
                setNewLinkUrl("");
                setShowAddLink(false);
            } else {
                Alert.alert("Error", "Failed to add link");
            }
        } catch (e) {
            Alert.alert("Error", "Something went wrong");
        }
        setSavingLink(false);
    };

    var handleDeleteLink = async function (linkId: string) {
        Alert.alert("Delete Link", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async function () {
                    try {
                        var r = await fetch(`${API_URL}/api/users/${user?.id}/links?linkId=${linkId}`, {
                            method: "DELETE",
                        });
                        if (r.ok) {
                            setLinks(links.filter((l) => l.id !== linkId));
                        }
                    } catch (e) {}
                }
            }
        ]);
    };

    var onRefresh = async function () {
        setRefreshing(true);
        await loadAll();
        setRefreshing(false);
    };

    var handleLogout = async function () {
        await logout();
        router.replace("/auth/login");
    };

    var handleDownloadPdf = async function () {
        setDownloadingPdf(true);
        try {
            var fileUri = FileSystem.documentDirectory + "wellconnect-report.pdf";
            var res = await FileSystem.downloadAsync(`${API_URL}/api/users/export-pdf`, fileUri);
            if (res.status === 200) {
                await Sharing.shareAsync(res.uri);
            } else {
                Alert.alert("Error", `Failed to download PDF. Status: ${res.status}`);
            }
        } catch (e: any) {
            Alert.alert("Error", e.message || "An error occurred.");
        }
        setDownloadingPdf(false);
    };

    var handleDownloadJson = async function () {
        setDownloadingJson(true);
        try {
            var fileUri = FileSystem.documentDirectory + "wellconnect-data.json";
            var res = await FileSystem.downloadAsync(`${API_URL}/api/users/export`, fileUri);
            if (res.status === 200) {
                await Sharing.shareAsync(res.uri);
            } else {
                Alert.alert("Error", `Failed to download data. Status: ${res.status}`);
            }
        } catch (e: any) {
            Alert.alert("Error", e.message || "An error occurred.");
        }
        setDownloadingJson(false);
    };

    var handleDeleteAccount = function () {
        Alert.alert(
            "Delete Account",
            "Are you absolutely sure? This will permanently delete all your data.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async function () {
                        setDeleting(true);
                        try {
                            var res = await fetch(`${API_URL}/api/users/delete`, { method: "DELETE" });
                            if (res.ok) {
                                await logout();
                                router.replace("/auth/login");
                            } else {
                                Alert.alert("Error", "Failed to delete account.");
                                setDeleting(false);
                            }
                        } catch (e) {
                            Alert.alert("Error", "An error occurred.");
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.content}>
                    <View style={{ alignItems: "center", marginTop: 8, gap: 12 }}>
                        <Skeleton width={88} height={88} style={{ borderRadius: 44 }} />
                        <Skeleton width={140} height={22} />
                        <Skeleton width={100} height={14} />
                    </View>
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
                <View style={styles.profileHeader}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || "U"}</Text>
                    </View>
                    <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.name || "Friend"}</Text>
                    <Text style={[styles.username, { color: colors.textSecondary }]}>@{user?.username || "user"}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.statNumber, { color: colors.primary }]}>{stats?.totalEntries || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Check-ins</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.statNumber, { color: colors.primary }]}>{journalCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Journal</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.statNumber, { color: colors.primary }]}>{goalCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Goals</Text>
                    </View>
                </View>

                {stats && stats.streak > 0 && (
                    <View style={[styles.streakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <View style={styles.streakContent}>
                            <Text style={[styles.streakNumber, { color: colors.textPrimary }]}>{stats.streak} day streak</Text>
                            <Text style={[styles.streakText, { color: colors.textSecondary }]}>Keep showing up for yourself</Text>
                        </View>
                    </View>
                )}

                {/* 🚨 MOBILE LINKS SECTION */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Your Links</Text>
                <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {links.map(function (link: any) {
                        return (
                            <View key={link.id} style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}>
                                <Text style={styles.menuIcon}>{link.icon || "🔗"}</Text>
                                <TouchableOpacity
                                    style={styles.menuContent}
                                    onPress={function () { Linking.openURL(link.url); }}
                                >
                                    <Text style={[styles.menuText, { color: colors.textPrimary }]}>{link.title}</Text>
                                    <Text style={[styles.menuSub, { color: colors.textTertiary }]}>{link.url}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={function () { handleDeleteLink(link.id); }}>
                                    <Text style={{ color: colors.danger, fontSize: 18, padding: 4 }}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}

                    {/* Add Link Button */}
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: links.length > 0 ? 1 : 0 }]}
                        onPress={function () { setShowAddLink(!showAddLink); }}
                    >
                        <Text style={styles.menuIcon}>➕</Text>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuText, { color: colors.primary }]}>Add Link</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Add Link Form */}
                    {showAddLink && (
                        <View style={{ padding: spacing.md, gap: spacing.sm }}>
                            <TextInput
                                placeholder="Title (e.g., My Portfolio)"
                                placeholderTextColor={colors.textTertiary}
                                value={newLinkTitle}
                                onChangeText={setNewLinkTitle}
                                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                            />
                            <TextInput
                                placeholder="URL (e.g., mywebsite.com)"
                                placeholderTextColor={colors.textTertiary}
                                value={newLinkUrl}
                                onChangeText={setNewLinkUrl}
                                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                            />
                            <TouchableOpacity
                                onPress={handleAddLink}
                                disabled={savingLink}
                                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>{savingLink ? "Saving..." : "Save Link"}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* ACCOUNT SECTION */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
                <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.borderLight }]} onPress={handleDownloadJson} disabled={downloadingJson}>
                        <Text style={styles.menuIcon}>📥</Text>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuText, { color: colors.textPrimary }]}>{downloadingJson ? "Preparing..." : "Download Data (JSON)"}</Text>
                        </View>
                        {downloadingJson ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.borderLight }]} onPress={handleDownloadPdf} disabled={downloadingPdf}>
                        <Text style={styles.menuIcon}>📄</Text>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuText, { color: colors.textPrimary }]}>{downloadingPdf ? "Generating..." : "Download Report (PDF)"}</Text>
                        </View>
                        {downloadingPdf ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>}
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem]} onPress={function () { router.push("/settings"); }}>
                        <Text style={styles.menuIcon}>⚙️</Text>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Settings</Text>
                        </View>
                        <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.danger }]}
                    onPress={handleLogout}
                >
                    <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    profileHeader: { alignItems: "center", marginTop: spacing.sm, marginBottom: spacing.sm },
    avatar: { width: 88, height: 88, borderRadius: 44, justifyContent: "center", alignItems: "center", marginBottom: spacing.md },
    avatarText: { fontSize: 36, fontWeight: "700", color: "#fff" },
    name: { fontSize: 22, fontWeight: "700" },
    username: { fontSize: 14, marginTop: 2 },
    statsRow: { flexDirection: "row", gap: spacing.sm },
    statCard: { flex: 1, borderRadius: radius.lg, padding: spacing.md, alignItems: "center", borderWidth: 1, ...shadow.sm },
    statNumber: { fontSize: 22, fontWeight: "700" },
    statLabel: { fontSize: 10, marginTop: 3, fontWeight: "500" },
    streakCard: { flexDirection: "row", alignItems: "center", borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, gap: spacing.md },
    streakEmoji: { fontSize: 26 },
    streakContent: { flex: 1 },
    streakNumber: { fontSize: 15, fontWeight: "700" },
    streakText: { fontSize: 12, marginTop: 2 },
    sectionTitle: { fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
    menu: { borderRadius: radius.lg, borderWidth: 1, overflow: "hidden", ...shadow.sm },
    menuItem: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, gap: spacing.md },
    lastMenuItem: { borderBottomWidth: 0 },
    menuIcon: { fontSize: 20 },
    menuContent: { flex: 1 },
    menuText: { fontSize: 15, fontWeight: "500" },
    menuSub: { fontSize: 11, marginTop: 2 },
    menuArrow: { fontSize: 22 },
    input: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, fontSize: 14 },
    saveBtn: { padding: spacing.md, borderRadius: radius.md, alignItems: "center", marginTop: spacing.sm },
    logoutButton: { borderRadius: radius.lg, padding: spacing.lg, alignItems: "center", borderWidth: 1, marginTop: spacing.sm },
    logoutText: { fontWeight: "600", fontSize: 15 },
});