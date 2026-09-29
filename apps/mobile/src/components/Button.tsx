import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useColors, radius, spacing } from "../theme";
import { tapLight } from "../haptics";

export default function Button({
    label,
    onPress,
    variant,
    loading,
    disabled,
}: {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "danger";
    loading?: boolean;
    disabled?: boolean;
}) {
    var colors = useColors();
    var v = variant || "primary";
    var isDisabled = disabled || loading;

    var bgColor = colors.primary;
    var textColor = colors.textInverse;
    var borderColor = "transparent";

    if (v === "secondary") {
        bgColor = colors.surface;
        textColor = colors.textPrimary;
        borderColor = colors.border;
    }
    if (v === "danger") {
        bgColor = colors.surface;
        textColor = colors.danger;
        borderColor = "#fca5a5";
    }

    var handlePress = function () {
        if (isDisabled) return;
        tapLight();
        onPress();
    };

    return (
        <TouchableOpacity
            style={{
                backgroundColor: bgColor,
                borderRadius: radius.md,
                paddingVertical: spacing.md + 2,
                alignItems: "center",
                borderWidth: borderColor === "transparent" ? 0 : 1,
                borderColor: borderColor,
                opacity: isDisabled ? 0.4 : 1,
            }}
            onPress={handlePress}
            disabled={isDisabled}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={v === "secondary" ? colors.textPrimary : colors.textInverse} />
            ) : (
                <Text style={{ color: textColor, fontSize: 15, fontWeight: "600" }}>{label}</Text>
            )}
        </TouchableOpacity>
    );
}