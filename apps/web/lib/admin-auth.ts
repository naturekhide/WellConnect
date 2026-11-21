import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export async function checkAdmin(request: NextRequest) {
    // 1. Get user ID using your existing helper
    const userId = await getCurrentUserId(request);

    if (!userId) {
        return {
            error: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        };
    }

    // 2. Check their role in the database
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
        return {
            error: NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
        };
    }

    // 3. They are an admin! Return success.
    return { success: true, userId };
}