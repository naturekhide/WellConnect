import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";

var API_URL = "http://localhost:3000/api";

async function getSession() {
  var res = await fetch(API_URL + "/auth/session", { credentials: "include" });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function getPosts(feed?: string) {
  var res = await fetch(API_URL + "/posts?feed=" + (feed || "for-you"), { credentials: "include" });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function FeedScreen() {
  var [posts, setPosts] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [userName, setUserName] = useState("");

  useEffect(function() {
    loadData();
  }, []);

  var loadData = async function() {
    try {
      var session = await getSession();
      setUserName(session?.user?.name || "Friend");

      var data = await getPosts("for-you");
      setPosts(data);
    } catch (e) {
      console.log("Failed to load feed:", e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.moodCard}>
          <Text style={styles.moodTitle}>🧠 How are you feeling, {userName}?</Text>
          <View style={styles.moodRow}>
            {[
              { emoji: "🟢", label: "thriving", score: 9 },
              { emoji: "🟡", label: "managing", score: 6 },
              { emoji: "🟠", label: "struggling", score: 3 },
              { emoji: "🔴", label: "crisis", score: 1 },
            ].map(function(mood) {
              return (
                <TouchableOpacity key={mood.label} style={styles.moodButton}>
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {posts.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome to WellConnect</Text>
            <Text style={styles.cardText}>Your feed will appear here once you connect with the community.</Text>
          </View>
        ) : (
          posts.map(function(post: any) {
            return (
              <View key={post.id} style={styles.card}>
                <Text style={styles.author}>{post.author?.name || "Anonymous"}</Text>
                <Text style={styles.cardText}>{post.content}</Text>
                <View style={styles.reactions}>
                  <Text style={styles.reactionText}>🤗 {post.reactions?.hug || 0}</Text>
                  <Text style={styles.reactionText}>🌱 {post.reactions?.growth || 0}</Text>
                  <Text style={styles.reactionText}>💪 {post.reactions?.strength || 0}</Text>
                  <Text style={styles.reactionText}>🙏 {post.reactions?.grateful || 0}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f2f5" },
  content: { padding: 16, gap: 12 },
  moodCard: { backgroundColor: "#dcfce7", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#bbf7d0" },
  moodTitle: { fontSize: 16, fontWeight: "600", color: "#166534", marginBottom: 12, textAlign: "center" },
  moodRow: { flexDirection: "row", gap: 16, justifyContent: "center" },
  moodButton: { padding: 8 },
  moodEmoji: { fontSize: 36 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 8 },
  cardText: { fontSize: 14, color: "#374151", lineHeight: 20 },
  author: { fontSize: 13, fontWeight: "600", color: "#16a34a", marginBottom: 4 },
  reactions: { flexDirection: "row", gap: 12, marginTop: 8 },
  reactionText: { fontSize: 13, color: "#6b7280" },
});