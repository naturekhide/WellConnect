import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var otherId = params.userId;
    if (otherId === userId) {
        return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    var url = new URL(request.url);
    var since = url.searchParams.get("since");

    var where: any = {
        OR: [
            { senderId: userId, receiverId: otherId },
            { senderId: otherId, receiverId: userId },
        ],
    };

    if (since) {
        where.createdAt = { gt: new Date(since) };
    }

    var messages = await prisma.directMessage.findMany({
        where: where,
        orderBy: { createdAt: "asc" },
        take: since ? 100 : 50,
        include: {
            sender: { select: { id: true, name: true, username: true } },
        },
    });

    // Mark messages from the other person as read
    if (!since) {
        await prisma.directMessage.updateMany({
            where: { senderId: otherId, receiverId: userId, readAt: null },
            data: { readAt: new Date() },
        });
    }

    return NextResponse.json({
        messages: messages.map(function (m) {
            return {
                id: m.id,
                content: m.content,
                createdAt: m.createdAt,
                isMine: m.senderId === userId,
                sender: m.sender,
            };
        }),
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var otherId = params.userId;
    if (otherId === userId) {
        return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    var other = await prisma.user.findUnique({
        where: { id: otherId },
        select: { id: true },
    });

    if (!other) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    var body = await request.json();
    var { content } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    if (content.length > 1000) {
        return NextResponse.json({ error: "Message too long (max 1000)" }, { status: 400 });
    }

    var msg = await prisma.directMessage.create({
        data: {
            senderId: userId,
            receiverId: otherId,
            content: content.trim(),
        },
        include: {
            sender: { select: { id: true, name: true, username: true } },
        },
    });

    return NextResponse.json({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        isMine: true,
        sender: msg.sender,
    }, { status: 201 });
}