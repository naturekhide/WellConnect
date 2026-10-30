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
        } catch (e) {}
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
            <View style={styles.recordingBar}>
                <TouchableOpacity onPress={cancelRecording} style={styles.cancelBtn}>
                    <Ionicons name="trash-outline" size={22} color="#ef4444" />
                </TouchableOpacity>
                
                <View style={styles.timerContainer}>
                    <View style={styles.redDot} />
                    <Text style={styles.timerText}>{formatTime(seconds)}</Text>
                    <Text style={styles.recordingLabel}>Recording...</Text>
                </View>

                <TouchableOpacity onPress={stopAndSend} style={styles.sendAudioBtn} disabled={isUploading}>
                    <Ionicons name={isUploading ? "hourglass-outline" : "send"} size={20} color="#000" />
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
    
    // 🚨 Floating Recording Bar Styles
    recordingBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#132a25",
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 8,
        justifyContent: "space-between",
    },
    cancelBtn: { padding: 4 },
    timerContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
    redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ef4444" },
    timerText: { fontSize: 16, fontWeight: "700", color: "#fff", fontVariant: ["tabular-nums"] },
    recordingLabel: { fontSize: 13, color: "#94a3b8", marginLeft: 4 },
    sendAudioBtn: { 
        width: 36, height: 36, borderRadius: 18, 
        backgroundColor: "#059669", alignItems: "center", justifyContent: "center" 
    },
});