import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../../src/store/authStore"; // <-- Import store
import { useColors, spacing, radius } from "../../src/theme";

export default function VerifyEmailScreen() {
    var router = useRouter();
    var params = useLocalSearchParams();
    var colors = useColors();
    var { verifyEmail } = useAuthStore(); // <-- Get the new function

    var [code, setCode] = useState("");
    var [loading, setLoading] = useState(false);
    var [error, setError] = useState("");

    var email = params.email as string;

    var handleSubmit = async function () {
        if (!code || code.length < 6) return;
        setError("");
        setLoading(true);

        // Call the store function
        var result = await verifyEmail(email, code.trim());

        if (result.success) {
            router.replace("/(tabs)/home");
        } else {
            setError(result.error || "Verification failed");
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <TouchableOpacity style={styles.backBtn} onPress={function () { router.back(); }}>
                <Text style={[styles.backText, { color: colors.textSecondary }]}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={{ fontSize: 48, marginBottom: spacing.md }}>✉️</Text>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Verify your email</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        We sent a 6-digit code to {email}
                    </Text>
                </View>

                {error ? (
                    <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                        <Text style={{ color: colors.danger, fontSize: 14 }}>{error}</Text>
                    </View>
                ) : null}

                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border, textAlign: "center", letterSpacing: 8, fontSize: 24, fontWeight: "700" }]}
                    placeholder="000000"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                />

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: code.length === 6 ? colors.primary : colors.border }]}
                    onPress={handleSubmit}
                    disabled={code.length < 6 || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={[styles.buttonText, { color: code.length === 6 ? "#fff" : colors.textTertiary }]}>
                            Verify Email
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

var styles = StyleSheet.create({
    // ... keep your existing styles here ...
    container: { flex: 1, padding: spacing.lg, paddingTop: 60 },
    backBtn: { marginBottom: spacing.xl },
    backText: { fontSize: 15, fontWeight: "500" },
    content: { flex: 1, justifyContent: "center", paddingBottom: 100 },
    header: { alignItems: "center", marginBottom: spacing.xxl },
    title: { fontSize: 24, fontWeight: "700", marginBottom: spacing.sm },
    subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
    input: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.lg },
    button: { padding: spacing.md, borderRadius: radius.md, alignItems: "center" },
    buttonText: { fontSize: 15, fontWeight: "600" },
    errorBox: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg },
});