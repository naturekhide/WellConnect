import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform, Alert } from "react-native";
import { getAuthToken } from "./api/client";

var API_URL = "https://well-connect-web.vercel.app";

Notifications.setNotificationHandler({
    handleNotification: async function () {
        return {
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        };
    },
});

export async function registerForPushNotifications() {
    if (!Device.isDevice) {
        Alert.alert("Push Debug", "Not a physical device");
        return null;
    }

    try {
        var permissions = await Notifications.getPermissionsAsync();
        var finalStatus = permissions.status;

        if (finalStatus !== "granted") {
            var requested = await Notifications.requestPermissionsAsync();
            finalStatus = requested.status;
        }

        if (finalStatus !== "granted") {
            Alert.alert("Push Debug", "Permission denied: " + finalStatus);
            return null;
        }

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#059669",
            });
        }

        var projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
        if (!projectId) {
            Alert.alert("Push Debug", "No project ID");
            return null;
        }

        Alert.alert("Push Debug", "Requesting token, projectId: " + projectId);

        var tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        var token = tokenData.data;

        Alert.alert("Push Debug", "Got token: " + token.substring(0, 30) + "...");

        var authToken = getAuthToken();
        if (!authToken) {
            Alert.alert("Push Debug", "No auth token - user not logged in");
            return null;
        }

        var res = await fetch(API_URL + "/api/push/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + authToken,
            },
            body: JSON.stringify({ token }),
        });

        if (!res.ok) {
            Alert.alert("Push Debug", "Backend save failed: " + res.status);
            return null;
        }

        Alert.alert("Push Debug", "SUCCESS - token registered");
        return token;
    } catch (e: any) {
        Alert.alert("Push Debug", "Error: " + (e.message || "Unknown"));
        return null;
    }
}

export async function unregisterPushNotifications() {
    try {
        var authToken = getAuthToken();
        if (authToken) {
            await fetch(API_URL + "/api/push/register", {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + authToken },
            });
        }
    } catch (e) { }
}