import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useColors, spacing, radius, shadow } from "../../src/theme";

var upcomingFeatures = [
    { emoji: "🌱", title: "Micro-communities", description: "Small groups around shared goals — fitness, mindfulness, studying, faith.", status: "Coming soon" },
    { emoji: "💬", title: "Supportive messaging", description: "Real conversation with people who understand. No likes, no comparison.", status: "Coming soon" },
    { emoji: "🤝", title: "Accountability partners", description: "Pair up with someone on the same journey. Check in on each other.", status: "Coming soon" },
    { emoji: "🌍", title: "Campus communities", description: "Start with KNUST. Grow to campuses across Africa and beyond.", status: "Planned" },
];

export default function ConnectScreen() {
    var colors = useColors();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>🌍 Connect</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Connection designed around how you feel.</Text>

                <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.primary }]}>
                    <Text style={styles.heroEmoji}>🌱</Text>
                    <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>Not another feed</Text>
                    <Text style={[styles.heroText, { color: colors.textSecondary }]}>
                        WellConnect's social layer is being built with one rule: it must make you feel better, not worse. No infinite scroll. No engagement bait. No comparison.
                    </Text>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>What's coming</Text>

                {upcomingFeatures.map(function (feature: any) {
                    return (
                        <View key={feature.title} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardEmoji}>{feature.emoji}</Text>
                                <View style={styles.cardHeaderText}>
                                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{feature.title}</Text>
                                    <Text style={[styles.cardStatus, { color: colors.primary }]}>{feature.status}</Text>
                                </View>
                            </View>
                            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{feature.description}</Text>
                        </View>
                    );
                })}

                <View style={[styles.footerCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                    <Text style={styles.footerEmoji}>💚</Text>
                    <Text style={[styles.footerText, { color: colors.primary }]}>
                        For now, focus on your daily check-in, journal, and goals. Connection comes when you're ready.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    title: { fontSize: 24, fontWeight: "700" },
    subtitle: { fontSize: 14, marginBottom: spacing.sm },
    heroCard: {
        borderRadius: radius.lg,
        padding: spacing.xl,
        borderWidth: 1,
        borderLeftWidth: 4,
        ...shadow.sm,
    },
    heroEmoji: { fontSize: 32, marginBottom: spacing.sm },
    heroTitle: { fontSize: 18, fontWeight: "700", marginBottom: spacing.sm },
    heroText: { fontSize: 14, lineHeight: 21 },
    sectionTitle: { fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
    card: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        ...shadow.sm,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
    cardEmoji: { fontSize: 26 },
    cardHeaderText: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: "600" },
    cardStatus: { fontSize: 10, fontWeight: "600", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
    cardDescription: { fontSize: 13, lineHeight: 19 },
    footerCard: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    footerEmoji: { fontSize: 24 },
    footerText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: "500" },
});