import { useColorScheme } from "react-native";

export var lightColors = {
    primary: "#059669",
    primaryDark: "#047857",
    primaryLight: "#ecfdf5",

    background: "#f8faf9",
    surface: "#ffffff",
    surfaceAlt: "#f9fafb",

    textPrimary: "#111827",
    textSecondary: "#6b7280",
    textTertiary: "#9ca3af",
    textInverse: "#ffffff",

    border: "#e5e7eb",
    borderLight: "#f3f4f6",

    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    dangerLight: "#fee2e2",

    thriving: "#10b981",
    managing: "#f59e0b",
    struggling: "#f97316",
    crisis: "#ef4444",
};

export var darkColors = {
    primary: "#10b981",
    primaryDark: "#059669",
    primaryLight: "#064e3b",

    background: "#0a0a0a",
    surface: "#171717",
    surfaceAlt: "#262626",

    textPrimary: "#f5f5f5",
    textSecondary: "#a3a3a3",
    textTertiary: "#737373",
    textInverse: "#0a0a0a",

    border: "#262626",
    borderLight: "#171717",

    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    dangerLight: "#7f1d1d",

    thriving: "#10b981",
    managing: "#f59e0b",
    struggling: "#f97316",
    crisis: "#ef4444",
};

export function useColors() {
    var scheme = useColorScheme();
    return scheme === "dark" ? darkColors : lightColors;
}

// Static export — for legacy usage, defaults to light
export var colors = lightColors;

export var spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
};

export var radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};

export var shadow = {
    sm: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
};