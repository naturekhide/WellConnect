import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { getCircles } from "../../src/api/client";
import { useColors, spacing, radius } from "../../src/theme";

export default function CirclesScreen() {
    var router = useRouter();
    var colors = useColors();
    var [circles, setCircles] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [refreshing, setRefreshing] = useState(false);
    var [q, setQ] = useState("");

    useEffect(function () { load(); }, []);

    var load = async function () {
        try {
            var data = await getCircles();
            setCircles(data.circles || []);
        } catch (e) { }
        setLoading(false);
    };

    var onRefresh = async function () {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    var myCircles = circles.filter(function (c: any) {
        return c.myStatus === "approved" || c.myStatus === "pending";
    });

    var discover = circles.filter(function (c: any) { return !c.myStatus; });

    var filteredDiscover = q
        ? discover.filter(function (c: any) {
            return c.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
        })
        : discover;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>🌿 Circles</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Communities built around what matters
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={function () { router.push("/circles/create"); }}
                        style={[styles.createBtn, { backgroundColor: colors.primary }]}
                    >
                        <Text style={styles.createBtnText}>+ Create</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <TextInput
                    style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="Search circles..."
                    placeholderTextColor={colors.textTertiary}
                    value={q}
                    onChangeText={setQ}
                />

                {loading ? (
                    <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
                ) : (
                    <>
                        {myCircles.length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>My Circles</Text>
                                {myCircles.map(function (c: any) {
                                    return <CircleCard key={c.id} circle={c} colors={colors} router={router} />;
                                })}
                            </>
                        )}

                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Discover</Text>
                        {filteredDiscover.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                                {q ? "No circles match your search." : "No circles yet. Be the first to create one!"}
                            </Text>
                        ) : (
                            filteredDiscover.map(function (c: any) {
                                return <CircleCard key={c.id} circle={c} colors={colors} router={router} />;
                            })
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

function CircleCard({ circle, colors, router }: any) {
    return (
        <TouchableOpacity
            onPress={function () { router.push("/circles/" + circle.id); }}
            style={[styles.card, { backgroundColor: colors.surface }]}
        >
            <View style={[styles.cardEmoji, { backgroundColor: circle.coverColor || colors.primary }]}>
                <Text style={{ fontSize: 24 }}>{circle.emoji || "🌿"}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <Text style={[styles.cardName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {circle.name}
                    </Text>
                    {circle.isPrivate && (
                        <Text style={[styles.badge, { color: colors.textSecondary, borderColor: colors.border }]}>private</Text>
                    )}
                    {circle.myStatus === "pending" && (
                        <Text style={[styles.badgePrimary, { color: colors.primary, backgroundColor: colors.primaryLight }]}>pending</Text>
                    )}
                </View>
                <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                    {circle.memberCount} {circle.memberCount === 1 ? "member" : "members"} · {circle.postCount} {circle.postCount === 1 ? "post" : "posts"}
                </Text>
                {circle.description ? (
                    <Text style={[styles.cardDesc, { color: colors.textTertiary }]} numberOfLines={1}>
                        {circle.description}
                    </Text>
                ) : null}
            </View>
            <Text style={{ fontSize: 16, color: colors.textTertiary }}>›</Text>
        </TouchableOpacity>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, borderBottomWidth: 1 },
    title: { fontSize: 22, fontWeight: "700" },
    subtitle: { fontSize: 13, marginTop: 2 },
    createBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full },
    createBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    searchInput: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, fontSize: 14, marginBottom: spacing.lg },
    sectionTitle: { fontSize: 13, fontWeight: "600", marginBottom: spacing.sm, marginTop: spacing.md },
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.sm,
    },
    cardEmoji: {
        width: 48, height: 48, borderRadius: radius.md,
        alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    cardName: { fontSize: 15, fontWeight: "700" },
    cardMeta: { fontSize: 12, marginTop: 2 },
    cardDesc: { fontSize: 12, marginTop: 2 },
    badge: {
        fontSize: 10, fontWeight: "600", paddingHorizontal: 6, paddingVertical: 1,
        borderRadius: 4, borderWidth: 1,
    },
    badgePrimary: {
        fontSize: 10, fontWeight: "600", paddingHorizontal: 6, paddingVertical: 1,
        borderRadius: 4,
    },
    emptyText: { fontSize: 14, textAlign: "center", paddingVertical: spacing.xl },
});