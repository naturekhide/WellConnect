import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getAuthToken } from "./api/client";

var API_URL = "https://well-connect-web.vercel.app";

Notifications.setNotificationHandler({
    handleNotification: async function () {
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        };
    },
});

export async function registerForPushNotifications() {
    if (!Device.isDevice) {
        console.log("Push notifications require a physical device");
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
            console.log("Push notification permission denied");
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
            console.log("Project ID not found");
            return null;
        }

        var tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        var token = tokenData.data;

        // Send to backend
        var authToken = getAuthToken();
        if (authToken) {
            await fetch(API_URL + "/api/push/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + authToken,
                },
                body: JSON.stringify({ token }),
            });
        }

        return token;
    } catch (e) {
        console.log("Push registration failed:", e);
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