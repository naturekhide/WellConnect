import React, { useState } from "react";
import { TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import { useAudioRecorder, RecordingPresets, AudioModule } from "expo-audio";
import { uploadImages, sendDM } from "../src/api/client";
import { useColors } from "../src/theme";

export default function VoiceNoteButton({ userId, onSent }: { userId: string, onSent: () => void }) {
    const colors = useColors();
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const toggleRecording = async () => {
        if (isRecording) {
            // STOP RECORDING
            try {
                await recorder.stop();
                setIsRecording(false);
                setIsUploading(true);

                const uri = recorder.uri;
                if (!uri) throw new Error("No audio recorded");

                // 1. Upload to Vercel Blob
                const uploadResult = await uploadImages([uri]);
                const audioUrl = uploadResult.urls[0];

                // 2. Send as a DM (Prefix with 🎤 so the UI knows it's audio)
                await sendDM(userId, `🎤 ${audioUrl}`);

                if (onSent) onSent(); // Trigger a refresh of the chat
            } catch (err: any) {
                Alert.alert("Upload Failed", err.message);
            } finally {
                setIsUploading(false);
            }
        } else {
            // START RECORDING
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
        }
    };

    return (
        <TouchableOpacity
            onPress={toggleRecording}
            disabled={isUploading}
            style={[
                styles.button,
                { backgroundColor: isRecording ? "#ef4444" : colors.surface, borderColor: colors.border }
            ]}
        >
            <Text style={{ fontSize: 18 }}>
                {isUploading ? "⏳" : isRecording ? "⏹️" : "🎤"}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
});