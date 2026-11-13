import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors, spacing, radius } from "../src/theme";

var { width } = Dimensions.get("window");

var slides = [
    {
        emoji: "🌱",
        title: "Welcome to WellConnect",
        description: "Your safe space for personal growth, reflection, and meaningful connection.",
    },
    {
        emoji: "💬",
        title: "Connect with Circles",
        description: "Join communities built around what matters. Share moments, support each other, and grow together.",
    },
    {
        emoji: "🧠",
        title: "Track Your Wellbeing",
        description: "Check in with your mood, write journal entries, and set goals to understand yourself better.",
    },
];

export default function OnboardingScreen() {
    var router = useRouter();
    var colors = useColors();
    var [currentSlide, setCurrentSlide] = useState(0);

    var handleNext = async function () {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            // Finish onboarding
            await AsyncStorage.setItem("hasSeenOnboarding", "true");
            router.replace("/(tabs)/home");
        }
    };

    var handleSkip = async function () {
        await AsyncStorage.setItem("hasSeenOnboarding", "true");
        router.replace("/(tabs)/home");
    };

    var slide = slides[currentSlide];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Skip Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleSkip}>
                    <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.emoji}>{slide.emoji}</Text>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{slide.title}</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>{slide.description}</Text>
            </View>

            {/* Dots & Button */}
            <View style={styles.footer}>
                <View style={styles.dotsContainer}>
                    {slides.map(function (_, index) {
                        return (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    { backgroundColor: index === currentSlide ? colors.primary : colors.border },
                                ]}
                            />
                        );
                    })}
                </View>

                <TouchableOpacity
                    onPress={handleNext}
                    style={[styles.button, { backgroundColor: colors.primary }]}
                >
                    <Text style={styles.buttonText}>
                        {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: spacing.lg, alignItems: "flex-end" },
    skipText: { fontSize: 15, fontWeight: "600" },
    content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: spacing.xl },
    emoji: { fontSize: 80, marginBottom: spacing.xl },
    title: { fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: spacing.md },
    description: { fontSize: 16, lineHeight: 24, textAlign: "center" },
    footer: { padding: spacing.xl, paddingBottom: 60 },
    dotsContainer: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: spacing.xl },
    dot: { width: 10, height: 10, borderRadius: 5 },
    button: { padding: spacing.lg, borderRadius: radius.full, alignItems: "center" },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});