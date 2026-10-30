import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;
    var otherId = params.userId;

    // 🚨 Mark messages from the OTHER person as READ
    await prisma.directMessage.updateMany({
        where: {
            senderId: otherId,
            receiverId: userId,
            readAt: null
        },
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
        },
    });

    var formatted = messages.map(function (m) {
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
        };
    });

    return NextResponse.json({ messages: formatted });
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;
    var otherId = params.userId;

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

    return NextResponse.json({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        readAt: null,
        isMine: true,
        sender: msg.sender,
        replyTo: null,
    });
}

// 🚨 RESTORED: PATCH function for editing
export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var url = new URL(request.url);
    var messageId = url.searchParams.get("messageId");

    if (!messageId) return NextResponse.json({ error: "Message ID required" }, { status: 400 });

    var body = await request.json();
    var { content } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    var msg = await prisma.directMessage.findUnique({ where: { id: messageId } });
    if (!msg || msg.senderId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    var elapsed = Date.now() - new Date(msg.createdAt).getTime();
    if (elapsed > 15 * 60 * 1000) {
        return NextResponse.json({ error: "Edit window expired (15 minutes)" }, { status: 400 });
    }

    var updated = await prisma.directMessage.update({
        where: { id: messageId },
        data: { content: content.trim() },
    });

    return NextResponse.json({ id: updated.id, content: updated.content });
}

// 🚨 RESTORED: DELETE function for soft-deleting
export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var url = new URL(request.url);
    var messageId = url.searchParams.get("messageId");

    if (!messageId) return NextResponse.json({ error: "Message ID required" }, { status: 400 });

    var msg = await prisma.directMessage.findUnique({ where: { id: messageId } });
    if (!msg || msg.senderId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.directMessage.update({
        where: { id: messageId },
        data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
}