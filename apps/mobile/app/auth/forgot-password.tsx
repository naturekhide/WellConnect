import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useColors, spacing, radius } from "../../src/theme";

export default function ForgotPasswordScreen() {
    var router = useRouter();
    var colors = useColors();
    var [email, setEmail] = useState("");
    var [loading, setLoading] = useState(false);
    var [error, setError] = useState("");

    var handleSubmit = async function () {
        if (!email.trim()) return;
        setError("");
        setLoading(true);

        try {
            var r = await fetch("https://well-connect-web.vercel.app/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            var data = await r.json();

            if (r.ok) {
                router.push({ pathname: "/auth/reset-password", params: { email: email.trim() } });
            } else {
                setError(data.error || "Something went wrong");
            }
        } catch (err) {
            setError("Connection failed");
        }
        setLoading(false);
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
                    <Text style={{ fontSize: 48, marginBottom: spacing.md }}>🔑</Text>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Forgot Password</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Enter your email and we'll send you a 6-digit code.
                    </Text>
                </View>

                {error ? (
                    <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                        <Text style={{ color: colors.danger, fontSize: 14 }}>{error}</Text>
                    </View>
                ) : null}

                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="Email address"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: email.trim() ? colors.primary : colors.border }]}
                    onPress={handleSubmit}
                    disabled={!email.trim() || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={[styles.buttonText, { color: email.trim() ? "#fff" : colors.textTertiary }]}>
                            Send Reset Code
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.lg, paddingTop: 60 },
    backBtn: { marginBottom: spacing.xl },
    backText: { fontSize: 15, fontWeight: "500" },
    content: { flex: 1, justifyContent: "center", paddingBottom: 100 },
    header: { alignItems: "center", marginBottom: spacing.xxl },
    title: { fontSize: 24, fontWeight: "700", marginBottom: spacing.sm },
    subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
    input: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, fontSize: 15, marginBottom: spacing.lg },
    button: { padding: spacing.md, borderRadius: radius.md, alignItems: "center" },
    buttonText: { fontSize: 15, fontWeight: "600" },
    errorBox: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg },
});