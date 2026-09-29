import { TextInput, TextInputProps } from "react-native";
import { useColors, radius, spacing } from "../theme";

export default function Input({ style, ...props }: TextInputProps) {
    var colors = useColors();

    return (
        <TextInput
            style={[
                {
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.md,
                    padding: spacing.md + 2,
                    fontSize: 15,
                    color: colors.textPrimary,
                    borderWidth: 1,
                    borderColor: colors.border,
                },
                style,
            ]}
            placeholderTextColor={colors.textTertiary}
            {...props}
        />
    );
}