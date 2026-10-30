import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useColors, spacing, radius } from "../src/theme";

export default function AudioMessage({ url, isMine }: { url: string, isMine: boolean }) {
    const colors = useColors();
    const player = useAudioPlayer(url);
    const status = useAudioPlayerStatus(player);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status.isLoaded !== undefined) {
            setLoading(false);
        }
    }, [status.isLoaded]);

    const togglePlay = () => {
        if (status.playing) {
            player.pause();
        } else {
            player.play();
        }
    };

    // Format time (e.g., 0:05 / 0:12)
    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: isMine ? "rgba(255,255,255,0.2)" : colors.surface }]}>
            <TouchableOpacity onPress={togglePlay} style={[styles.playBtn, { backgroundColor: isMine ? "#fff" : colors.primary }]}>
                {loading ? (
                    <ActivityIndicator size="small" color={isMine ? colors.primary : "#fff"} />
                ) : (
                    <Text style={{ fontSize: 16, color: isMine ? colors.primary : "#fff" }}>
                        {status.playing ? "⏸" : "▶"}
                    </Text>
                )}
            </TouchableOpacity>

            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: isMine ? "rgba(255,255,255,0.3)" : colors.border }]}>
                    <View 
                        style={[
                            styles.progressFill, 
                            { 
                                backgroundColor: isMine ? "#fff" : colors.primary,
                                width: `${(status.currentTime / (status.duration || 1)) * 100}%` 
                            }
                        ]} 
                    />
                </View>
                <Text style={[styles.timeText, { color: isMine ? "rgba(255,255,255,0.8)" : colors.textSecondary }]}>
                    {formatTime(status.currentTime)} / {formatTime(status.duration)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: "row", alignItems: "center", padding: spacing.sm, borderRadius: radius.md, minWidth: 200, marginVertical: 4 },
    playBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: spacing.sm },
    progressContainer: { flex: 1 },
    progressBar: { height: 4, borderRadius: 2, overflow: "hidden", marginBottom: 4 },
    progressFill: { height: "100%", borderRadius: 2 },
    timeText: { fontSize: 10, fontWeight: "600", textAlign: "right" }
});