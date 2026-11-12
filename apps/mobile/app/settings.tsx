import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useColors, spacing, radius, shadow } from "../src/theme";
import { useThemeStore } from "../src/store/themeStore"; // 👈 Import the theme store

export default function SettingsScreen() {
    var router = useRouter();
    var colors = useColors();
    var { mode, toggleTheme } = useThemeStore(); // 👈 Get current mode and toggle function

    var [pushEnabled, setPushEnabled] = useState(true);
    var [analyticsEnabled, setAnalyticsEnabled] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={styles.backButton}>
                    <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>App Preferences</Text>

                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>

                    {/* 🚨 DARK MODE TOGGLE */}
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

                    {/* PUSH NOTIFICATIONS TOGGLE */}
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

                    {/* ANALYTICS TOGGLE */}
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

                <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: spacing.lg }]}>About</Text>

                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.row}>
                        <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>App Version</Text>
                        <Text style={{ color: colors.textTertiary }}>1.0.0</Text>
                    </View>
                </View>

            </ScrollView>
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
        paddingTop: 60,
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
});