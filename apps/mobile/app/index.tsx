import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet, Image, Text, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../src/store/authStore";
import { useColors } from "../src/theme";

const { width } = Dimensions.get("window");

SplashScreen.preventAutoHideAsync();

export default function Index() {
    var colors = useColors();
    var router = useRouter();
    var { isAuthenticated, isLoading, checkAuth } = useAuthStore();

    var [isReady, setIsReady] = useState(false);

    // Animation values
    var fadeAnim = useRef(new Animated.Value(0)).current;
    var scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(function () {
        checkAuth();

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

        setTimeout(function () {
            SplashScreen.hideAsync();
            setIsReady(true);
        }, 100);
    }, []);

    useEffect(function () {
        if (!isLoading) {
            var timer = setTimeout(async function () {
                if (isAuthenticated) {
                    var hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");
                    if (!hasSeen) {
                        router.replace("/onboarding");
                    } else {
                        router.replace("/(tabs)/home");
                    }
                } else {
                    router.replace("/auth/login");
                }
            }, 2500);

            return function () { clearTimeout(timer); };
        }
    }, [isLoading, isAuthenticated]);

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