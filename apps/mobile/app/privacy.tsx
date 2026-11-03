import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useColors, spacing, radius, shadow } from "../src/theme";

export default function PrivacyScreen() {
    var router = useRouter();
    var colors = useColors();

    var sections = [
        {
            title: "What stays private",
            items: [
                { icon: "🔒", label: "Mood check-ins", detail: "Only visible to you. Never shared." },
                { icon: "📝", label: "Journal entries", detail: "Private by default. We never read them without permission." },
                { icon: "🎯", label: "Personal goals", detail: "For your eyes only." },
                { icon: "🤖", label: "AI insights", detail: "Analyzed on your own data only. Not shared." },
            ],
        },
        {
            title: "What we collect",
            items: [
                { icon: "📧", label: "Email and password", detail: "Used to sign you in. Password is hashed." },
                { icon: "📊", label: "Mood, journal, and goal activity", detail: "To give you insights and streaks." },
                { icon: "🔔", label: "Notification preferences", detail: "So we know what to alert you about." },
            ],
        },
        {
            title: "What we never do",
            items: [
                { icon: "🚫", label: "Sell your data", detail: "Never. Your data is not a product." },
                { icon: "🚫", label: "Show ads", detail: "WellConnect is ad-free." },
                { icon: "🚫", label: "Share without consent", detail: "We won't share your data with third parties without your explicit permission." },
            ],
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={styles.backButton}>
                    <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>🔒 Privacy Center</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Your data, your control.
                </Text>

                {sections.map(function (section: any) {
                    return (
                        <View key={section.title}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
                            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                {section.items.map(function (item: any, i: number) {
                                    var isLast = i === section.items.length - 1;
                                    return (
                                        <View
                                            key={item.label}
                                            style={[
                                                styles.row,
                                                !isLast && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                                            ]}
                                        >
                                            <Text style={styles.rowIcon}>{item.icon}</Text>
                                            <View style={styles.rowContent}>
                                                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                                                <Text style={[styles.rowDetail, { color: colors.textSecondary }]}>{item.detail}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}

                {/* 👇 The "Your controls" section with Export/Delete was removed from here! */}

                <Text style={[styles.footer, { color: colors.textTertiary }]}>
                    Questions? Contact support@wellconnect.app
                </Text>
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.sm, borderBottomWidth: 1 },
    backButton: { paddingVertical: spacing.sm },
    backText: { fontSize: 15, fontWeight: "600" },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    title: { fontSize: 24, fontWeight: "700" },
    subtitle: { fontSize: 14, marginBottom: spacing.sm },
    sectionTitle: { fontSize: 13, fontWeight: "600", marginTop: spacing.sm, marginBottom: spacing.sm },
    card: {
        borderRadius: radius.lg,
        borderWidth: 1,
        overflow: "hidden",
        ...shadow.sm,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: spacing.lg,
        gap: spacing.md,
    },
    rowIcon: { fontSize: 20 },
    rowContent: { flex: 1 },
    rowLabel: { fontSize: 14, fontWeight: "600" },
    rowDetail: { fontSize: 12, marginTop: 3, lineHeight: 17 },
    footer: { fontSize: 11, textAlign: "center", marginTop: spacing.lg },
});