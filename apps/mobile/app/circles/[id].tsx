import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    PanResponder,
    Animated,
    Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import {
    getCircle,
    joinCircle,
    getCirclePosts,
    getCircleMembers,
    getCircleMessages,
    sendCircleMessage,
    createFeedPost,
    uploadImages,
    reactToPost,
    editCircleMessage,
    deleteCircleMessage,
} from "../../src/api/client";
import { useColors, spacing, radius } from "../../src/theme";

var REACTIONS = [
    { type: "hug", emoji: "🤗" },
    { type: "growth", emoji: "🌱" },
    { type: "strength", emoji: "💪" },
    { type: "grateful", emoji: "🙏" },
];

var MAX_IMAGES = 4;

function timeAgo(d: string) {
    var diff = Date.now() - new Date(d).getTime();
    var mins = Math.floor(diff / 60000);
    var hrs = Math.floor(diff / 3600000);
    var days = Math.floor(diff / 86400000);
    if (mins < 1) return "now";
    if (mins < 60) return mins + "m";
    if (hrs < 24) return hrs + "h";
    return days + "d";
}

function SwipeableMessage({ m, colors, onReply, onLongPress }: any) {
    var translateX = useRef(new Animated.Value(0)).current;

    var panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return gestureState.dx > 10 && Math.abs(gestureState.dy) < 20;
            },
            onPanResponderMove: (evt, gestureState) => {
                if (gestureState.dx > 0 && gestureState.dx < 70) {
                    translateX.setValue(gestureState.dx);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dx > 40) {
                    onReply();
                }
                Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
            },
        })
    ).current;

    var isMine = m.isMine;

    return (
        <View style={{ marginBottom: spacing.sm, position: "relative" }}>
            <View style={{ position: "absolute", left: isMine ? "auto" : 20, right: isMine ? 20 : "auto", top: 15, opacity: 0.5 }}>
                <Text style={{ fontSize: 18 }}>↩️</Text>
            </View>

            <Animated.View style={{ transform: [{ translateX: translateX }], alignItems: isMine ? "flex-end" : "flex-start" }} {...panResponder.panHandlers}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onLongPress={onLongPress}
                    delayLongPress={300}
                    style={{ maxWidth: "80%" }}
                >
                    {!isMine && <Text style={{ fontSize: 11, fontWeight: "600", color: colors.textSecondary, marginLeft: 4, marginBottom: 2 }}>{m.user?.name}</Text>}

                    <View style={[styles.bubble, { backgroundColor: isMine ? colors.primary : colors.surfaceAlt }]}>

                        {m.replyTo && (
                            <View style={[styles.quoteBox, { borderLeftColor: isMine ? "#fff" : colors.primary, backgroundColor: isMine ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)" }]}>
                                <Text style={[styles.quoteName, { color: isMine ? "#fff" : colors.primary }]}>{m.replyTo.senderName}</Text>
                                <Text style={[styles.quoteText, { color: isMine ? "rgba(255,255,255,0.8)" : colors.textSecondary }]} numberOfLines={1}>{m.replyTo.content}</Text>
                            </View>
                        )}

                        <Text style={{ fontSize: 15, lineHeight: 21, color: isMine ? "#fff" : colors.textPrimary }}>{m.content}</Text>

                        <Text style={[styles.time, { color: isMine ? "rgba(255,255,255,0.7)" : colors.textTertiary, textAlign: isMine ? "right" : "left" }]}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

export default function CircleDetailScreen() {
    var router = useRouter();
    var params = useLocalSearchParams();
    var circleId = params.id as string;
    var colors = useColors();

    var [circle, setCircle] = useState<any>(null);
    var [loading, setLoading] = useState(true);
    var [tab, setTab] = useState("feed");
    var [joining, setJoining] = useState(false);

    useEffect(function () { load(); }, [circleId]);

    var load = async function () {
        try {
            var data = await getCircle(circleId);
            setCircle(data);
        } catch (e) { }
        setLoading(false);
    };

    var handleJoin = async function () {
        if (joining) return;
        setJoining(true);
        try {
            var data = await joinCircle(circleId);
            setCircle({
                ...circle,
                myStatus: data.status,
                myRole: data.status === "approved" ? "member" : null,
                memberCount: data.memberCount,
            });
        } catch (e: any) {
            Alert.alert("Failed", e.message);
        }
        setJoining(false);
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!circle) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textSecondary }}>Circle not found</Text>
            </View>
        );
    }

    var isMember = circle.myStatus === "approved";
    var isPending = circle.myStatus === "pending";
    var isCreator = circle.myRole === "creator";

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={styles.backBtn}>
                    <Text style={[styles.backText, { color: colors.textPrimary }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.topTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {circle.name}
                </Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <View style={styles.headerTop}>
                        <View style={[styles.headerEmoji, { backgroundColor: circle.coverColor || colors.primary }]}>
                            <Text style={{ fontSize: 32 }}>{circle.emoji || "🌿"}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                                <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                                    {circle.name}
                                </Text>
                                {circle.isPrivate && (
                                    <Text style={[styles.badge, { color: colors.textSecondary, borderColor: colors.border }]}>private</Text>
                                )}
                            </View>
                            <Text style={[styles.meta, { color: colors.textSecondary }]}>
                                {circle.memberCount} {circle.memberCount === 1 ? "member" : "members"} · {circle.postCount} {circle.postCount === 1 ? "post" : "posts"}
                            </Text>
                        </View>
                    </View>
                    {circle.description ? (
                        <Text style={[styles.description, { color: colors.textSecondary }]}>{circle.description}</Text>
                    ) : null}

                    <View style={{ marginTop: spacing.md }}>
                        {isCreator ? (
                            <Text style={{ fontSize: 12, color: colors.textTertiary }}>You created this circle</Text>
                        ) : isMember ? (
                            <TouchableOpacity onPress={handleJoin} disabled={joining} style={[styles.leaveBtn, { borderColor: colors.border }]}>
                                <Text style={[styles.leaveBtnText, { color: colors.textPrimary }]}>
                                    {joining ? "..." : "Leave circle"}
                                </Text>
                            </TouchableOpacity>
                        ) : isPending ? (
                            <Text style={{ fontSize: 12, color: colors.textSecondary }}>⏳ Request pending</Text>
                        ) : (
                            <TouchableOpacity onPress={handleJoin} disabled={joining} style={[styles.joinBtn, { backgroundColor: colors.primary }]}>
                                <Text style={styles.joinBtnText}>
                                    {joining ? "..." : (circle.isPrivate ? "Request to join" : "Join")}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {isMember && (
                    <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
                        {["feed", "chat", "members"].map(function (t) {
                            var active = tab === t;
                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={function () { setTab(t); }}
                                    style={[styles.tabBtn, active && { borderBottomColor: colors.primary }]}
                                >
                                    <Text style={[styles.tabLabel, { color: active ? colors.textPrimary : colors.textSecondary, fontWeight: active ? "700" : "500" }]}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {!isMember ? (
                    <View style={styles.lockedBox}>
                        <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🔒</Text>
                        <Text style={[styles.lockedTitle, { color: colors.textPrimary }]}>
                            {isPending ? "Waiting for approval" : "Members only"}
                        </Text>
                        <Text style={[styles.lockedText, { color: colors.textSecondary }]}>
                            {isPending ? "The creator will approve your request soon." : "Join to see the feed and chat."}
                        </Text>
                    </View>
                ) : (
                    <>
                        {tab === "feed" && <CircleFeed circleId={circleId} colors={colors} />}
                        {tab === "chat" && <CircleChat circleId={circleId} colors={colors} />}
                        {tab === "members" && <CircleMembersList circleId={circleId} colors={colors} />}
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function CircleFeed({ circleId, colors }: any) {
    var [posts, setPosts] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [content, setContent] = useState("");
    var [images, setImages] = useState<string[]>([]);
    var [posting, setPosting] = useState(false);

    useEffect(function () { load(); }, []);

    var load = async function () {
        try {
            var data = await getCirclePosts(circleId);
            setPosts(data.posts || []);
        } catch (e) { }
        setLoading(false);
    };

    var handlePickImage = async function () {
        if (images.length >= MAX_IMAGES) {
            Alert.alert("Maximum " + MAX_IMAGES + " images");
            return;
        }

        var result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: MAX_IMAGES - images.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            var prepared: string[] = [];
            for (var i = 0; i < result.assets.length; i++) {
                var asset = result.assets[i];
                if (!asset || !asset.uri) continue;
                try {
                    var manipulated = await ImageManipulator.manipulateAsync(
                        asset.uri,
                        [{ resize: { width: 1024 } }],
                        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
                    );
                    prepared.push(manipulated.uri);
                } catch (e) {
                    prepared.push(asset.uri);
                }
            }
            if (prepared.length > 0) {
                setImages(images.concat(prepared).slice(0, MAX_IMAGES));
            }
        }
    };

    var handleRemoveImage = function (index: number) {
        setImages(images.filter(function (_: any, i: number) { return i !== index; }));
    };

    var handlePost = async function () {
        if (!content.trim() && images.length === 0) return;
        setPosting(true);
        try {
            var urls: string[] = [];
            if (images.length > 0) {
                var uploadResult = await uploadImages(images);
                urls = uploadResult.urls || [];
            }
            var post = await createFeedPost(content.trim(), urls, false, circleId);
            await load();
            setContent("");
            setImages([]);
        } catch (e: any) {
            Alert.alert("Failed", e.message);
        }
        setPosting(false);
    };

    var handleReact = async function (postId: string, type: string) {
        try {
            var res = await reactToPost(postId, type);
            setPosts(posts.map(function (p: any) {
                return p.id === postId ? { ...p, reactions: res.reactions, myReaction: res.myReaction } : p;
            }));
        } catch (e) { }
    };

    if (loading) {
        return <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />;
    }

    return (
        <View>
            <View style={[styles.composer, { borderBottomColor: colors.border }]}>
                <TextInput
                    style={[styles.composerInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={content}
                    onChangeText={setContent}
                    placeholder="Share something with the circle..."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    maxLength={500}
                />

                {images.length > 0 && (
                    <View style={styles.imageGrid}>
                        {images.map(function (uri: string, i: number) {
                            return (
                                <View key={i} style={styles.imageWrapper}>
                                    <Image source={{ uri: uri }} style={styles.imageThumb} />
                                    <TouchableOpacity style={styles.imageRemove} onPress={function () { handleRemoveImage(i); }}>
                                        <Text style={styles.imageRemoveText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={styles.composerActions}>
                    <TouchableOpacity
                        style={[styles.imageBtn, { borderColor: colors.border }]}
                        onPress={handlePickImage}
                        disabled={images.length >= MAX_IMAGES}
                    >
                        <Text style={{ fontSize: 16 }}>📷</Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>{images.length}/{MAX_IMAGES}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handlePost}
                        disabled={(!content.trim() && images.length === 0) || posting}
                        style={[styles.postBtn, { backgroundColor: (content.trim() || images.length > 0) ? colors.primary : colors.border }]}
                    >
                        <Text style={[styles.postBtnText, { color: (content.trim() || images.length > 0) ? "#fff" : colors.textTertiary }]}>
                            {posting ? "Posting..." : "Post"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {posts.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🌿</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No posts yet. Be the first.</Text>
                </View>
            ) : (
                posts.map(function (post: any) {
                    return (
                        <View key={post.id} style={[styles.postCard, { borderBottomColor: colors.border }]}>
                            <View style={{ flexDirection: "row", gap: spacing.md }}>
                                <View style={[styles.postAvatar, { backgroundColor: post.anonymous ? colors.surfaceAlt : colors.primary }]}>
                                    <Text style={{ fontSize: 15, fontWeight: "700", color: post.anonymous ? colors.textSecondary : "#fff" }}>
                                        {post.anonymous ? "🎭" : (post.author?.name?.charAt(0) || "U")}
                                    </Text>
                                </View>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={[styles.postName, { color: colors.textPrimary }]}>
                                        {post.anonymous ? "Anonymous" : post.author?.name || "User"}
                                        <Text style={{ fontWeight: "400", color: colors.textTertiary }}>{" · " + timeAgo(post.createdAt)}</Text>
                                    </Text>
                                    {post.content ? (
                                        <Text style={[styles.postText, { color: colors.textPrimary }]}>{post.content}</Text>
                                    ) : null}

                                    {post.imageUrls && post.imageUrls.length > 0 && (
                                        <View style={{ marginTop: spacing.sm }}>
                                            {post.imageUrls.slice(0, 1).map(function (url: string, i: number) {
                                                return (
                                                    <Image
                                                        key={i}
                                                        source={{ uri: "https://well-connect-web.vercel.app" + url }}
                                                        style={styles.postImage}
                                                        resizeMode="cover"
                                                    />
                                                );
                                            })}
                                        </View>
                                    )}

                                    <View style={styles.postActions}>
                                        {REACTIONS.map(function (r) {
                                            var isActive = post.myReaction === r.type;
                                            var count = post.reactions?.[r.type] || 0;
                                            return (
                                                <TouchableOpacity
                                                    key={r.type}
                                                    onPress={function () { handleReact(post.id, r.type); }}
                                                    style={[styles.reactBtn, isActive && { backgroundColor: colors.primaryLight }]}
                                                >
                                                    <Text style={{ fontSize: 16 }}>{r.emoji}</Text>
                                                    {count > 0 && (
                                                        <Text style={{ fontSize: 13, fontWeight: "600", color: isActive ? colors.primary : colors.textSecondary }}>
                                                            {count}
                                                        </Text>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                })
            )}
        </View>
    );
}

function CircleChat({ circleId, colors }: any) {
    var [messages, setMessages] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [text, setText] = useState("");
    var [sending, setSending] = useState(false);
    var [replyingTo, setReplyingTo] = useState<any>(null);
    var [editingMessage, setEditingMessage] = useState<any>(null);
    var [menuMessage, setMenuMessage] = useState<any>(null);
    var scrollRef = useRef<ScrollView>(null);

    useEffect(function () {
        loadInitial();
        var interval = setInterval(poll, 3000);
        return function () { clearInterval(interval); };
    }, []);

    useEffect(function () {
        setTimeout(function () { scrollRef.current?.scrollToEnd({ animated: true }); }, 100);
    }, [messages, replyingTo]);

    var loadInitial = async function () {
        try {
            var data = await getCircleMessages(circleId);
            setMessages(data.messages || []);
        } catch (e) { }
        setLoading(false);
    };

    var poll = async function () {
        if (!messages.length) return;
        var last = messages[messages.length - 1].createdAt;
        try {
            var data = await getCircleMessages(circleId, last);
            if (data.messages && data.messages.length > 0) {
                setMessages(messages.concat(data.messages));
            }
        } catch (e) { }
    };

    var handleSend = async function () {
        if (!text.trim() || sending) return;
        setSending(true);
        try {
            if (editingMessage) {
                await editCircleMessage(circleId, editingMessage.id, text.trim());
                setMessages(messages.map(function (m) {
                    return m.id === editingMessage.id ? { ...m, content: text.trim() } : m;
                }));
                setEditingMessage(null);
            } else {
                var msg = await sendCircleMessage(circleId, text.trim(), replyingTo?.id);
                setMessages(messages.concat([msg]));
                setReplyingTo(null);
            }
            setText("");
        } catch (e: any) {
            Alert.alert("Failed", e.message);
        }
        setSending(false);
    };

    var confirmDelete = function (messageId: string) {
        Alert.alert("Delete message?", "This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async function () {
                    try {
                        await deleteCircleMessage(circleId, messageId);
                        setMessages(messages.filter(function (m) { return m.id !== messageId; }));
                    } catch (e: any) { Alert.alert("Failed", e.message); }
                }
            }
        ]);
    };

    var openMenu = function (m: any) {
        setMenuMessage(m);
    };

    if (loading) {
        return <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />;
    }

    return (
        <View>
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400 }}
                contentContainerStyle={{ padding: spacing.lg }}
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={{ fontSize: 40, marginBottom: spacing.md }}>💬</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No messages yet. Say hi.</Text>
                    </View>
                ) : (
                    messages.map(function (m: any) {
                        return (
                            <SwipeableMessage
                                key={m.id}
                                m={m}
                                colors={colors}
                                onReply={function () { setReplyingTo(m); setEditingMessage(null); setText(""); }}
                                onLongPress={function () { openMenu(m); }}
                            />
                        );
                    })
                )}
            </ScrollView>

            <View style={[styles.chatComposer, { borderTopColor: colors.border }]}>

                {replyingTo && (
                    <View style={[styles.replyPreview, { backgroundColor: colors.surfaceAlt, borderLeftColor: colors.primary }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>Replying to {replyingTo.isMine ? "yourself" : replyingTo.user?.name}</Text>
                            <Text style={{ fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>{replyingTo.content}</Text>
                        </View>
                        <TouchableOpacity onPress={function () { setReplyingTo(null); }}><Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text></TouchableOpacity>
                    </View>
                )}

                {editingMessage && (
                    <View style={[styles.replyPreview, { backgroundColor: colors.surfaceAlt, borderLeftColor: colors.primary }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>Editing message</Text>
                        </View>
                        <TouchableOpacity onPress={function () { setEditingMessage(null); setText(""); }}><Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text></TouchableOpacity>
                    </View>
                )}

                <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "flex-end" }}>
                    <TextInput
                        style={[styles.chatInput, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary, borderColor: colors.border }]}
                        value={text}
                        onChangeText={setText}
                        placeholder={editingMessage ? "Edit message..." : "Message the circle..."}
                        placeholderTextColor={colors.textTertiary}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!text.trim() || sending}
                        style={[styles.chatSend, { backgroundColor: text.trim() ? colors.primary : colors.border }]}
                    >
                        <Text style={{ color: text.trim() ? "#fff" : colors.textTertiary, fontSize: 16, fontWeight: "700" }}>
                            {sending ? "..." : (editingMessage ? "✓" : "→")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Custom Bottom Sheet Modal */}
            <Modal
                visible={menuMessage !== null}
                transparent
                animationType="fade"
                onRequestClose={function () { setMenuMessage(null); }}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
                    activeOpacity={1}
                    onPress={function () { setMenuMessage(null); }}
                >
                    <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingBottom: 40 }}>
                        {menuMessage && (
                            <View style={{ paddingTop: spacing.md }}>

                                <TouchableOpacity
                                    style={{ flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}
                                    onPress={function () { setReplyingTo(menuMessage); setEditingMessage(null); setText(""); setMenuMessage(null); }}
                                >
                                    <Ionicons name="arrow-undo-outline" size={22} color={colors.textPrimary} style={{ marginRight: spacing.md }} />
                                    <Text style={{ fontSize: 16, color: colors.textPrimary }}>Reply</Text>
                                </TouchableOpacity>

                                {menuMessage.isMine && (Date.now() - new Date(menuMessage.createdAt).getTime() < 15 * 60 * 1000) && (
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}
                                        onPress={function () { setEditingMessage(menuMessage); setReplyingTo(null); setText(menuMessage.content); setMenuMessage(null); }}
                                    >
                                        <Ionicons name="pencil-outline" size={22} color={colors.textPrimary} style={{ marginRight: spacing.md }} />
                                        <Text style={{ fontSize: 16, color: colors.textPrimary }}>Edit</Text>
                                    </TouchableOpacity>
                                )}

                                {menuMessage.isMine && (
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}
                                        onPress={function () {
                                            var idToDelete = menuMessage.id;
                                            setMenuMessage(null);
                                            setTimeout(function () { confirmDelete(idToDelete); }, 200);
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={22} color={colors.danger} style={{ marginRight: spacing.md }} />
                                        <Text style={{ fontSize: 16, color: colors.danger }}>Delete</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={{ flexDirection: "row", alignItems: "center", padding: spacing.lg }}
                                    onPress={function () { setMenuMessage(null); }}
                                >
                                    <Ionicons name="close-outline" size={22} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
                                    <Text style={{ fontSize: 16, color: colors.textSecondary }}>Cancel</Text>
                                </TouchableOpacity>

                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

function CircleMembersList({ circleId, colors }: any) {
    var [members, setMembers] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);

    useEffect(function () { load(); }, []);

    var load = async function () {
        try {
            var data = await getCircleMembers(circleId);
            setMembers(data.members || []);
        } catch (e) { }
        setLoading(false);
    };

    if (loading) {
        return <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />;
    }

    return (
        <View style={{ padding: spacing.lg }}>
            {members.map(function (m: any) {
                return (
                    <View key={m.id} style={[styles.memberRow, { backgroundColor: colors.surface }]}>
                        <View style={[styles.memberAvatar, { backgroundColor: colors.primary }]}>
                            <Text style={{ color: "#fff", fontWeight: "700" }}>
                                {m.user?.name?.charAt(0) || "U"}
                            </Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>
                                {m.user?.name || "User"}
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                                @{m.user?.username || "user"}
                            </Text>
                        </View>
                        {m.role === "creator" && (
                            <Text style={[styles.creatorBadge, { backgroundColor: colors.primaryLight, color: colors.primary }]}>creator</Text>
                        )}
                    </View>
                );
            })}
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    topBar: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, borderBottomWidth: 1,
    },
    backBtn: { width: 32, height: 32, justifyContent: "center" },
    backText: { fontSize: 22 },
    topTitle: { fontSize: 16, fontWeight: "700", flex: 1, textAlign: "center" },
    content: { paddingBottom: spacing.xxl },
    header: { padding: spacing.lg, borderBottomWidth: 1 },
    headerTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    headerEmoji: { width: 64, height: 64, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 20, fontWeight: "700" },
    meta: { fontSize: 13, marginTop: 2 },
    description: { fontSize: 13, marginTop: spacing.md, lineHeight: 19 },
    badge: { fontSize: 10, fontWeight: "600", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, borderWidth: 1 },
    joinBtn: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full, alignSelf: "flex-start" },
    joinBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
    leaveBtn: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, alignSelf: "flex-start" },
    leaveBtnText: { fontSize: 13, fontWeight: "600" },
    tabs: { flexDirection: "row", paddingHorizontal: spacing.lg, borderBottomWidth: 1 },
    tabBtn: { paddingVertical: spacing.md, marginRight: spacing.xl, borderBottomWidth: 2, borderBottomColor: "transparent" },
    tabLabel: { fontSize: 15 },
    lockedBox: { alignItems: "center", paddingVertical: spacing.xxl * 2 },
    lockedTitle: { fontSize: 15, fontWeight: "600", marginBottom: spacing.sm },
    lockedText: { fontSize: 14, textAlign: "center" },
    composer: { padding: spacing.lg, borderBottomWidth: 1 },
    composerInput: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, fontSize: 14, minHeight: 80, textAlignVertical: "top" },
    imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
    imageWrapper: { width: "48%", position: "relative" },
    imageThumb: { width: "100%", height: 120, borderRadius: radius.md },
    imageRemove: {
        position: "absolute", top: 6, right: 6,
        backgroundColor: "rgba(0,0,0,0.7)", width: 24, height: 24, borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    imageRemoveText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    composerActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.md },
    imageBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
    postBtn: { marginLeft: "auto", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full },
    postBtnText: { fontSize: 13, fontWeight: "600" },
    emptyBox: { alignItems: "center", paddingVertical: spacing.xxl },
    emptyText: { fontSize: 14 },
    postCard: { padding: spacing.lg, borderBottomWidth: 1 },
    postAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    postName: { fontSize: 15, fontWeight: "700" },
    postText: { fontSize: 15, marginTop: 4, lineHeight: 21 },
    postImage: { width: "100%", height: 200, borderRadius: radius.md },
    postActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
    reactBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.full },
    chatComposer: { padding: spacing.md, borderTopWidth: 1 },
    chatInput: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, fontSize: 14, maxHeight: 100 },
    chatSend: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    memberRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
    memberAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    creatorBadge: { fontSize: 10, fontWeight: "600", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

    // Shared Chat Styles
    bubble: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg },
    time: { fontSize: 10, opacity: 0.7, marginTop: 4 },
    quoteBox: { padding: 6, borderRadius: 6, marginBottom: 6, borderLeftWidth: 3 },
    quoteName: { fontSize: 11, fontWeight: "700", marginBottom: 2 },
    quoteText: { fontSize: 12 },
    replyPreview: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm, borderLeftWidth: 3 },
});