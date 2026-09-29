import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { useColors } from "../../src/theme";

export default function RegisterScreen() {
    var router = useRouter();
    var colors = useColors();
    var { register } = useAuthStore();
    var [name, setName] = useState("");
    var [username, setUsername] = useState("");
    var [email, setEmail] = useState("");
    var [password, setPassword] = useState("");
    var [error, setError] = useState("");
    var [loading, setLoading] = useState(false);

    var handleRegister = async function () {
        if (!name || !username || !email || !password) {
            setError("Please fill in all fields");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        setError("");
        setLoading(true);
        var result = await register(name, username, email, password);
        setLoading(false);
        if (result.success) {
            router.replace("/(tabs)/home");
        } else {
            setError(result.error || "Registration failed");
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
                <Text style={styles.logo}>🌱</Text>
                <Text style={[styles.title, { color: colors.primary }]}>Join WellConnect</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Find your people. Feel understood.</Text>

                {error ? (
                    <Text style={[styles.error, { backgroundColor: colors.dangerLight, color: colors.danger }]}>{error}</Text>
                ) : null}

                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="Full name"
                    placeholderTextColor={colors.textTertiary}
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="Username"
                    placeholderTextColor={colors.textTertiary}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="Email"
                    placeholderTextColor={colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="Password (min 8 characters)"
                    placeholderTextColor={colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
                </TouchableOpacity>

                <Link href="/auth/login" style={[styles.link, { color: colors.primary }]}>
                    Already have an account? Sign in
                </Link>
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flexGrow: 1, justifyContent: "center", padding: 24 },
    logo: { fontSize: 48, textAlign: "center", marginBottom: 8 },
    title: { fontSize: 28, fontWeight: "700", textAlign: "center" },
    subtitle: { fontSize: 16, textAlign: "center", marginBottom: 24 },
    error: { padding: 12, borderRadius: 12, marginBottom: 12, textAlign: "center", fontSize: 14 },
    input: { borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, borderWidth: 1 },
    button: { borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    link: { textAlign: "center", marginTop: 16, fontSize: 14 },
});