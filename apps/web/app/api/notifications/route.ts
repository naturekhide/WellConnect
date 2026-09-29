import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    var unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
}

export async function PUT(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var body = await request.json();
    var { notificationId, markAll } = body;

    if (markAll) {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    } else if (notificationId) {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }

    return NextResponse.json({ success: true });
}