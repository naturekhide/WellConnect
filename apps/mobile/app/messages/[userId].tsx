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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getDMMessages, sendDM, getUserProfile } from "../../src/api/client";
import { useColors, spacing, radius } from "../../src/theme";

export default function ChatScreen() {
    var router = useRouter();
    var params = useLocalSearchParams();
    var otherId = params.userId as string;
    var colors = useColors();

    var [messages, setMessages] = useState<any[]>([]);
    var [loading, setLoading] = useState(true);
    var [text, setText] = useState("");
    var [sending, setSending] = useState(false);
    var [other, setOther] = useState<any>(null);
    var scrollRef = useRef<ScrollView>(null);

    useEffect(function () {
        loadInitial();
        var interval = setInterval(poll, 3000);
        return function () { clearInterval(interval); };
    }, [otherId]);

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
            var msg = await sendDM(otherId, text.trim());
            setMessages(messages.concat([msg]));
            setText("");
        } catch (e: any) {
            Alert.alert("Failed", e.message);
        }
        setSending(false);
    };

    var formatTime = function (d: string) {
        return new Date(d).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={function () { router.back(); }} style={styles.backBtn}>
                    <Text style={[styles.backText, { color: colors.textPrimary }]}>←</Text>
                </TouchableOpacity>
                {other && (
                    <TouchableOpacity
                        onPress={function () { router.push("/users/" + otherId); }}
                        style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 }}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarSmallText}>{other.name?.charAt(0) || "U"}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={[styles.topName, { color: colors.textPrimary }]} numberOfLines={1}>
                                {other.name}
                            </Text>
                            <Text style={[styles.topUsername, { color: colors.textSecondary }]} numberOfLines={1}>
                                @{other.username || "user"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                ref={scrollRef}
                onContentSizeChange={function () { scrollRef.current?.scrollToEnd({ animated: true }); }}
                contentContainerStyle={styles.messagesContent}
                keyboardShouldPersistTaps="handled"
            >
                {loading ? (
                    <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
                ) : messages.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={{ fontSize: 40, marginBottom: spacing.md }}>💬</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Say hi to start the conversation.
                        </Text>
                    </View>
                ) : (
                    messages.map(function (m: any) {
                        return (
                            <View
                                key={m.id}
                                style={{
                                    flexDirection: "row",
                                    justifyContent: m.isMine ? "flex-end" : "flex-start",
                                    marginBottom: spacing.sm,
                                }}
                            >
                                <View
                                    style={{
                                        maxWidth: "78%",
                                        paddingHorizontal: spacing.md,
                                        paddingVertical: spacing.sm,
                                        borderRadius: radius.lg,
                                        backgroundColor: m.isMine ? colors.primary : colors.surfaceAlt,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            lineHeight: 20,
                                            color: m.isMine ? "#fff" : colors.textPrimary,
                                        }}
                                    >
                                        {m.content}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            opacity: 0.7,
                                            marginTop: 4,
                                            textAlign: m.isMine ? "right" : "left",
                                            color: m.isMine ? "#fff" : colors.textTertiary,
                                        }}
                                    >
                                        {formatTime(m.createdAt)}
                                    </Text>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <View style={[styles.composer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary, borderColor: colors.border }]}
                    value={text}
                    onChangeText={setText}
                    placeholder="Message..."
                    placeholderTextColor={colors.textTertiary}
                    maxLength={1000}
                    multiline
                />
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={!text.trim() || sending}
                    style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.border }]}
                >
                    <Text style={{ color: text.trim() ? "#fff" : colors.textTertiary, fontSize: 18, fontWeight: "700" }}>
                        {sending ? "..." : "→"}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1 },
    topBar: {
        flexDirection: "row", alignItems: "center", gap: spacing.sm,
        paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, borderBottomWidth: 1,
    },
    backBtn: { width: 32, height: 32, justifyContent: "center" },
    backText: { fontSize: 22 },
    avatarSmall: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    avatarSmallText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    topName: { fontSize: 15, fontWeight: "700" },
    topUsername: { fontSize: 12 },
    messagesContent: { padding: spacing.lg, paddingBottom: spacing.xl },
    emptyBox: { alignItems: "center", paddingVertical: spacing.xxl * 2 },
    emptyText: { fontSize: 14, textAlign: "center" },
    composer: {
        flexDirection: "row", alignItems: "flex-end", gap: spacing.sm,
        paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1,
    },
    input: {
        flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        borderRadius: radius.md, borderWidth: 1, fontSize: 14, maxHeight: 100,
    },
    sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});