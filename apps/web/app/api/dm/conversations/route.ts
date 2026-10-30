import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    var userId: string = userIdOrNull;

    // Get every user the current user has exchanged messages with
    var sent = await prisma.directMessage.findMany({
        where: { senderId: userId },
        select: { receiverId: true },
        distinct: ["receiverId"],
    });

    var received = await prisma.directMessage.findMany({
        where: { receiverId: userId },
        select: { senderId: true },
        distinct: ["senderId"],
    });

    var userIds = new Set<string>();
    sent.forEach(function (s) { userIds.add(s.receiverId); });
    received.forEach(function (r) { userIds.add(r.senderId); });

    if (userIds.size === 0) {
        return NextResponse.json({ conversations: [] });
    }

    var ids = Array.from(userIds);

    var conversations = await Promise.all(
        ids.map(async function (otherId) {
            var lastMessage = await prisma.directMessage.findFirst({
                where: {
                    OR: [
                        { senderId: userId, receiverId: otherId },
                        { senderId: otherId, receiverId: userId },
                    ],
                },
                orderBy: { createdAt: "desc" },
                include: {
                    sender: { select: { id: true, name: true, username: true } },
                },
            });

            var unread = await prisma.directMessage.count({
                where: { senderId: otherId, receiverId: userId, readAt: null },
            });

            var other = await prisma.user.findUnique({
                where: { id: otherId },
                select: { id: true, name: true, username: true },
            });

            // 🚨 THE FIX: Clean up the preview text if it's a voice note
            var previewContent = lastMessage?.content || "";
            if (previewContent.startsWith("🎤 ")) {
                previewContent = "🎤 Voice Note";
            }

            return {
                user: other,
                lastMessage: lastMessage
                    ? {
                        id: lastMessage.id,
                        content: previewContent, // 🚨 Return the clean text
                        createdAt: lastMessage.createdAt,
                        isMine: lastMessage.senderId === userId,
                    }
                    : null,
                unreadCount: unread,
            };
        })
    );

    conversations.sort(function (a, b) {
        var aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        var bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return bTime - aTime;
    });

    return NextResponse.json({ conversations });
}