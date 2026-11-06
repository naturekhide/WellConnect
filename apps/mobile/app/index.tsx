import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Image, Text, Dimensions } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import { useColors } from "../src/theme";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
    var colors = useColors();
    var { isAuthenticated, isLoading, checkAuth } = useAuthStore();

    // Animation values
    var fadeAnim = useRef(new Animated.Value(0)).current;
    var scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(function () {
        // 1. Check auth status in the background
        checkAuth();

        // 2. Start the animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // 3. If the app is still checking the login status, show the animation
    // (This acts as a natural loading screen instead of a spinning wheel)
    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: "center" }}>
                    <Image 
                        source={require("../assets/wellconnect.png")} 
                        style={styles.logo} 
                        resizeMode="contain"
                    />
                    <Text style={[styles.title, { color: colors.primary }]}>WellConnect</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Connect • Feel • Grow</Text>
                </Animated.View>
            </View>
        );
    }

    // 4. Once loading is done, redirect to the right place
    if (isAuthenticated) {
        return <Redirect href="/(tabs)/home" />;
    }

    return <Redirect href="/auth/login" />;
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: width * 0.4,
        height: width * 0.4,
        marginBottom: 20,
        borderRadius: 20, 
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 8,
        letterSpacing: 1,
    }
});