import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌱 WellConnect</Text>
      <Text style={styles.title}>Create your account</Text>
      <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#9ca3af" />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af" keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9ca3af" secureTextEntry />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      <Link href="/auth/login" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5", justifyContent: "center", padding: 24 },
  logo: { fontSize: 28, fontWeight: "700", color: "#16a34a", textAlign: "center", marginBottom: 8 },
  title: { fontSize: 18, color: "#6b7280", textAlign: "center", marginBottom: 32 },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb", color: "#111827" },
  button: { backgroundColor: "#16a34a", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { color: "#16a34a", textAlign: "center", marginTop: 16, fontSize: 14 },
});