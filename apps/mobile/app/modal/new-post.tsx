import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useColors, spacing, radius, shadow } from "../../src/theme";

var options = [
    { icon: "🧠", title: "Mood Check-in", subtitle: "How are you feeling?", route: "/(tabs)/home" },
    { icon: "📝", title: "Write Journal", subtitle: "Reflect on your day", route: "/(tabs)/journal" },
    { icon: "🎯", title: "Add Goal", subtitle: "Track something new", route: "/(tabs)/goals" },
];

export default function NewPostModal() {
    var router = useRouter();
    var colors = useColors();

    var handleSelect = function (route: string) {
        router.back();
        setTimeout(function () { router.push(route as any); }, 200);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>What's on your mind?</Text>
                <TouchableOpacity
                    onPress={function () { router.back(); }}
                    style={[styles.closeButton, { backgroundColor: colors.surfaceAlt }]}
                >
                    <Text style={[styles.closeText, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {options.map(function (opt: any) {
                    return (
                        <TouchableOpacity
                            key={opt.title}
                            style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={function () { handleSelect(opt.route); }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.optionIcon}>{opt.icon}</Text>
                            <View style={styles.optionContent}>
                                <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>{opt.title}</Text>
                                <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{opt.subtitle}</Text>
                            </View>
                            <Text style={[styles.optionArrow, { color: colors.textTertiary }]}>›</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    title: { fontSize: 22, fontWeight: "700" },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    closeText: { fontSize: 16 },
    content: { padding: spacing.lg, gap: spacing.md },
    option: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        gap: spacing.md,
        ...shadow.sm,
    },
    optionIcon: { fontSize: 28 },
    optionContent: { flex: 1 },
    optionTitle: { fontSize: 16, fontWeight: "600" },
    optionSubtitle: { fontSize: 13, marginTop: 2 },
    optionArrow: { fontSize: 24 },
});