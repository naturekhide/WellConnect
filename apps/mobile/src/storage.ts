import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getItem(key: string): Promise<string | null> {
    try {
        if (Platform.OS === "web") {
            return localStorage.getItem(key);
        }
        return await AsyncStorage.getItem(key);
    } catch (e) {
        return null;
    }
}

export async function setItem(key: string, value: string): Promise<void> {
    try {
        if (Platform.OS === "web") {
            localStorage.setItem(key, value);
        } else {
            await AsyncStorage.setItem(key, value);
        }
    } catch (e) { }
}

export async function removeItem(key: string): Promise<void> {
    try {
        if (Platform.OS === "web") {
            localStorage.removeItem(key);
        } else {
            await AsyncStorage.removeItem(key);
        }
    } catch (e) { }
}