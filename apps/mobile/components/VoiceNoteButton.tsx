import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAudioRecorder, RecordingPresets, AudioModule } from "expo-audio";
import { uploadImages, sendDM } from "../src/api/client";
import { Ionicons } from "@expo/vector-icons";

export default function VoiceNoteButton({ userId, onSent }: { userId: string, onSent: () => void }) {
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => setSeconds((s) => s + 1), 1000);
        } else {
            setSeconds(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const startRecording = async () => {
        const { granted } = await AudioModule.requestRecordingPermissionsAsync();
        if (!granted) {
            Alert.alert("Permission Denied", "We need microphone access to record voice notes.");
            return;
        }
        try {
            await recorder.prepareToRecordAsync();
            recorder.record();
            setIsRecording(true);
        } catch (err: any) {
            Alert.alert("Recording Failed", err.message);
        }
    };

    const cancelRecording = async () => {
        try {
            await recorder.stop();
            setIsRecording(false);
        } catch (e) { }
    };

    const stopAndSend = async () => {
        try {
            await recorder.stop();
            setIsRecording(false);
            setIsUploading(true);

            const uri = recorder.uri;
            if (!uri) throw new Error("No audio recorded");

            const uploadResult = await uploadImages([uri]);
            const audioUrl = uploadResult.urls[0];

            await sendDM(userId, `🎤 ${audioUrl}`);
            if (onSent) onSent();
        } catch (err: any) {
            Alert.alert("Upload Failed", err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    // 🚨 If recording, show the floating bar instead of the mic icon
    if (isRecording) {
        return (
            <View style={styles.recordingOverlay}>
                <TouchableOpacity onPress={cancelRecording} style={styles.cancelBtn}>
                    <Ionicons name="trash-outline" size={24} color="#ef4444" />
                </TouchableOpacity>

                <View style={styles.timerContainer}>
                    <View style={styles.redDot} />
                    <Text style={styles.timerText}>{formatTime(seconds)}</Text>
                </View>

                <TouchableOpacity onPress={stopAndSend} style={styles.sendAudioBtn} disabled={isUploading}>
                    <Ionicons name={isUploading ? "hourglass-outline" : "send"} size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    }

    // Otherwise, show the normal mic button
    return (
        <TouchableOpacity onPress={startRecording} style={styles.iconBtn}>
            <Ionicons name="mic-outline" size={24} color="#94a3b8" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    iconBtn: { padding: 8, justifyContent: "center", alignItems: "center" },

    // 🚨 Absolute Overlay for Recording
    recordingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#132a25",
        borderRadius: 30,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        justifyContent: "space-between",
        zIndex: 10,
    },
    cancelBtn: { padding: 8 },
    timerContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
    redDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#ef4444" },
    timerText: { fontSize: 16, fontWeight: "700", color: "#fff", fontVariant: ["tabular-nums"] },
    sendAudioBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: "#059669", alignItems: "center", justifyContent: "center"
    },
});