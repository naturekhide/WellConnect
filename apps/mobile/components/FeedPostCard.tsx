import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useColors, spacing, radius } from "../src/theme";
import { reactToPost, getAuthToken } from "../src/api/client";

var REACTIONS = [
    { type: "hug", emoji: "🤗" },
    { type: "growth", emoji: "🌱" },
    { type: "strength", emoji: "💪" },
    { type: "grateful", emoji: "🙏" },
];

// We leave this empty because Vercel Blob returns absolute URLs, 
// but we keep it for backwards compatibility with old relative paths.
var IMAGE_BASE = "";

type Props = {
    post: any;
    onReactionChange?: (postId: string, reactions: any, myReaction: any) => void;
    onDelete?: (postId: string) => void;
    onUpdated?: (postId: string, content: string, editedAt: string) => void;
};

function PostImage({ uri, borderColor }: any) {
    var [ratio, setRatio] = useState(1);

    useEffect(function () {
        Image.getSize(uri, function (w, h) {
            if (w && h) setRatio(w / h);
        }, function () { });
    }, [uri]);

    return (
        <Image
            source={{ uri: uri }}
            style={{ width: "100%", aspectRatio: ratio, borderRadius: radius.lg, borderWidth: 1, borderColor: borderColor }}
            resizeMode="contain"
        />
    );
}

