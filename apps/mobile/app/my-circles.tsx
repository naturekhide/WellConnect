import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useColors, spacing, radius } from "../src/theme";
import { getCircles } from "../src/api/client";

export default function MyCirclesScreen() {
    var router = useRouter();
    var colors = useColors();
    var [myCircles, setMyCircles] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);

    useEffect(function () {
        loadCircles();
    }, []);

    var loadCircles = async function () {
        try {
            var data = await getCircles();
            var joined = (data.circles || []).filter(function (c: any) {
                return c.myStatus === "approved";
            });
            setMyCircles(joined);
        } catch (e) {
            console.log("Failed to load circles", e);
        }
        setLoading(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={{ padding: spacing.sm }}>
                    <Text style={{ fontSize: 18, color: colors.textPrimary }}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>My Circles</Text>
                <TouchableOpacity onPress={function () { router.push("/circles"); }} style={{ padding: spacing.sm }}>
                    <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "600" }}>Browse</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
                {loading ? (
                    <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
                ) : myCircles.length === 0 ? (
                    <View style={{ alignItems: "center", marginTop: spacing.xxl }}>
                        <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🌿</Text>
                        <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
                            You haven't joined any circles yet.
                        </Text>
                        <TouchableOpacity
                            onPress={function () { router.push("/circles"); }}
                            style={{ marginTop: spacing.lg, backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.full }}
                        >
                            <Text style={{ color: "#fff", fontWeight: "600" }}>Discover Circles</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    myCircles.map(function (circle) {
                        return (
                            <TouchableOpacity
                                key={circle.id}
                                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={function () { router.push("/circles/" + circle.id); }}
                            >
                                <View style={[styles.emojiBox, { backgroundColor: circle.coverColor || colors.primary }]}>
                                    <Text style={{ fontSize: 24 }}>{circle.emoji || "🌿"}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.name, { color: colors.textPrimary }]}>{circle.name}</Text>
                                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                                        {circle.memberCount} members
                                    </Text>
                                </View>
                                <Text style={{ color: colors.textTertiary, fontSize: 20 }}>›</Text>
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
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, borderBottomWidth: 1 },
    title: { fontSize: 18, fontWeight: "700" },
    card: { flexDirection: "row", alignItems: "center", padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md, gap: spacing.md },
    emojiBox: { width: 48, height: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
    name: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
});