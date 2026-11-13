import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "../src/store/authStore";
import { useThemeStore } from "../src/store/themeStore";
import { loadToken } from "../src/api/client";
import { registerForPushNotifications } from "../src/push";

// 👇 Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true, // Required
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true, // 👈 Add this for newer Expo versions
        shouldShowList: true,   // 👈 Add this for newer Expo versions
    }),
});

export default function RootLayout() {
    var { checkAuth, isAuthenticated } = useAuthStore();
    var { mode, loadTheme } = useThemeStore();
    var router = useRouter();

    useEffect(function () {
        (async function () {
            await loadTheme();
            await loadToken();
            await checkAuth();
        })();
    }, []);

    useEffect(function () {
        if (isAuthenticated) {
            registerForPushNotifications();
        }
    }, [isAuthenticated]);

    useEffect(function () {
        var subscription = Notifications.addNotificationResponseReceivedListener(function (response) {
            var link = response.notification.request.content.data?.link;
            if (link && typeof link === "string") {
                router.push(link as any);
            }
        });

        return function () { subscription.remove(); };
    }, []);

    return (
        <>
            <StatusBar style={mode === "dark" ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="auth/register" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="achievements" />
                <Stack.Screen name="notifications" />
                <Stack.Screen name="privacy" />
                <Stack.Screen name="feed/[id]" />
                <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>
        </>
    );
}