import { View, StyleSheet } from "react-native";
import { useColors, radius, spacing, shadow } from "../theme";

export default function Card({ children, variant, style }: { children: any; variant?: string; style?: any }) {
    var colors = useColors();

    var variantStyle: any = {};
    if (variant === "insight") {
        variantStyle = { borderLeftWidth: 4, borderLeftColor: colors.primary };
    }

    return (
        <View
            style={[
                {
                    backgroundColor: colors.surface,
                    borderRadius: radius.lg,
                    padding: spacing.lg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    ...shadow.sm,
                },
                variantStyle,
                style,
            ]}
        >
            {children}
        </View>
    );
}