import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { useColors, spacing, radius, shadow } from "../src/theme";
import { reactToPost } from "../src/api/client";

var REACTIONS = [
  { type: "hug", emoji: "🤗", label: "Hug" },
  { type: "growth", emoji: "🌱", label: "Growth" },
  { type: "strength", emoji: "💪", label: "Strength" },
  { type: "grateful", emoji: "🙏", label: "Grateful" },
];

export default function FeedPostCard({ post, onReactionChange, onPress }: { post: any; onReactionChange: any; onPress: any }) {
  var colors = useColors();
  var [myReaction, setMyReaction] = useState(post.myReaction);
  var [reactions, setReactions] = useState(post.reactions);

  var timeAgo = function(d: string) {
    var diff = Date.now() - new Date(d).getTime();
    var mins = Math.floor(diff / 60000);
    var hrs = Math.floor(diff / 3600000);
    var days = Math.floor(diff / 86400000);
    if (mins < 1) return "now";
    if (mins < 60) return mins + "m";
    if (hrs < 24) return hrs + "h";
    return days + "d";
  };

  var handleReact = async function(type: string) {
    try {
      var res = await reactToPost(post.id, type);
      setReactions(res.reactions);
      setMyReaction(res.myReaction);
      if (onReactionChange) onReactionChange(post.id, res.reactions, res.myReaction);
    } catch (e) {}
  };

  var displayName = post.anonymous ? "Anonymous" : (post.author?.name || "User");
  var initials = post.anonymous ? "?" : (post.author?.name?.charAt(0) || "U");

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: post.anonymous ? colors.textTertiary : colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{displayName}</Text>
          {!post.anonymous && post.author?.username && (
            <Text style={[styles.username, { color: colors.textSecondary }]}>@{post.author.username}</Text>
          )}
        </View>
        <Text style={[styles.time, { color: colors.textTertiary }]}>{timeAgo(post.createdAt)}</Text>
      </View>

      <Text style={[styles.content, { color: colors.textPrimary }]}>{post.content}</Text>

      {post.imageUrls && post.imageUrls.length > 0 && (
        <View style={styles.imageGrid}>
          {post.imageUrls.length === 1 && (
            <Image source={{ uri: "https://well-connect-web.vercel.app" + post.imageUrls[0] }} style={styles.imageSingle} />
          )}
          {post.imageUrls.length === 2 && (
            <View style={styles.imageRow}>
              {post.imageUrls.map(function(url: string, i: number) {
                return <Image key={i} source={{ uri: "https://well-connect-web.vercel.app" + url }} style={styles.imageHalf} />;
              })}
            </View>
          )}
          {post.imageUrls.length >= 3 && (
            <View style={styles.imageRow}>
              {post.imageUrls.slice(0, 3).map(function(url: string, i: number) {
                return <Image key={i} source={{ uri: "https://well-connect-web.vercel.app" + url }} style={styles.imageThird} />;
              })}
            </View>
          )}
        </View>
      )}

      <View style={styles.reactionsRow}>
        {REACTIONS.map(function(r: any) {
          var isActive = myReaction === r.type;
          return (
            <TouchableOpacity
              key={r.type}
              style={[styles.reactionBtn, isActive && { backgroundColor: colors.primaryLight }]}
              onPress={function() { handleReact(r.type); }}
            >
              <Text style={styles.reactionEmoji}>{r.emoji}</Text>
              {reactions[r.type] > 0 && (
                <Text style={[styles.reactionCount, { color: isActive ? colors.primary : colors.textSecondary }]}>
                  {reactions[r.type]}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
        {post.replyCount > 0 && (
          <View style={styles.replyCount}>
            <Text style={[styles.replyIcon, { color: colors.textSecondary }]}>💬</Text>
            <Text style={[styles.reactionCount, { color: colors.textSecondary }]}>{post.replyCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

var styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    ...shadow.sm,
  },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  headerText: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600" },
  username: { fontSize: 12, marginTop: 1 },
  time: { fontSize: 11 },
  content: { fontSize: 15, lineHeight: 21, marginBottom: spacing.md },
  imageGrid: { marginBottom: spacing.md },
  imageSingle: { width: "100%", height: 200, borderRadius: radius.md },
  imageRow: { flexDirection: "row", gap: 4 },
  imageHalf: { flex: 1, height: 160, borderRadius: radius.md },
  imageThird: { flex: 1, height: 110, borderRadius: radius.md },
  reactionsRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  reactionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.md },
  reactionEmoji: { fontSize: 16 },
  reactionCount: { fontSize: 12, fontWeight: "600" },
  replyCount: { flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto" },
  replyIcon: { fontSize: 14 },
});