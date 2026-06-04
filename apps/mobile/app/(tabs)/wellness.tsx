import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function WellnessScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>📚 Wellness Library</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>5 Grounding Techniques</Text>
          <Text style={styles.cardText}>Anxiety relief · 4 min read</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Understanding Grief</Text>
          <Text style={styles.cardText}>Grief support · 5 min read</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Burnout Recovery</Text>
          <Text style={styles.cardText}>Stress management · 6 min read</Text>
        </View>
      </ScrollView>
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 8 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 4 },
  cardText: { fontSize: 13, color: "#6b7280" },
});