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
    KeyboardAvoidingView,
    Platform,
    PanResponder,
    Animated,
    Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getDMMessages, sendDM, getUserProfile, editDM, deleteDM } from "../../src/api/client";
import { useColors, spacing, radius } from "../../src/theme";
import VoiceNoteButton from "../../components/VoiceNoteButton";
import AudioMessage from "../../components/AudioMessage"; // 🚨 Import Audio Player

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
                    {!isMine && <Text style={{ fontSize: 11, fontWeight: "600", color: colors.textSecondary, marginLeft: 4, marginBottom: 2 }}>{m.sender?.name}</Text>}

                    <View style={[styles.bubble, { backgroundColor: isMine ? colors.primary : colors.surfaceAlt }]}>

                        {m.replyTo && (
                            <View style={[styles.quoteBox, { borderLeftColor: isMine ? "#fff" : colors.primary, backgroundColor: isMine ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)" }]}>
                                <Text style={[styles.quoteName, { color: isMine ? "#fff" : colors.primary }]}>{m.replyTo.senderName}</Text>
                                <Text style={[styles.quoteText, { color: isMine ? "rgba(255,255,255,0.8)" : colors.textSecondary }]} numberOfLines={1}>{m.replyTo.content}</Text>
                            </View>
                        )}

                        {/* 🚨 THE FIX: Check if it's a voice note, otherwise render text */}
                        {m.content.startsWith("🎤 ") ? (
                            <AudioMessage url={m.content.replace("🎤 ", "")} isMine={isMine} />
                        ) : (
                            <Text style={{ fontSize: 15, lineHeight: 21, color: isMine ? "#fff" : colors.textPrimary }}>{m.content}</Text>
                        )}

                        <Text style={[styles.time, { color: isMine ? "rgba(255,255,255,0.7)" : colors.textTertiary, textAlign: isMine ? "right" : "left" }]}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

export default function ChatScreen() {
    var params = useLocalSearchParams();
    var otherId = params.userId as string;
    var colors = useColors();

    var [messages, setMessages] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [text, setText] = useState("");
    var [sending, setSending] = useState(false);
    var [other, setOther] = useState<any>(null);

    var [replyingTo, setReplyingTo] = useState<any>(null);
    var [editingMessage, setEditingMessage] = useState<any>(null);
    var [menuMessage, setMenuMessage] = useState<any>(null);

    var scrollRef = useRef<ScrollView>(null);

    useEffect(function () {
        loadInitial();
        var interval = setInterval(poll, 3000);
        return function () { clearInterval(interval); };
    }, [otherId]);

    useEffect(function () {
        setTimeout(function () { scrollRef.current?.scrollToEnd({ animated: true }); }, 100);
    }, [messages, replyingTo]);

    var loadInitial = async function () {
        try {
            var results = await Promise.all([
                getDMMessages(otherId),
                getUserProfile(otherId),
            ]);
            setMessages(results[0].messages || []);
            setOther(results[1]);
        } catch (e) { }
        setLoading(false);
    };

    var poll = async function () {
        if (!messages.length) return;
        var last = messages[messages.length - 1].createdAt;
        try {
            var data = await getDMMessages(otherId, last);
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
                await editDM(otherId, editingMessage.id, text.trim());
                setMessages(messages.map(function (m) {
                    return m.id === editingMessage.id ? { ...m, content: text.trim() } : m;
                }));
                setEditingMessage(null);
            } else {
                var msg = await sendDM(otherId, text.trim(), replyingTo?.id);
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
                        await deleteDM(otherId, messageId);
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
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            {other && (
                <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
                    <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarSmallText}>{other.name?.charAt(0) || "U"}</Text>
                    </View>
                    <View>
                        <Text style={[styles.headerName, { color: colors.textPrimary }]}>{other.name}</Text>
                        <Text style={[styles.headerUsername, { color: colors.textSecondary }]}>@{other.username || "user"}</Text>
                    </View>
                </View>
            )}

            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.messagesContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={{ fontSize: 40, marginBottom: spacing.md }}>💬</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Say hi to start the conversation.</Text>
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

            <View style={[styles.composer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>

                {replyingTo && (
                    <View style={[styles.replyPreview, { backgroundColor: colors.surfaceAlt, borderLeftColor: colors.primary }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>Replying to {replyingTo.isMine ? "yourself" : other?.name}</Text>
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
                        style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary, borderColor: colors.border }]}
                        value={text}
                        onChangeText={setText}
                        placeholder={editingMessage ? "Edit message..." : "Message..."}
                        placeholderTextColor={colors.textTertiary}
                        multiline
                    />

                    {text.trim().length === 0 && !editingMessage ? (
                        <VoiceNoteButton userId={otherId} onSent={loadInitial} />
                    ) : (
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!text.trim() || sending}
                            style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.border }]}
                        >
                            <Text style={{ color: text.trim() ? "#fff" : colors.textTertiary, fontSize: 18, fontWeight: "700" }}>
                                {sending ? "..." : (editingMessage ? "✓" : "→")}
                            </Text>
                        </TouchableOpacity>
                    )}
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
        </KeyboardAvoidingView>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, borderBottomWidth: 1 },
    avatarSmall: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    avatarSmallText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    headerName: { fontSize: 15, fontWeight: "700" },
    headerUsername: { fontSize: 12 },
    messagesContent: { padding: spacing.lg, paddingBottom: spacing.xl },
    emptyBox: { alignItems: "center", paddingVertical: spacing.xxl * 2 },
    emptyText: { fontSize: 14, textAlign: "center" },
    bubble: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg },
    time: { fontSize: 10, opacity: 0.7, marginTop: 4 },
    quoteBox: { padding: 6, borderRadius: 6, marginBottom: 6, borderLeftWidth: 3 },
    quoteName: { fontSize: 11, fontWeight: "700", marginBottom: 2 },
    quoteText: { fontSize: 12 },
    composer: { padding: spacing.md, borderTopWidth: 1 },
    replyPreview: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm, borderLeftWidth: 3 },
    input: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, fontSize: 14, maxHeight: 100 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});