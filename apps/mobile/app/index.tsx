import { useEffect } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../src/store/authStore";

export default function Index() {
    var { isAuthenticated, isLoading, checkAuth } = useAuthStore();

    useEffect(function () {
        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8faf9" }}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)/home" />;
    }

    return <Redirect href="/auth/login" />;
}