var API_URL = "https://well-connect-web.vercel.app";

export async function apiFetch(path: string, options?: any) {
    var url = API_URL + path;
    var res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
        },
        credentials: "include",
    });

    if (!res.ok) {
        var error = await res.text();
        throw new Error(error || "API error: " + res.status);
    }

    return res.json();
}

export async function login(identifier: string, password: string) {
    var csrfRes = await fetch(API_URL + "/api/auth/csrf");
    var csrfData = await csrfRes.json();
    var cookies = csrfRes.headers.get("set-cookie") || "";

    var res = await fetch(API_URL + "/api/auth/callback/credentials", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": cookies,
        },
        body: new URLSearchParams({
            identifier: identifier,
            password: password,
            csrfToken: csrfData.csrfToken,
        }).toString(),
        redirect: "manual",
    });

    if (res.ok || res.status === 302) {
        var sessionRes = await fetch(API_URL + "/api/auth/session", {
            headers: { "Cookie": cookies },
        });
        var sessionData = await sessionRes.json();
        return { url: sessionData?.user ? "/dashboard" : null, user: sessionData?.user };
    }

    return { error: "Invalid credentials" };
}

export async function registerUser(name: string, username: string, email: string, password: string) {
    return apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, username, email, password }),
    });
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

export async function getMoodHistory(days?: number) {
    return apiFetch("/api/mood?days=" + (days || 30));
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