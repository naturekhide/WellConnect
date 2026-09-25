import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";

export default function LoginScreen() {
    var router = useRouter();
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
        <View style={styles.container}>
            <View style={styles.inner}>
                <Text style={styles.logo}>🌱</Text>
                <Text style={styles.title}>WellConnect</Text>
                <Text style={styles.subtitle}>Welcome back</Text>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TextInput style={styles.input} placeholder="Email or username" placeholderTextColor="#9ca3af" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9ca3af" value={password} onChangeText={setPassword} secureTextEntry />

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
                </TouchableOpacity>

                <Link href="/auth/register" style={styles.link}>Don't have an account? Register</Link>
            </View>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8faf9" },
    inner: { flex: 1, justifyContent: "center", padding: 24 },
    logo: { fontSize: 48, textAlign: "center", marginBottom: 8 },
    title: { fontSize: 28, fontWeight: "700", color: "#059669", textAlign: "center" },
    subtitle: { fontSize: 16, color: "#6b7280", textAlign: "center", marginBottom: 32 },
    error: { backgroundColor: "#fee2e2", color: "#dc2626", padding: 12, borderRadius: 12, marginBottom: 12, textAlign: "center", fontSize: 14 },
    input: { backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb", color: "#111827" },
    button: { backgroundColor: "#059669", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    link: { color: "#059669", textAlign: "center", marginTop: 16, fontSize: 14 },
});