import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { searchAll } from "../src/api/client";
import { useColors, spacing, radius } from "../src/theme";

var TABS = [
    { id: "all", label: "All" },
    { id: "users", label: "Users" },
    { id: "posts", label: "Posts" },
    { id: "circles", label: "Circles" },
];

export default function SearchScreen() {
    var router = useRouter();
    var colors = useColors();
    var [q, setQ] = useState("");
    var [tab, setTab] = useState("all");
    var [results, setResults] = useState<any>({ users: [], posts: [], circles: [], journals: [] });
    var [loading, setLoading] = useState(false);

    useEffect(function () {
        var timer: any = null;
        if (q.trim().length < 2) {
            setResults({ users: [], posts: [], circles: [], journals: [] });
            setLoading(false);
            return;
        }
        setLoading(true);
        timer = setTimeout(function () { runSearch(); }, 300);
        return function () { if (timer) clearTimeout(timer); };
    }, [q]);

    var runSearch = async function () {
        try {
            var data = await searchAll(q);
            setResults(data);
        } catch (e: any) {
            // 🚨 DEBUG LOG
            console.log("🚨 SEARCH ERROR:", e.message);
        }
        setLoading(false);
    };

    // ... (keep the rest of the UI code exactly the same) ...

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

    var showUsers = (tab === "all" || tab === "users") && results.users.length > 0;
    var showPosts = (tab === "all" || tab === "posts") && results.posts.length > 0;
    var showCircles = (tab === "all" || tab === "circles") && results.circles.length > 0;

    var hasAny = showUsers || showPosts || showCircles;
    var nothingFound = q.trim().length >= 2 && !loading && !hasAny;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={styles.backBtn}>
                    <Text style={[styles.backText, { color: colors.textPrimary }]}>←</Text>
                </TouchableOpacity>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={q}
                    onChangeText={setQ}
                    placeholder="Search users, posts, circles..."
                    placeholderTextColor={colors.textTertiary}
                    autoFocus
                />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabs, { borderBottomColor: colors.border }]}>
                {TABS.map(function (t) {
                    var active = tab === t.id;
                    return (
                        <TouchableOpacity key={t.id} onPress={function () { setTab(t.id); }} style={[styles.tabBtn, { borderBottomColor: active ? colors.primary : "transparent" }]}>
                            <Text style={[styles.tabLabel, { color: active ? colors.textPrimary : colors.textSecondary, fontWeight: active ? "700" : "500" }]}>
                                {t.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {q.trim().length < 2 ? (
                    <View style={styles.emptyBox}>
                        <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🔍</Text>
                        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>Type at least 2 characters to search.</Text>
                    </View>
                ) : loading ? (
                    <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
                ) : nothingFound ? (
                    <View style={styles.emptyBox}>
                        <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🌿</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No results for "{q}"</Text>
                    </View>
                ) : (
                    <>
                        {showUsers && (
                            <Section title="Users" colors={colors}>
                                {results.users.map(function (u: any) {
                                    return <Row key={u.id} icon="👤" title={u.name} subtitle={"@" + (u.username || "user")} onPress={function () { router.push("/users/" + u.id); }} colors={colors} />;
                                })}
                            </Section>
                        )}
                        {showCircles && (
                            <Section title="Circles" colors={colors}>
                                {results.circles.map(function (c: any) {
                                    return <Row key={c.id} icon={c.emoji || "🌿"} title={c.name} subtitle={c.memberCount + " members"} onPress={function () { router.push("/circles/" + c.id); }} colors={colors} />;
                                })}
                            </Section>
                        )}
                        {showPosts && (
                            <Section title="Posts" colors={colors}>
                                {results.posts.map(function (p: any) {
                                    return <Row key={p.id} icon="📝" title={p.content?.slice(0, 80) || "(no content)"} subtitle={(p.author?.name || "User") + " · " + timeAgo(p.createdAt)} onPress={function () { router.push("/feed/" + p.id); }} colors={colors} />;
                                })}
                            </Section>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

function Section({ title, children, colors }: any) {
    return (
        <View>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
            {children}
        </View>
    );
}

function Row({ icon, title, subtitle, onPress, colors }: any) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.row, { borderBottomColor: colors.border }]} activeOpacity={0.7}>
            <Text style={{ fontSize: 22, flexShrink: 0 }}>{icon}</Text>
            <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]} numberOfLines={1}>{subtitle}</Text>
            </View>
            <Text style={{ fontSize: 16, color: colors.textTertiary }}>›</Text>
        </TouchableOpacity>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    topBar: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, borderBottomWidth: 1 },
    backBtn: { width: 32, height: 32, justifyContent: "center" },
    backText: { fontSize: 22 },
    input: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, fontSize: 15 },
    tabs: { flexGrow: 0, borderBottomWidth: 1, paddingHorizontal: spacing.lg },
    tabBtn: { paddingVertical: spacing.md, marginRight: spacing.lg, borderBottomWidth: 2 },
    tabLabel: { fontSize: 14 },
    content: { paddingBottom: spacing.xxl },
    emptyBox: { alignItems: "center", paddingVertical: spacing.xxl * 2, paddingHorizontal: spacing.lg },
    emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
    sectionTitle: { fontSize: 13, fontWeight: "600", paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
    row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1 },
    rowTitle: { fontSize: 14, fontWeight: "600" },
    rowSub: { fontSize: 12, marginTop: 2 },
});