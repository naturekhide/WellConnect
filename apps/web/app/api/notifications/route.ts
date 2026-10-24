import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    // This function checks BOTH cookies and Bearer tokens
    var userId = await getCurrentUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var notifications = await prisma.notification.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    return NextResponse.json(notifications);
}