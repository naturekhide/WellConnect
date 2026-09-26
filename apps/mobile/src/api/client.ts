var API_URL = "https://well-connect-web.vercel.app";
var TOKEN_KEY = "wellconnect_token";

// Simple in-memory + AsyncStorage-style token storage
var tokenStorage: string | null = null;

export function setAuthToken(token: string) {
    tokenStorage = token;
}

export function getAuthToken(): string | null {
    return tokenStorage;
}

export function clearAuthToken() {
    tokenStorage = null;
}

async function apiFetch(path: string, options?: any) {
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
    setAuthToken(data.token);
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
    setAuthToken(data.token);
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