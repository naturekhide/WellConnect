var API_URL = "http://localhost:3000/api";

export async function fetchJSON(path: string, options?: any) {
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

export async function login(email: string, password: string) {
  return fetchJSON("/auth/callback/credentials", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string) {
  return fetchJSON("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function getSession() {
  return fetchJSON("/auth/session");
}

export async function getPosts(feed?: string) {
  return fetchJSON("/posts?feed=" + (feed || "for-you"));
}

export async function createPost(content: string) {
  return fetchJSON("/posts", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function submitMood(score: number, label: string, note?: string) {
  return fetchJSON("/mood", {
    method: "POST",
    body: JSON.stringify({ score, label, note }),
  });
}

export async function getMoodHistory(days?: number) {
  return fetchJSON("/mood?days=" + (days || 30));
}

export async function getMoodStats() {
  return fetchJSON("/mood/stats");
}

export async function getWellnessArticles(category?: string) {
  var path = "/wellness";
  if (category && category !== "all") path += "?category=" + category;
  return fetchJSON(path);
}