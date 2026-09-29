import { View, Text } from "react-native";
import { useColors, spacing, radius, shadow } from "../theme";

export default function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
    var colors = useColors();

    return (
        <View
            style={{
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                padding: spacing.xxl,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
                ...shadow.sm,
            }}
        >
            <Text style={{ fontSize: 32, marginBottom: spacing.sm }}>{emoji}</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: spacing.xs }}>{title}</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: "center" }}>{subtitle}</Text>
        </View>
    );
}