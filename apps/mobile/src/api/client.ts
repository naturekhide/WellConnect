import { Platform } from "react-native";
import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch"; // Expo's native fetch
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

    // Use expoFetch for everything to ensure consistency on Android/iOS
    var res = await expoFetch(API_URL + path, {
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
    var res = await expoFetch(API_URL + "/api/mobile/register", {
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
    var res = await expoFetch(API_URL + "/api/mobile/login", {
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

// ━━━━━ Mood & Journal ━━━━━
export async function submitMood(score: number, label: string, note?: string) {
    return apiFetch("/api/mood", { method: "POST", body: JSON.stringify({ score, label, note }) });
}
export async function getMoodToday() { return apiFetch("/api/mood/today"); }
export async function getMoodStats() { return apiFetch("/api/mood/stats"); }
export async function getInsights() { return apiFetch("/api/insights"); }
export async function getJournal() { return apiFetch("/api/journal"); }
export async function saveJournal(content: string) { return apiFetch("/api/journal", { method: "POST", body: JSON.stringify({ content }) }); }
export async function getGoals() { return apiFetch("/api/goals"); }
export async function createGoal(title: string, frequency: string) { return apiFetch("/api/goals", { method: "POST", body: JSON.stringify({ title, frequency }) }); }
export async function toggleGoal(id: string) { return apiFetch("/api/goals/" + id + "/toggle", { method: "POST" }); }

// ━━━━━ Social Feed ━━━━━
export async function getFeed(tab?: string, cursor?: string) {
    var params: string[] = [];
    if (tab && tab !== "for-you") params.push("tab=" + tab);
    if (cursor) params.push("cursor=" + cursor);
    var path = "/api/feed" + (params.length ? "?" + params.join("&") : "");
    
    var data = await apiFetch(path);
    
    // Safely map the images and ensure isMine is present
    if (data && data.posts) {
        data.posts = data.posts.map(function(p: any) {
            return {
                ...p,
                imageUrls: Array.isArray(p.imageUrls) ? p.imageUrls : [],
                isMine: p.isMine || false 
            };
        });
    }
    return data;
}

export async function createFeedPost(content: string, imageUrls: string[], anonymous: boolean, circleId?: string | null) {
    return apiFetch("/api/feed", { method: "POST", body: JSON.stringify({ content, imageUrls, anonymous, circleId: circleId || null }) });
}
export async function getFeedPost(id: string) { return apiFetch("/api/feed/" + id); }
export async function deleteFeedPost(id: string) { return apiFetch("/api/feed/" + id, { method: "DELETE" }); }
export async function reactToPost(id: string, type: string) {
    return apiFetch("/api/feed/" + id + "/react", { method: "POST", body: JSON.stringify({ type }) });
}
export async function replyToPost(id: string, content: string, anonymous: boolean, parentId?: string | null) {
    return apiFetch("/api/feed/" + id + "/reply", { method: "POST", body: JSON.stringify({ content, anonymous, parentId: parentId || null }) });
}

export async function uploadImages(uris: string[]) {
    var formData = new FormData();

    for (var i = 0; i < uris.length; i++) {
        var rawUri = uris[i];
        var rawName = rawUri.split("/").pop() || ("image_" + i + ".jpg");
        
        // 🚨 THE FIX: Create a File object directly from the local URI
        const file = new File(rawUri);
        
        // Append the File object directly
        formData.append("files", file, rawName);
    }

    if (!tokenStorage) await loadToken();
    var headers: any = {};
    if (tokenStorage) headers["Authorization"] = "Bearer " + tokenStorage;

    // 🚨 IMPORTANT: Use expoFetch instead of the standard fetch for File uploads
    var res = await expoFetch(API_URL + "/api/upload/multi", {
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

// ━━━━━ Users / Follow ━━━━━
export async function getUserProfile(id: string) { return apiFetch("/api/users/" + id); }
export async function toggleFollow(id: string) { return apiFetch("/api/users/" + id + "/follow", { method: "POST" }); }

// ━━━━━ Circles ━━━━━
export async function getCircles(q?: string) {
    var path = "/api/circles" + (q ? "?q=" + encodeURIComponent(q) : "");
    return apiFetch(path);
}
export async function createCircle(name: string, description: string, emoji: string, coverColor: string, isPrivate: boolean) {
    return apiFetch("/api/circles", { method: "POST", body: JSON.stringify({ name, description, emoji, coverColor, isPrivate }) });
}
export async function getCircle(id: string) { return apiFetch("/api/circles/" + id); }
export async function joinCircle(id: string) { return apiFetch("/api/circles/" + id + "/join", { method: "POST" }); }
export async function getCirclePosts(id: string) { return apiFetch("/api/circles/" + id + "/posts"); }
export async function getCircleMembers(id: string) { return apiFetch("/api/circles/" + id + "/members"); }
export async function getCircleMessages(id: string, since?: string) {
    var path = "/api/circles/" + id + "/messages" + (since ? "?since=" + encodeURIComponent(since) : "");
    return apiFetch(path);
}
export async function sendCircleMessage(id: string, content: string, replyToId?: string | null) {
    return apiFetch("/api/circles/" + id + "/messages", { method: "POST", body: JSON.stringify({ content, replyToId: replyToId || null }) });
}
export async function editCircleMessage(circleId: string, messageId: string, content: string) {
    return apiFetch("/api/circles/" + circleId + "/messages/edit?messageId=" + messageId, { method: "PATCH", body: JSON.stringify({ content }) });
}
export async function deleteCircleMessage(circleId: string, messageId: string) {
    return apiFetch("/api/circles/" + circleId + "/messages/" + messageId, { method: "DELETE" });
}

// ━━━━━ Direct Messages ━━━━━
export async function getConversations() { return apiFetch("/api/dm/conversations"); }
export async function getDMMessages(userId: string, since?: string) {
    var path = "/api/dm/" + userId + (since ? "?since=" + encodeURIComponent(since) : "");
    return apiFetch(path);
}
export async function sendDM(userId: string, content: string, replyToId?: string | null) {
    return apiFetch("/api/dm/" + userId, { method: "POST", body: JSON.stringify({ content, replyToId: replyToId || null }) });
}
export async function getDMUnreadCount() { return apiFetch("/api/dm/unread-count"); }
export async function editDM(userId: string, messageId: string, content: string) {
    return apiFetch("/api/dm/" + userId + "/edit?messageId=" + messageId, { method: "PATCH", body: JSON.stringify({ content }) });
}
export async function deleteDM(userId: string, messageId: string) {
    return apiFetch("/api/dm/" + userId + "/delete?messageId=" + messageId, { method: "DELETE" });
}

// ━━━━━ Search ━━━━━
export async function searchAll(q: string) { return apiFetch("/api/search?q=" + encodeURIComponent(q)); }

export async function getNotifications() {
    return apiFetch("/api/notifications");
}