export default function FeedPostCard({ post, onReactionChange, onDelete, onUpdated }: Props) {
    var colors = useColors();
    var router = useRouter();
    var [myReaction, setMyReaction] = useState<string | null>(post.myReaction ?? null);
    var [reactions, setReactions] = useState<any>(post.reactions || { hug: 0, growth: 0, strength: 0, grateful: 0 });
    var [showMenu, setShowMenu] = useState(false);
    var [editing, setEditing] = useState(false);
    var [editContent, setEditContent] = useState(post.content || "");
    var [currentContent, setCurrentContent] = useState(post.content || "");
    var [currentEditedAt, setCurrentEditedAt] = useState(post.editedAt || null);

    var timeAgo = function (d: string) {
        var diff = Date.now() - new Date(d).getTime();
        var mins = Math.floor(diff / 60000);
        var hrs = Math.floor(diff / 3600000);
        var days = Math.floor(diff / 86400000);
        if (mins < 1) return "now";
        if (mins < 60) return mins + "m";
        if (hrs < 24) return hrs + "h";
        return days + "d";
    };

    var handleReact = async function (type: string) {
        try {
            var res = await reactToPost(post.id, type);
            setReactions(res.reactions);
            setMyReaction(res.myReaction);
            if (onReactionChange) onReactionChange(post.id, res.reactions, res.myReaction);
        } catch (e) { }
    };

    var goToProfile = function () {
        if (post.anonymous || !post.author?.id) return;
        router.push("/users/" + post.author.id);
    };

    var goToPost = function () {
        if (editing) return;
        router.push("/feed/" + post.id);
    };

    var isEditable = post.isMine && post.createdAt && (Date.now() - new Date(post.createdAt).getTime() < 15 * 60 * 1000);

    var handleSaveEdit = async function () {
        if (!editContent.trim()) return;
        try {
            var res = await fetch("https://well-connect-web.vercel.app/api/feed/" + post.id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + (getAuthToken() || ""),
                },
                body: JSON.stringify({ content: editContent.trim() }),
            });
            if (res.ok) {
                var data = await res.json();
                setCurrentContent(data.content);
                setCurrentEditedAt(data.editedAt);
                setEditing(false);
                if (onUpdated) onUpdated(post.id, data.content, data.editedAt);
            } else {
                var err = await res.json();
                Alert.alert("Edit failed", err.error || "Try again");
            }
        } catch (e: any) {
            Alert.alert("Edit failed", e.message);
        }
    };

    var displayName = post.anonymous ? "Anonymous" : post.author?.name || "User";
    var initials = post.anonymous ? "🎭" : post.author?.name?.charAt(0) || "U";

    // 🚨 ULTIMATE FIX: Safely filter images
    var safeImages = Array.isArray(post.imageUrls)
        ? post.imageUrls.filter(function (url: string) {
            if (!url || typeof url !== "string") return false;
            var cleanUrl = url.trim();
            return cleanUrl.startsWith("http") || cleanUrl.startsWith("/");
        })
        : [];

    return (
        <View style={[styles.post, { borderBottomColor: colors.border }]}>
            <View style={styles.row}>
                <View style={styles.avatarColumn}>
                    <TouchableOpacity onPress={goToProfile} disabled={post.anonymous}>
                        <View style={[styles.avatar, { backgroundColor: post.anonymous ? colors.surfaceAlt : colors.primary, borderColor: post.anonymous ? colors.border : "transparent", borderWidth: post.anonymous ? 1 : 0 }]}>
                            <Text style={[styles.avatarText, { color: post.anonymous ? colors.textSecondary : "#fff" }]}>{initials}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {/* HEADER */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={goToProfile} disabled={post.anonymous}>
                            <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{displayName}</Text>
                        </TouchableOpacity>
                        {!post.anonymous && post.author?.username && (
                            <TouchableOpacity onPress={goToProfile}>
                                <Text style={[styles.username, { color: colors.textSecondary }]} numberOfLines={1}>@{post.author.username}</Text>
                            </TouchableOpacity>
                        )}
                        {post.anonymous && <Text style={[styles.anonBadge, { color: colors.primary, borderColor: colors.primary }]}>anonymous</Text>}
                        <Text style={[styles.dot, { color: colors.textTertiary }]}>·</Text>
                        <Text style={[styles.time, { color: colors.textTertiary }]}>{timeAgo(post.createdAt)}</Text>
                        {currentEditedAt && <Text style={{ fontSize: 11, color: colors.textTertiary }}>· edited</Text>}

                        {post.isMine && (
                            <View style={{ marginLeft: "auto", zIndex: 10 }}>
                                <TouchableOpacity onPress={function () { setShowMenu(!showMenu); }} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                                    <Text style={{ fontSize: 18, color: colors.textSecondary, fontWeight: "bold" }}>···</Text>
                                </TouchableOpacity>

                                {showMenu && (
                                    <View
                                        style={[styles.menuDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        onStartShouldSetResponder={function () { return true; }}
                                    >
                                        {isEditable && (
                                            <TouchableOpacity
                                                onPress={function () { setEditing(true); setShowMenu(false); }}
                                                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                                            >
                                                <Text style={[styles.menuText, { color: colors.textPrimary }]}>Edit</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            onPress={function () { setShowMenu(false); if (onDelete) onDelete(post.id); }}
                                            style={styles.menuItem}
                                        >
                                            <Text style={[styles.menuText, { color: colors.danger }]}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* BODY (Navigates to Post) */}
                    {editing ? (
                        <View style={{ marginTop: spacing.sm }}>
                            <TextInput
                                style={[styles.editInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                                value={editContent}
                                onChangeText={setEditContent}
                                multiline
                                maxLength={500}
                            />
                            <View style={{ flexDirection: "row", gap: spacing.sm, justifyContent: "flex-end", marginTop: spacing.sm }}>
                                <TouchableOpacity onPress={function () { setEditing(false); setEditContent(currentContent); }} style={{ padding: spacing.sm }}>
                                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSaveEdit} style={{ backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md }}>
                                    <Text style={{ fontSize: 13, color: "#fff", fontWeight: "600" }}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity activeOpacity={0.7} onPress={goToPost}>
                            {currentContent ? <Text style={[styles.text, { color: colors.textPrimary }]}>{currentContent}</Text> : null}

                            {/* 🚨 SAFE IMAGE RENDERER */}
                            {safeImages.length > 0 && (
                                <View style={styles.imageWrap}>
                                    {safeImages.length === 1 && (
                                        <PostImage
                                            uri={safeImages[0].startsWith("http") ? safeImages[0] : IMAGE_BASE + safeImages[0]}
                                            borderColor={colors.border}
                                        />
                                    )}
                                    {safeImages.length === 2 && (
                                        <View style={styles.imageRow}>
                                            {safeImages.map(function (url: string, i: number) {
                                                var fullUrl = url.startsWith("http") ? url : IMAGE_BASE + url;
                                                return <Image key={i} source={{ uri: fullUrl }} style={[styles.imageHalf, { borderColor: colors.border }]} resizeMode="cover" />;
                                            })}
                                        </View>
                                    )}
                                    {safeImages.length === 3 && (
                                        <View style={styles.imageRow}>
                                            {safeImages.map(function (url: string, i: number) {
                                                var fullUrl = url.startsWith("http") ? url : IMAGE_BASE + url;
                                                return <Image key={i} source={{ uri: fullUrl }} style={[styles.imageThird, { borderColor: colors.border }]} resizeMode="cover" />;
                                            })}
                                        </View>
                                    )}
                                    {safeImages.length >= 4 && (
                                        <View style={styles.imageGridFour}>
                                            {safeImages.slice(0, 4).map(function (url: string, i: number) {
                                                var fullUrl = url.startsWith("http") ? url : IMAGE_BASE + url;
                                                return <Image key={i} source={{ uri: fullUrl }} style={[styles.imageQuarter, { borderColor: colors.border }]} resizeMode="cover" />;
                                            })}
                                        </View>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* REACTIONS */}
                    {!editing && (
                        <View style={styles.actions}>
                            {REACTIONS.map(function (r: any) {
                                var isActive = myReaction === r.type;
                                var count = (reactions && reactions[r.type]) || 0;
                                return (
                                    <TouchableOpacity key={r.type} style={[styles.actionBtn, isActive && { backgroundColor: colors.primaryLight }]} onPress={function () { handleReact(r.type); }}>
                                        <Text style={styles.actionEmoji}>{r.emoji}</Text>
                                        {count > 0 && <Text style={[styles.actionCount, { color: isActive ? colors.primary : colors.textSecondary }]}>{count}</Text>}
                                    </TouchableOpacity>
                                );
                            })}
                            <TouchableOpacity style={styles.actionBtn} onPress={goToPost}>
                                <Text style={styles.actionEmoji}>💬</Text>
                                {post.replyCount > 0 && <Text style={[styles.actionCount, { color: colors.textSecondary }]}>{post.replyCount}</Text>}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

var styles = StyleSheet.create({
    post: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1 },
    row: { flexDirection: "row", gap: spacing.md },
    avatarColumn: { width: 40 },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
    avatarText: { fontSize: 15, fontWeight: "700" },
    content: { flex: 1, minWidth: 0 },
    header: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginBottom: 4, gap: 4 },
    name: { fontSize: 15, fontWeight: "700" },
    username: { fontSize: 14 },
    anonBadge: { fontSize: 10, fontWeight: "600", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, textTransform: "lowercase" },
    dot: { fontSize: 14 },
    time: { fontSize: 13 },
    text: { fontSize: 15, lineHeight: 21, marginBottom: spacing.sm },
    imageWrap: { marginTop: spacing.sm, marginBottom: spacing.sm },
    imageRow: { flexDirection: "row", gap: 2 },
    imageHalf: { flex: 1, height: 200, borderRadius: radius.md, borderWidth: 1 },
    imageThird: { flex: 1, height: 160, borderRadius: radius.md, borderWidth: 1 },
    imageGridFour: { flexDirection: "row", flexWrap: "wrap", gap: 2 },
    imageQuarter: { width: "49.5%", height: 140, borderRadius: radius.md, borderWidth: 1 },
    actions: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.full },
    actionEmoji: { fontSize: 16 },
    actionCount: { fontSize: 13, fontWeight: "600" },
    menuDropdown: { position: "absolute", top: 30, right: 0, width: 120, borderWidth: 1, borderRadius: radius.md, zIndex: 100, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    menuItem: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: 0 },
    menuText: { fontSize: 14, fontWeight: "500" },
    editInput: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, fontSize: 15, minHeight: 80, textAlignVertical: "top" },
});