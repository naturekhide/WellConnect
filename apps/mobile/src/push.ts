import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getAuthToken } from "./api/client";

var API_URL = "https://well-connect-web.vercel.app";

// Only load notifications in a real build (not Expo Go)
var Notifications: any = null;
var isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
    try {
        Notifications = require("expo-notifications");
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
    } catch (e) {
        console.log("Notifications module not available");
    }
}

export async function registerForPushNotifications() {
    if (isExpoGo) {
        console.log("Push notifications skipped (Expo Go)");
        return null;
    }

    if (!Notifications) {
        console.log("Notifications module unavailable");
        return null;
    }

    if (!Device.isDevice) {
        console.log("Push requires a physical device");
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
            console.log("Push permission not granted");
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
            console.log("No project ID");
            return null;
        }

        var tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        var token = tokenData.data;

        var authToken = getAuthToken();
        if (!authToken) {
            console.log("User not logged in");
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
            console.log("Backend save failed:", res.status);
            return null;
        }

        console.log("Push token registered");
        return token;
    } catch (e: any) {
        console.log("Push registration failed:", e.message);
        return null;
    }
}

export async function unregisterPushNotifications() {
    if (isExpoGo || !Notifications) return;

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