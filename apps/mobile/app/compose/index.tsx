import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useColors, spacing, radius } from "../../src/theme";

export default function ComposeMenuScreen() {
    var router = useRouter();
    var colors = useColors();

    var menuItems = [
        {
            title: "Share a Moment",
            subtitle: "Post to the community feed",
            emoji: "✨",
            route: "/compose/moment"
        },
        {
            title: "Mood Check-in",
            subtitle: "How are you feeling?",
            emoji: "🧠",
            route: "/(tabs)/home" // Assuming mood check-in is on the home screen
        },
        {
            title: "Write Journal",
            subtitle: "Reflect on your day",
            emoji: "📝",
            route: "/(tabs)/journal"
        },
        {
            title: "Add Goal",
            subtitle: "Track something new",
            emoji: "🎯",
            route: "/(tabs)/goals"
        }
    ];

    return (
        <View style={[styles.container, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={function () { router.back(); }}
            />

            <View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>What's on your mind?</Text>
                    <TouchableOpacity onPress={function () { router.back(); }} style={[styles.closeBtn, { backgroundColor: colors.surface }]}>
                        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ gap: spacing.sm }}>
                    {menuItems.map(function (item, index) {
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={function () {
                                    router.back(); // Close the menu
                                    setTimeout(function () { router.push(item.route as any); }, 100);
                                }}
                            >
                                <View style={styles.iconContainer}>
                                    <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                                </View>
                                <Text style={{ color: colors.textTertiary, fontSize: 20 }}>›</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "flex-end" },
    backdrop: { ...StyleSheet.absoluteFillObject },
    sheet: {
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        padding: spacing.lg,
        paddingBottom: 40,
        borderWidth: 1,
        borderBottomWidth: 0
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
    title: { fontSize: 18, fontWeight: "700" },
    closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    menuItem: { flexDirection: "row", alignItems: "center", padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md },
    iconContainer: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    itemTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
    itemSub: { fontSize: 13 },
});