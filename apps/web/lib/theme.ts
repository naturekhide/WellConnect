"use client";

import { useEffect, useState } from "react";

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
};

export var S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export var R = { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 };

export function useColors() {
    var [isDark, setIsDark] = useState(false);

    useEffect(function () {
        var mq = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mq.matches);

        var handler = function (e: any) { setIsDark(e.matches); };
        mq.addEventListener("change", handler);
        return function () { mq.removeEventListener("change", handler); };
    }, []);

    return isDark ? darkColors : lightColors;
}
export var C = lightColors;