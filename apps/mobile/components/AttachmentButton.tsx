import React from "react";
import { TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";

export default function AttachmentButton({ onPick }: { onPick: (uri: string, type: "image" | "file", name: string) => void }) {

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
            onPick(result.assets[0].uri, "image", "Photo");
        }
    };

    const handlePickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            copyToCacheDirectory: true
        });

        if (!result.canceled && result.assets[0].uri) {
            onPick(result.assets[0].uri, "file", result.assets[0].name || "File");
        }
    };

    const showOptions = () => {
        Alert.alert(
            "Attach",
            "Choose what to send",
            [
                { text: "Photo", onPress: handlePickImage },
                { text: "File", onPress: handlePickFile },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    return (
        <TouchableOpacity onPress={showOptions} style={styles.button}>
            <Ionicons name="add-circle-outline" size={26} color="#aaa" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: { padding: 8, justifyContent: "center", alignItems: "center" }
});