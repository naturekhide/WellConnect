import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";

export default function RegisterScreen() {
    var router = useRouter();
    var { register, login } = useAuthStore();
    var [name, setName] = useState("");
    var [username, setUsername] = useState("");
    var [email, setEmail] = useState("");
    var [password, setPassword] = useState("");
    var [error, setError] = useState("");
    var [loading, setLoading] = useState(false);

    var handleRegister = async function () {
        if (!name || !username || !email || !password) { setError("Please fill in all fields"); return; }
        if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
        setError("");
        setLoading(true);

        var success = await register(name, username, email, password);
        if (success) {
            await login(email, password);
            router.replace("/(tabs)/home");
        } else {
            setError("Registration failed. Username or email may already be taken.");
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
                <Text style={styles.logo}>🌱</Text>
                <Text style={styles.title}>Join WellConnect</Text>
                <Text style={styles.subtitle}>Find your people. Feel understood.</Text>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#9ca3af" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#9ca3af" value={username} onChangeText={setUsername} autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Password (min 8 characters)" placeholderTextColor="#9ca3af" value={password} onChangeText={setPassword} secureTextEntry />
                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
                </TouchableOpacity>
                <Link href="/auth/login" style={styles.link}>Already have an account? Sign in</Link>
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8faf9" },
    inner: { flexGrow: 1, justifyContent: "center", padding: 24 },
    logo: { fontSize: 48, textAlign: "center", marginBottom: 8 },
    title: { fontSize: 28, fontWeight: "700", color: "#059669", textAlign: "center" },
    subtitle: { fontSize: 16, color: "#6b7280", textAlign: "center", marginBottom: 24 },
    error: { backgroundColor: "#fee2e2", color: "#dc2626", padding: 12, borderRadius: 12, marginBottom: 12, textAlign: "center", fontSize: 14 },
    input: { backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb", color: "#111827" },
    button: { backgroundColor: "#059669", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    link: { color: "#059669", textAlign: "center", marginTop: 16, fontSize: 14 },
});