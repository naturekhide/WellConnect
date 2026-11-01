import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AttachmentButton({ onPress }: { onPress?: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <Ionicons name="add-circle-outline" size={26} color="#aaa" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: { padding: 8, justifyContent: "center", alignItems: "center" }
});