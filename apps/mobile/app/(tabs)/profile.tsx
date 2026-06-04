import { View, Text, StyleSheet } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>U</Text>
      </View>
      <Text style={styles.name}>My Profile</Text>
      <Text style={styles.subtitle}>Your stats and mood calendar will appear here.</Text>
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5", justifyContent: "center", alignItems: "center", padding: 24 },
  avatar: { height: 80, width: 80, borderRadius: 40, backgroundColor: "#16a34a", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: "700", color: "#fff" },
  name: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6b7280" },
});