import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;
    var otherId = params.userId;

    if (otherId === userId) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

    var url = new URL(request.url);
    var since = url.searchParams.get("since");

    var where: any = {
        deletedAt: null,
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
            replyTo: {
                select: {
                    id: true,
                    content: true,
                    sender: { select: { name: true } }
                }
            }
        },
    });

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
                replyTo: m.replyTo ? {
                    id: m.replyTo.id,
                    content: m.replyTo.content,
                    senderName: m.replyTo.sender?.name || "User"
                } : null
            };
        }),
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;
    var otherId = params.userId;

    if (otherId === userId) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

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
            replyTo: {
                select: {
                    id: true,
                    content: true,
                    sender: { select: { name: true } }
                }
            }
        },
    });

    return NextResponse.json({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        isMine: true,
        sender: msg.sender,
        replyTo: msg.replyTo ? {
            id: msg.replyTo.id,
            content: msg.replyTo.content,
            senderName: msg.replyTo.sender?.name || "User"
        } : null
    }, { status: 201 });
}