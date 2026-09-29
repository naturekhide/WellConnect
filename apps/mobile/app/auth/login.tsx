import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { useColors, spacing, radius } from "../../src/theme";

export default function LoginScreen() {
    var router = useRouter();
    var colors = useColors();
    var { login } = useAuthStore();
    var [identifier, setIdentifier] = useState("");
    var [password, setPassword] = useState("");
    var [error, setError] = useState("");
    var [loading, setLoading] = useState(false);

    var handleLogin = async function () {
        if (!identifier || !password) {
            setError("Please fill in all fields");
            return;
        }
        setError("");
        setLoading(true);
        var success = await login(identifier, password);
        setLoading(false);
        if (success) {
            router.replace("/(tabs)/home");
        } else {
            setError("Invalid email/username or password");
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.inner}>
                <Text style={styles.logo}>🌱</Text>
                <Text style={[styles.title, { color: colors.primary }]}>WellConnect</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Welcome back</Text>

                {error ? (
                    <Text style={[styles.error, { backgroundColor: colors.dangerLight, color: colors.danger }]}>{error}</Text>
                ) : null}

                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="Email or username"
                    placeholderTextColor={colors.textTertiary}
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                />

                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="Password"
                    placeholderTextColor={colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
                </TouchableOpacity>

                <Link href="/auth/register" style={[styles.link, { color: colors.primary }]}>
                    Don't have an account? Register
                </Link>
            </View>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1, justifyContent: "center", padding: 24 },
    logo: { fontSize: 48, textAlign: "center", marginBottom: 8 },
    title: { fontSize: 28, fontWeight: "700", textAlign: "center" },
    subtitle: { fontSize: 16, textAlign: "center", marginBottom: 32 },
    error: { padding: 12, borderRadius: 12, marginBottom: 12, textAlign: "center", fontSize: 14 },
    input: { borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, borderWidth: 1 },
    button: { borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    link: { textAlign: "center", marginTop: 16, fontSize: 14 },
});