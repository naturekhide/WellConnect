import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useColors, spacing, radius, shadow } from "../src/theme";
import { getAuthToken } from "../src/api/client";

var API_URL = "https://well-connect-web.vercel.app";

export default function AchievementsScreen() {
    var router = useRouter();
    var colors = useColors();
    var [data, setData] = useState<any>(null);
    var [loading, setLoading] = useState(true);
    var [refreshing, setRefreshing] = useState(false);

    useEffect(function () { loadAchievements(); }, []);

    var loadAchievements = async function () {
        try {
            var token = getAuthToken();
            var res = await fetch(API_URL + "/api/achievements", {
                headers: { "Authorization": "Bearer " + token },
            });
            if (res.ok) setData(await res.json());
        } catch (e) { }
        setLoading(false);
    };

    var onRefresh = async function () {
        setRefreshing(true);
        await loadAchievements();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    var unlocked = data?.achievements?.filter(function (a: any) { return a.unlocked; }) || [];
    var locked = data?.achievements?.filter(function (a: any) { return !a.unlocked; }) || [];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={styles.backButton}>
                    <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            >
                <Text style={[styles.title, { color: colors.textPrimary }]}>🏆 Achievements</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {data?.totalUnlocked || 0} of {data?.total || 0} unlocked
                </Text>

                <View style={[styles.progressBar, { backgroundColor: colors.surfaceAlt }]}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                backgroundColor: colors.primary,
                                width: `${((data?.totalUnlocked || 0) / (data?.total || 1)) * 100}%` as any,
                            },
                        ]}
                    />
                </View>

                {unlocked.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Unlocked</Text>
                        {unlocked.map(function (a: any) {
                            return (
                                <View key={a.key} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
                                    <Text style={styles.emoji}>{a.emoji}</Text>
                                    <View style={styles.cardContent}>
                                        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{a.title}</Text>
                                        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{a.description}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </>
                )}

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Locked</Text>
                {locked.map(function (a: any) {
                    return (
                        <View key={a.key} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.6 }]}>
                            <Text style={styles.emoji}>🔒</Text>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{a.title}</Text>
                                <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{a.description}</Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.sm, borderBottomWidth: 1 },
    backButton: { paddingVertical: spacing.sm },
    backText: { fontSize: 15, fontWeight: "600" },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    title: { fontSize: 24, fontWeight: "700" },
    subtitle: { fontSize: 14, marginBottom: spacing.sm },
    progressBar: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: spacing.md },
    progressFill: { height: "100%", borderRadius: 4 },
    sectionTitle: { fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
    card: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        gap: spacing.md,
        ...shadow.sm,
    },
    emoji: { fontSize: 30 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: "600" },
    cardDescription: { fontSize: 12, marginTop: 2 },
});