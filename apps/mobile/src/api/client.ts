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

    var res = await fetch(API_URL + path, {
        ...options,
        headers: headers,
    });

    if (!res.ok) {
        var error = await res.text();
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
    await setAuthToken(data.token, data.user);
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

export async function getSession() {
    return apiFetch("/api/auth/session");
}

export async function submitMood(score: number, label: string, note?: string) {
    return apiFetch("/api/mood", {
        method: "POST",
        body: JSON.stringify({ score, label, note }),
    });
}

export async function getMoodToday() {
    return apiFetch("/api/mood/today");
}

export async function getMoodStats() {
    return apiFetch("/api/mood/stats");
}

export async function getInsights() {
    return apiFetch("/api/insights");
}

export async function getJournal() {
    return apiFetch("/api/journal");
}

export async function saveJournal(content: string) {
    return apiFetch("/api/journal", {
        method: "POST",
        body: JSON.stringify({ content }),
    });
}

export async function getGoals() {
    return apiFetch("/api/goals");
}

export async function createGoal(title: string, frequency: string) {
    return apiFetch("/api/goals", {
        method: "POST",
        body: JSON.stringify({ title, frequency }),
    });
}

export async function toggleGoal(id: string) {
    return apiFetch("/api/goals/" + id + "/toggle", {
        method: "POST",
    });
}

// ━━━━━ Social Feed ━━━━━

export async function getFeed(tab?: string, cursor?: string) {
    var params: string[] = [];
    if (tab && tab !== "for-you") params.push("tab=" + tab);
    if (cursor) params.push("cursor=" + cursor);
    var path = "/api/feed" + (params.length ? "?" + params.join("&") : "");
    return apiFetch(path);
}

export async function createFeedPost(content: string, imageUrls: string[], anonymous: boolean) {
    return apiFetch("/api/feed", {
        method: "POST",
        body: JSON.stringify({ content, imageUrls, anonymous }),
    });
}

export async function getFeedPost(id: string) {
    return apiFetch("/api/feed/" + id);
}

export async function deleteFeedPost(id: string) {
    return apiFetch("/api/feed/" + id, { method: "DELETE" });
}

export async function reactToPost(id: string, type: string) {
    return apiFetch("/api/feed/" + id + "/react", {
        method: "POST",
        body: JSON.stringify({ type }),
    });
}

export async function replyToPost(id: string, content: string, anonymous: boolean) {
    return apiFetch("/api/feed/" + id + "/reply", {
        method: "POST",
        body: JSON.stringify({ content, anonymous }),
    });
}

export async function uploadImages(uris: string[]) {
    var formData = new FormData();

    for (var i = 0; i < uris.length; i++) {
        var rawUri = uris[i];

        // Guarantee a filename with an allowed extension
        var rawName = rawUri.split("/").pop() || ("image_" + i + ".jpg");
        if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(rawName)) {
            rawName = "image_" + i + ".jpg";
        }

        var ext = rawName.split(".").pop()?.toLowerCase() || "jpg";
        var mime =
            ext === "png" ? "image/png" :
                ext === "gif" ? "image/gif" :
                    ext === "webp" ? "image/webp" :
                        "image/jpeg";

        // Android needs a plain absolute path or content:// — not file://
        var uploadUri = rawUri;
        if (Platform.OS === "android") {
            if (uploadUri.startsWith("file://")) {
                uploadUri = uploadUri.replace("file://", "");
            }
        }

        formData.append("files", {
            uri: uploadUri,
            name: rawName,
            type: mime,
        } as any);
    }

    if (!tokenStorage) {
        await loadToken();
    }

    var headers: any = {};
    if (tokenStorage) {
        headers["Authorization"] = "Bearer " + tokenStorage;
    }

    var res = await fetch(API_URL + "/api/upload/multi", {
        method: "POST",
        headers: headers,
        body: formData,
    });

    if (!res.ok) {
        var error = await res.text();
        throw new Error(error || "Upload failed");
    }

    return res.json();
}