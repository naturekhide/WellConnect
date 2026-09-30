import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useAuthStore } from "../src/store/authStore";
import { loadToken } from "../src/api/client";

export default function RootLayout() {
    var { checkAuth } = useAuthStore();
    var scheme = useColorScheme();

    useEffect(function () {
        (async function () {
            await loadToken();
            await checkAuth();
        })();
    }, []);

    return (
        <>
            <StatusBar style={scheme === "dark" ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="auth/register" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="achievements" />
                <Stack.Screen name="notifications" />
                <Stack.Screen name="privacy" />
                <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>
        </>
    );
}