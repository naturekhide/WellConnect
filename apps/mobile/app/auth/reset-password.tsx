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
    Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColors, spacing, radius } from "../../src/theme";

export default function ResetPasswordScreen() {
    var router = useRouter();
    var params = useLocalSearchParams();
    var colors = useColors();

    var [email, setEmail] = useState((params.email as string) || "");
    var [code, setCode] = useState("");
    var [password, setPassword] = useState("");
    var [loading, setLoading] = useState(false);
    var [error, setError] = useState("");

    var handleSubmit = async function () {
        if (!email.trim() || !code.trim() || !password) return;
        setError("");
        setLoading(true);

        try {
            var r = await fetch("https://well-connect-web.vercel.app/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword: password }),
            });
            var data = await r.json();

            if (r.ok) {
                Alert.alert("Success", "Password updated. Please sign in.", [
                    { text: "OK", onPress: function () { router.replace("/auth/login"); } }
                ]);
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
                    <Text style={{ fontSize: 48, marginBottom: spacing.md }}>🔐</Text>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Reset Password</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Enter the code sent to your email and your new password.
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

                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border, textAlign: "center", letterSpacing: 8, fontSize: 20, fontWeight: "700" }]}
                    placeholder="000000"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                />

                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="New Password (min 8 chars)"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: email && code && password ? colors.primary : colors.border }]}
                    onPress={handleSubmit}
                    disabled={!email || !code || !password || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={[styles.buttonText, { color: email && code && password ? "#fff" : colors.textTertiary }]}>
                            Update Password
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