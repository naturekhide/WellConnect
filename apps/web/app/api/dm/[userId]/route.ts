import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

// 🚨 Helper to send push notifications
async function sendPushNotification(expoPushToken: string, title: string, body: string, link?: string) {
    if (!expoPushToken) return;
    try {
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: expoPushToken,
                sound: 'default',
                title,
                body,
                data: { link: link || "/" },
            }),
        });
    } catch (e) {
        console.error("Push error:", e);
    }
}

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;
    var otherId = params.userId;

    // Check if blocked
    var block = await prisma.block.findFirst({
        where: {
            OR: [
                { blockerId: userId, blockedId: otherId },
                { blockerId: otherId, blockedId: userId }
            ]
        }
    });

    if (block) return NextResponse.json({ error: "You cannot interact with this user." }, { status: 403 });

    await prisma.directMessage.updateMany({
        where: { senderId: otherId, receiverId: userId, readAt: null },
        data: { readAt: new Date() },
    });

    var url = new URL(request.url);
    var since = url.searchParams.get("since");

    var messages = await prisma.directMessage.findMany({
        where: {
            OR: [
                { senderId: userId, receiverId: otherId },
                { senderId: otherId, receiverId: userId },
            ],
            deletedAt: null,
            ...(since ? { createdAt: { gt: new Date(since) } } : {}),
        },
        orderBy: { createdAt: "asc" },
        include: {
            sender: { select: { id: true, name: true, username: true } },
            replyTo: { include: { sender: { select: { name: true } } } },
            reactions: true,
        },
    });

    var formatted = messages.map(function (m) {
        var reactionCounts: any = {};

        var msgReactions = (m.reactions || []) as any[];

        msgReactions.forEach((r: any) => {
            reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
        });

        var groupedReactions = Object.keys(reactionCounts).map(emoji => ({
            emoji,
            count: reactionCounts[emoji]
        }));

        return {
            id: m.id,
            content: m.content,
            createdAt: m.createdAt,
            readAt: m.readAt,
            isMine: m.senderId === userId,
            sender: m.sender,
            replyTo: m.replyTo ? {
                id: m.replyTo.id,
                content: m.replyTo.content,
                senderName: m.replyTo.sender.name,
            } : null,
            reactions: groupedReactions,
        };
    });

    return NextResponse.json({ messages: formatted });
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;
    var otherId = params.userId;

    var block = await prisma.block.findFirst({
        where: {
            OR: [
                { blockerId: userId, blockedId: otherId },
                { blockerId: otherId, blockedId: userId }
            ]
        }
    });

    if (block) return NextResponse.json({ error: "You cannot message this user." }, { status: 403 });

    var body = await request.json();
    var { content, replyToId } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    var msg = await prisma.directMessage.create({
        data: {
            senderId: userId,
            receiverId: otherId,
            content: content.trim(),
            replyToId: replyToId || null,
        },
        include: {
            sender: { select: { id: true, name: true, username: true } },
        },
    });

    // 🚨 Fetch receiver details to send the notification
    var receiver = await prisma.user.findUnique({
        where: { id: otherId },
        select: { expoPushToken: true },
    });

    // 🚨 Send the push notification if they have a token
    if (receiver?.expoPushToken) {
        await sendPushNotification(
            receiver.expoPushToken,
            `New message from ${msg.sender.name}`,
            content.length > 50 ? content.substring(0, 50) + "..." : content,
            `/messages/${userId}` // 👈 Link to the chat screen
        );
    }

    return NextResponse.json({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        readAt: null,
        isMine: true,
        sender: msg.sender,
        replyTo: null,
        reactions: [],
    });
}

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var url = new URL(request.url);
    var messageId = url.searchParams.get("messageId");
    if (!messageId) return NextResponse.json({ error: "Message ID required" }, { status: 400 });

    var body = await request.json();
    var { content } = body;

    if (!content || content.trim().length === 0) return NextResponse.json({ error: "Content required" }, { status: 400 });

    var msg = await prisma.directMessage.findUnique({ where: { id: messageId } });
    if (!msg || msg.senderId !== userId) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    var elapsed = Date.now() - new Date(msg.createdAt).getTime();
    if (elapsed > 15 * 60 * 1000) return NextResponse.json({ error: "Edit window expired (15 minutes)" }, { status: 400 });

    var updated = await prisma.directMessage.update({
        where: { id: messageId },
        data: { content: content.trim() },
    });

    return NextResponse.json({ id: updated.id, content: updated.content });
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var url = new URL(request.url);
    var messageId = url.searchParams.get("messageId");
    if (!messageId) return NextResponse.json({ error: "Message ID required" }, { status: 400 });

    var msg = await prisma.directMessage.findUnique({ where: { id: messageId } });
    if (!msg || msg.senderId !== userId) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    await prisma.directMessage.update({
        where: { id: messageId },
        data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
}