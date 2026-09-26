import jwt from "jsonwebtoken";

var SECRET = process.env.NEXTAUTH_SECRET || "wellconnect-secret-key-2026";

export function signMobileToken(userId: string): string {
    return jwt.sign({ userId }, SECRET, { expiresIn: "30d" });
}

export function verifyMobileToken(token: string): { userId: string } | null {
    try {
        var decoded = jwt.verify(token, SECRET) as { userId: string };
        return decoded;
    } catch (e) {
        return null;
    }
}

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
    // Try Bearer token first (mobile)
    var auth = request.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
        var token = auth.substring(7);
        var payload = verifyMobileToken(token);
        if (payload) return payload.userId;
    }
    return null;
}