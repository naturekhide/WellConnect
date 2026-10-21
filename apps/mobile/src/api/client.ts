import { Platform } from "react-native";
import { getItem, setItem, removeItem } from "../storage";

var API_URL = "https://well-connect-web.vercel.app";

var tokenStorage: string | null = null;
var userStorage: any = null;

export async function loadToken() {
    try {
        var token = await getItem("wellconnect_token");
        var userJson = await getItem("wellconnect_user");
        tokenStorage = token;
        userStorage = userJson ? JSON.parse(userJson) : null;
    } catch (e) { }
}

export async function setAuthToken(token: string, user: any) {
    tokenStorage = token;
    userStorage = user;
    await setItem("wellconnect_token", token);
    await setItem("wellconnect_user", JSON.stringify(user));
}

export function getAuthToken(): string | null {
    return tokenStorage;
}

export function getStoredUser(): any {
    return userStorage;
}

export async function clearAuthToken() {
    tokenStorage = null;
    userStorage = null;
    await removeItem("wellconnect_token");
    await removeItem("wellconnect_user");
}

async function apiFetch(path: string, options?: any) {
    if (!tokenStorage) {
        await loadToken();
    }

    var headers: any = {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
    };

    if (tokenStorage) {
        headers["Authorization"] = "Bearer " + tokenStorage;
    }

    // 🚨 DEBUG LOGS
    console.log("🚀 API CALL:", API_URL + path);
    console.log("🔑 TOKEN SENT:", tokenStorage ? "YES (starts with " + tokenStorage.substring(0, 10) + "...)" : "NO");

    var res = await fetch(API_URL + path, {
        ...options,
        headers: headers,
    });

    if (!res.ok) {
        var error = await res.text();
        console.log("❌ API ERROR:", res.status, error);
        throw new Error(error || "API error: " + res.status);
    }

    return res.json();
}

export async function registerUser(name: string, username: string, email: string, password: string) {
    var res = await fetch(API_URL + "/api/mobile/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
    });
    if (!res.ok) {
        var err = await res.json();
        throw new Error(err.error || "Registration failed");
    }
    var data = await res.json();
    if (data.token) await setAuthToken(data.token, data.user);
    return data;
}

export async function login(identifier: string, password: string) {
    var res = await fetch(API_URL + "/api/mobile/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
    });
    if (!res.ok) {
        var err = await res.json();
        throw new Error(err.error || "Login failed");
    }
    var data = await res.json();
    await setAuthToken(data.token, data.user);
    return data;
}

export async function getSession() { return apiFetch("/api/auth/session"); }
export async function getMoodToday() { return apiFetch("/api/mood/today"); }
export async function getMoodStats() { return apiFetch("/api/mood/stats"); }
export async function getInsights() { return apiFetch("/api/insights"); }
export async function getJournal() { return apiFetch("/api/journal"); }
export async function getGoals() { return apiFetch("/api/goals"); }
export async function getDMUnreadCount() { return apiFetch("/api/dm/unread-count"); }
export async function searchAll(q: string) { return apiFetch("/api/search?q=" + encodeURIComponent(q)); }

// ... (keep any other functions you had here like submitMood, getFeed, uploadImages, etc.)
// If you had submitMood, paste it here:
export async function submitMood(score: number, label: string, note?: string) {
    return apiFetch("/api/mood", {
        method: "POST",
        body: JSON.stringify({ score, label, note }),
    });
}