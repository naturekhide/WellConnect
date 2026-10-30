import React, { useEffect, useState, useRef } from "react";
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
    PanResponder, Animated, Modal, Image, Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import EmojiPicker from "rn-emoji-keyboard";
import { getDMMessages, sendDM, getUserProfile, editDM, deleteDM, uploadImages } from "../../src/api/client";
import { useColors, spacing, radius } from "../../src/theme";
import VoiceNoteButton from "../../components/VoiceNoteButton";
import AudioMessage from "../../components/AudioMessage";
import AttachmentButton from "../../components/AttachmentButton";

var MY_BUBBLE = "#059669";
var THEIR_BUBBLE = "#132a25";
var BG_COLOR = "#0a0f0d";

function formatDate(dateString: string) {
    var d = new Date(dateString);
    var today = new Date();
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function SwipeableMessage({ m, onReply, onLongPress, showAvatar }: any) {
    var translateX = useRef(new Animated.Value(0)).current;

    var panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => gestureState.dx > 10 && Math.abs(gestureState.dy) < 20,
            onPanResponderMove: (evt, gestureState) => {
                if (gestureState.dx > 0 && gestureState.dx < 70) translateX.setValue(gestureState.dx);
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dx > 40) onReply();
                Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
            },
        })
    ).current;

    var isMine = m.isMine;
    var bubbleBg = isMine ? MY_BUBBLE : THEIR_BUBBLE;
    var textColor = isMine ? "#ffffff" : "#e2e8f0";

    return (
        <View style={{ marginBottom: showAvatar ? spacing.md : 4, position: "relative" }}>
            <View style={{ position: "absolute", left: isMine ? "auto" : 20, right: isMine ? 20 : "auto", top: 15, opacity: 0.5 }}>
                <Text style={{ fontSize: 18 }}>↩️</Text>
            </View>

            <Animated.View style={{ transform: [{ translateX: translateX }], alignItems: isMine ? "flex-end" : "flex-start" }} {...panResponder.panHandlers}>
                <TouchableOpacity activeOpacity={0.8} onLongPress={onLongPress} delayLongPress={300} style={{ maxWidth: "80%" }}>
                    {!isMine && showAvatar && <Text style={{ fontSize: 11, fontWeight: "600", color: "#64748b", marginLeft: 12, marginBottom: 4 }}>{m.sender?.name}</Text>}

                    <View style={[styles.bubble, { backgroundColor: bubbleBg }]}>
                        {m.replyTo && (
                            <View style={[styles.quoteBox, { borderLeftColor: isMine ? "#34d399" : "#059669", backgroundColor: "rgba(0,0,0,0.2)" }]}>
                                <Text style={[styles.quoteName, { color: isMine ? "#34d399" : "#059669" }]}>{m.replyTo.senderName}</Text>
                                <Text style={[styles.quoteText, { color: "#94a3b8" }]} numberOfLines={1}>{m.replyTo.content}</Text>
                            </View>
                        )}

                        {m.content.startsWith("🎤 ") ? (
                            <AudioMessage url={m.content.replace("🎤 ", "")} isMine={isMine} />
                        ) : m.content.startsWith("🖼️ ") ? (
                            <Image source={{ uri: m.content.replace("🖼️ ", "") }} style={{ width: 220, height: 260, borderRadius: radius.lg, marginVertical: 4 }} resizeMode="cover" />
                        ) : m.content.startsWith("📎 ") ? (
                            <TouchableOpacity onPress={() => Linking.openURL(m.content.replace("📎 ", ""))} style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 8, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: radius.md, marginVertical: 4 }}>
                                <Text style={{ fontSize: 24 }}>📄</Text>
                                <Text style={{ color: textColor, fontWeight: "600" }}>Download File</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={{ fontSize: 15, lineHeight: 22, color: textColor }}>{m.content}</Text>
                        )}

                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 4, gap: 4 }}>
                            <Text style={{ fontSize: 10, color: isMine ? "rgba(255,255,255,0.7)" : "#64748b" }}>
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                            </Text>

                            {/* 🚨 REAL READ RECEIPTS */}
                            {isMine && (
                                m.readAt ? (
                                    <Ionicons name="checkmark-done" size={14} color="#34d399" /> // Read
                                ) : (
                                    <Ionicons name="checkmark" size={14} color="rgba(255,255,255,0.7)" /> // Delivered
                                )
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

export default function ChatScreen() {
    var params = useLocalSearchParams();
    var router = useRouter();
    var otherId = params.userId as string;

    var [messages, setMessages] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [text, setText] = useState("");
    var [sending, setSending] = useState(false);
    var [other, setOther] = useState<any>(null);
    var [pendingAttachment, setPendingAttachment] = useState<{ uri: string, type: "image" | "file", name: string } | null>(null);
    var [replyingTo, setReplyingTo] = useState<any>(null);
    var [editingMessage, setEditingMessage] = useState<any>(null);
    var [menuMessage, setMenuMessage] = useState<any>(null);
    var [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

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
            var results = await Promise.all([getDMMessages(otherId), getUserProfile(otherId)]);
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
            if (data.messages && data.messages.length > 0) setMessages(messages.concat(data.messages));
        } catch (e) { }
    };

    var handleSend = async function () {
        if ((!text.trim() && !pendingAttachment) || sending) return;
        setSending(true);
        try {
            var finalContent = text.trim();
            if (pendingAttachment) {
                var uploadResult = await uploadImages([pendingAttachment.uri]);
                var url = uploadResult.urls[0];
                var prefix = pendingAttachment.type === "image" ? "🖼️ " : "📎 ";
                finalContent = `${prefix}${url}\n${finalContent}`;
            }

            if (editingMessage) {
                await editDM(otherId, editingMessage.id, text.trim());
                setMessages(messages.map(function (m) { return m.id === editingMessage.id ? { ...m, content: text.trim() } : m; }));
                setEditingMessage(null);
            } else {
                var msg = await sendDM(otherId, finalContent, replyingTo?.id);
                setMessages(messages.concat([msg]));
                setReplyingTo(null);
            }
            setText("");
            setPendingAttachment(null);
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

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: BG_COLOR }]}>
                <ActivityIndicator size="large" color={MY_BUBBLE} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={[styles.container, { backgroundColor: BG_COLOR }]} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>

            {/* Header */}
            <View style={[styles.header, { backgroundColor: BG_COLOR }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={{ padding: spacing.sm }}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>

                {other && (
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1, justifyContent: "center", marginRight: 40 }}>
                        <View style={[styles.avatarSmall, { backgroundColor: MY_BUBBLE }]}>
                            <Text style={styles.avatarSmallText}>{other.name?.charAt(0) || "U"}</Text>
                        </View>
                        <View>
                            <Text style={[styles.headerName, { color: "#fff" }]}>{other.name}</Text>
                            {/* 🚨 REMOVED HARDCODED ONLINE STATUS */}
                            <Text style={[styles.headerStatus, { color: "#64748b" }]}>@{other.username || "user"}</Text>
                        </View>
                    </View>
                )}
                <TouchableOpacity style={{ padding: spacing.sm }}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView ref={scrollRef} contentContainerStyle={styles.messagesContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {messages.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={{ fontSize: 40, marginBottom: spacing.md }}>💬</Text>
                        <Text style={{ color: "#64748b" }}>Say hi to start the conversation.</Text>
                    </View>
                ) : (
                    messages.map(function (m: any, index: number) {
                        var showDate = false;
                        if (index === 0) showDate = true;
                        else {
                            var prevDate = new Date(messages[index - 1].createdAt).toDateString();
                            var currDate = new Date(m.createdAt).toDateString();
                            if (prevDate !== currDate) showDate = true;
                        }

                        var showAvatar = false;
                        if (index === 0) showAvatar = true;
                        else {
                            var prev = messages[index - 1];
                            var timeDiff = new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime();
                            if (prev.isMine !== m.isMine || timeDiff > 5 * 60 * 1000) showAvatar = true;
                        }

                        return (
                            <React.Fragment key={m.id}>
                                {showDate && (
                                    <View style={styles.dateSeparator}>
                                        <Text style={styles.dateText}>{formatDate(m.createdAt)}</Text>
                                    </View>
                                )}
                                <SwipeableMessage
                                    m={m}
                                    showAvatar={showAvatar}
                                    onReply={function () { setReplyingTo(m); setEditingMessage(null); setText(""); }}
                                    onLongPress={function () { setMenuMessage(m); }}
                                />
                            </React.Fragment>
                        );
                    })
                )}
            </ScrollView>

            <View style={styles.composerWrapper}>
                {replyingTo && (
                    <View style={[styles.replyPreview, { backgroundColor: THEIR_BUBBLE, borderLeftColor: MY_BUBBLE }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: "#34d399" }}>Replying to {replyingTo.isMine ? "yourself" : other?.name}</Text>
                            <Text style={{ fontSize: 12, color: "#94a3b8" }} numberOfLines={1}>{replyingTo.content}</Text>
                        </View>
                        <TouchableOpacity onPress={function () { setReplyingTo(null); }}><Text style={{ color: "#94a3b8", fontSize: 16 }}>✕</Text></TouchableOpacity>
                    </View>
                )}

                {editingMessage && (
                    <View style={[styles.replyPreview, { backgroundColor: THEIR_BUBBLE, borderLeftColor: MY_BUBBLE }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: "#34d399" }}>Editing message</Text>
                        </View>
                        <TouchableOpacity onPress={function () { setEditingMessage(null); setText(""); }}><Text style={{ color: "#94a3b8", fontSize: 16 }}>✕</Text></TouchableOpacity>
                    </View>
                )}

                {pendingAttachment && (
                    <View style={[styles.previewBox, { backgroundColor: THEIR_BUBBLE }]}>
                        {pendingAttachment.type === "image" ? (
                            <Image source={{ uri: pendingAttachment.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.previewFile}>
                                <Ionicons name="document-text" size={32} color={MY_BUBBLE} />
                                <Text style={{ color: "#e2e8f0", marginLeft: 8, flex: 1 }} numberOfLines={1}>{pendingAttachment.name}</Text>
                            </View>
                        )}
                        <TouchableOpacity onPress={() => setPendingAttachment(null)} style={styles.closePreview}>
                            <Ionicons name="close-circle" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={[styles.composerRow, { backgroundColor: THEIR_BUBBLE }]}>
                    <AttachmentButton onPick={function (uri, type, name) { setPendingAttachment({ uri, type, name }); }} />
                    <TouchableOpacity onPress={function () { setIsEmojiPickerOpen(true); }} style={styles.iconBtn}>
                        <Ionicons name="happy-outline" size={24} color="#94a3b8" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        value={text}
                        onChangeText={setText}
                        placeholder={editingMessage ? "Edit message..." : "Message..."}
                        placeholderTextColor="#64748b"
                        multiline
                    />
                    {text.trim().length === 0 && !pendingAttachment && !editingMessage ? (
                        <VoiceNoteButton userId={otherId} onSent={loadInitial} />
                    ) : (
                        <TouchableOpacity onPress={handleSend} disabled={(!text.trim() && !pendingAttachment) || sending} style={[styles.sendBtn, { backgroundColor: (text.trim() || pendingAttachment) ? MY_BUBBLE : "#1e293b" }]}>
                            <Ionicons name="arrow-up" size={20} color={(text.trim() || pendingAttachment) ? "#fff" : "#64748b"} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <EmojiPicker
                open={isEmojiPickerOpen}
                onClose={() => setIsEmojiPickerOpen(false)}
                onEmojiSelected={(emojiObject) => setText((prev) => prev + emojiObject.emoji)}
                theme={{
                    backdrop: "#0a0f0d", container: "#132a25", header: "#fff", skinTonesContainer: "#1e293b",
                    category: { icon: "#64748b", iconActive: MY_BUBBLE },
                    search: { text: "#fff", placeholder: "#64748b", icon: "#64748b" }
                }}
            />

            <Modal visible={menuMessage !== null} transparent animationType="fade" onRequestClose={function () { setMenuMessage(null); }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }} activeOpacity={1} onPress={function () { setMenuMessage(null); }}>
                    <View style={{ backgroundColor: "#132a25", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingBottom: 40 }}>
                        {menuMessage && (
                            <View style={{ paddingTop: spacing.md }}>
                                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: "#1e293b" }} onPress={function () { setReplyingTo(menuMessage); setEditingMessage(null); setText(""); setMenuMessage(null); }}>
                                    <Ionicons name="arrow-undo-outline" size={22} color="#fff" style={{ marginRight: spacing.md }} />
                                    <Text style={{ fontSize: 16, color: "#fff" }}>Reply</Text>
                                </TouchableOpacity>

                                {menuMessage.isMine && (Date.now() - new Date(menuMessage.createdAt).getTime() < 15 * 60 * 1000) && (
                                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: "#1e293b" }} onPress={function () { setEditingMessage(menuMessage); setReplyingTo(null); setText(menuMessage.content); setMenuMessage(null); }}>
                                        <Ionicons name="pencil-outline" size={22} color="#fff" style={{ marginRight: spacing.md }} />
                                        <Text style={{ fontSize: 16, color: "#fff" }}>Edit</Text>
                                    </TouchableOpacity>
                                )}

                                {menuMessage.isMine && (
                                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: "#1e293b" }} onPress={function () { var idToDelete = menuMessage.id; setMenuMessage(null); setTimeout(function () { confirmDelete(idToDelete); }, 200); }}>
                                        <Ionicons name="trash-outline" size={22} color="#ef4444" style={{ marginRight: spacing.md }} />
                                        <Text style={{ fontSize: 16, color: "#ef4444" }}>Delete</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: spacing.lg }} onPress={function () { setMenuMessage(null); }}>
                                    <Ionicons name="close-outline" size={22} color="#64748b" style={{ marginRight: spacing.md }} />
                                    <Text style={{ fontSize: 16, color: "#64748b" }}>Cancel</Text>
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
    container: { flex: 1, backgroundColor: BG_COLOR },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { flexDirection: "row", alignItems: "center", paddingTop: 60, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
    avatarSmall: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 12 },
    avatarSmallText: { color: "#fff", fontSize: 16, fontWeight: "800" },
    headerName: { fontSize: 16, fontWeight: "700" },
    headerStatus: { fontSize: 12, fontWeight: "600" },
    messagesContent: { padding: spacing.lg, paddingBottom: 100 },
    emptyBox: { alignItems: "center", paddingVertical: spacing.xxl * 2 },
    bubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22 },
    quoteBox: { padding: 8, borderRadius: 12, marginBottom: 8, borderLeftWidth: 3 },
    quoteName: { fontSize: 11, fontWeight: "800", marginBottom: 2 },
    quoteText: { fontSize: 12 },
    dateSeparator: { alignItems: "center", marginVertical: 16 },
    dateText: { fontSize: 12, fontWeight: "600", color: "#64748b", backgroundColor: "#132a25", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: "hidden" },
    composerWrapper: { padding: spacing.md, paddingBottom: Platform.OS === "ios" ? 34 : spacing.md, backgroundColor: BG_COLOR, borderTopWidth: 1, borderTopColor: "#1e293b" },
    replyPreview: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 16, marginBottom: 8, borderLeftWidth: 3 },
    composerRow: { flexDirection: "row", alignItems: "center", borderRadius: 30, paddingHorizontal: 8, paddingVertical: 6 },
    iconBtn: { padding: 8 },
    input: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: "#fff", maxHeight: 100, minHeight: 40 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginLeft: 4 },
    previewBox: { padding: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16, marginBottom: 8, flexDirection: "row", alignItems: "center" },
    previewImage: { width: 60, height: 60, borderRadius: 8 },
    previewFile: { flexDirection: "row", alignItems: "center", flex: 1 },
    closePreview: { position: "absolute", top: -8, right: -8, backgroundColor: "#0a0f0d", borderRadius: 12 },
});