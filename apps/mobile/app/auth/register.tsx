import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useColors, spacing, radius } from "../../src/theme";

export default function RegisterScreen() {
    var router = useRouter();
    var colors = useColors();

    var [name, setName] = useState("");
    var [username, setUsername] = useState("");
    var [email, setEmail] = useState("");
    var [password, setPassword] = useState("");
    var [loading, setLoading] = useState(false);
    var [error, setError] = useState("");

    var handleSubmit = async function () {
        if (!name.trim() || !username.trim() || !email.trim() || !password) return;

        setError("");
        setLoading(true);

        try {
            var r = await fetch("https://well-connect-web.vercel.app/api/mobile/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), username: username.trim(), email: email.trim(), password }),
            });

            var data = await r.json();

            if (r.ok) {
                // Success: Navigate away. Do NOT setLoading(false) here.
                router.push({
                    pathname: "/auth/verify-email",
                    params: { email: email.trim(), password: password }
                });
                return; // Stop execution so we don't set state on an unmounted component
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("Connection failed. Check your internet.");
        }

        // Only runs if registration failed and we are staying on this screen
        setLoading(false);
    };

    var inputStyle = {
        height: 55,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        fontSize: 16,
        backgroundColor: colors.surface,
        color: colors.textPrimary,
        borderColor: colors.border,
        marginBottom: spacing.md,
    };

    var isFormValid = name.trim() && username.trim() && email.trim() && password;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>🌱</Text>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Join WellConnect</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Your digital wellbeing companion
                    </Text>
                </View>

                {error ? (
                    <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                        <Text style={{ color: colors.danger, fontSize: 14 }}>{error}</Text>
                    </View>
                ) : null}

                <TextInput
                    style={inputStyle}
                    placeholder="Full name"
                    placeholderTextColor={colors.textTertiary}
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    style={inputStyle}
                    placeholder="Username"
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                />

                <TextInput
                    style={inputStyle}
                    placeholder="Email"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={inputStyle}
                    placeholder="Password (min 8 characters)"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: isFormValid ? colors.primary : colors.border }
                    ]}
                    onPress={handleSubmit}
                    disabled={!isFormValid || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={[styles.buttonText, { color: isFormValid ? "#fff" : colors.textTertiary }]}>
                            Create Account
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={function () { router.push("/auth/login"); }} style={styles.linkBtn}>
                    <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                        Already have an account? <Text style={{ color: colors.primary, fontWeight: "600" }}>Sign in</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

var styles = StyleSheet.create({
    content: { padding: spacing.lg, paddingTop: 80, paddingBottom: 40 },
    header: { alignItems: "center", marginBottom: spacing.xxl },
    title: { fontSize: 24, fontWeight: "700" },
    subtitle: { fontSize: 14, marginTop: 4 },
    button: { height: 55, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginTop: spacing.sm },
    buttonText: { fontSize: 16, fontWeight: "600" },
    errorBox: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg },
    linkBtn: { marginTop: spacing.xl, alignItems: "center" },
});