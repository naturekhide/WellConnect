import jwt from "jsonwebtoken";

var SECRET = process.env.NEXTAUTH_SECRET || "wellconnect-secret-key-2026";

export function signMobileToken(userId: string): string {
    return jwt.sign({ userId }, SECRET, { expiresIn: "30d" });
}

export function verifyMobileToken(token: string): { userId: string } | null {
    try {
        // Decode as any so we can check both 'userId' and 'id'
        var decoded = jwt.verify(token, SECRET) as any;

        // If the token has 'userId' (from older mobile login), return it
        if (decoded && decoded.userId) {
            return { userId: decoded.userId };
        }
        // If the token has 'id' (from our new verify-email route), return it
        if (decoded && decoded.id) {
            return { userId: decoded.id };
        }
        return null;
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