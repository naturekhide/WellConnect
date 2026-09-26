import { auth } from "./auth";
import { getUserIdFromRequest } from "./mobile-auth";

export async function getCurrentUserId(request: Request): Promise<string | null> {
    // Try mobile Bearer token
    var mobileId = await getUserIdFromRequest(request);
    if (mobileId) return mobileId;

    // Fall back to NextAuth session
    var session = await auth();
    if (session?.user) return (session.user as any).id;

    return null;
}