import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;
    var otherUserId = new URL(request.url).searchParams.get('userId');

    if (otherUserId) {
      var messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: sub, recipientId: otherUserId },
            { senderId: otherUserId, recipientId: sub },
          ],
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      });

      var me = await prisma.user.findUnique({ where: { id: sub }, select: { readReceipts: true } });
      if (me?.readReceipts !== false) {
        await prisma.message.updateMany({
          where: { senderId: otherUserId, recipientId: sub, readAt: null },
          data: { readAt: new Date() },
        });
      }

      return NextResponse.json(messages);
    }

    var allMessages = await prisma.message.findMany({
      where: { OR: [{ senderId: sub }, { recipientId: sub }] },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
        recipient: { select: { id: true, name: true, username: true, image: true } },
      },
      take: 100,
    });

    var conversations = new Map();
    allMessages.forEach(function(message: any) {
      var otherUser = message.senderId === sub ? message.recipient : message.sender;
      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user: otherUser,
          lastMessage: message,
          unreadCount: message.recipientId === sub && !message.readAt ? 1 : 0,
        });
      }
    });

    return NextResponse.json(Array.from(conversations.values()));
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;
    var body = await request.json();
    var { recipientId, content, audioUrl, imageUrl, fileUrl, replyToId } = body;

    if (!recipientId) return NextResponse.json({ error: "Recipient required" }, { status: 400 });
    if (!content?.trim() && !audioUrl && !imageUrl && !fileUrl) return NextResponse.json({ error: "Content required" }, { status: 400 });

    var message = await prisma.message.create({
      data: {
        content: content?.trim() || "", audioUrl: audioUrl || null, imageUrl: imageUrl || null,
        fileUrl: fileUrl || null, replyToId: replyToId || null, senderId: sub, recipientId,
      },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
        recipient: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    var isMuted = await prisma.mutedConversation.findUnique({
      where: { userId_mutedUserId: { userId: recipientId, mutedUserId: sub } },
    });

    if (!isMuted) {
      try {
        await prisma.notification.create({
          data: {
            userId: recipientId, type: "MESSAGE",
            message: audioUrl ? "New voice message" : imageUrl ? "New image" : fileUrl ? "New file" : "New message",
            link: "/messages/" + sub, fromUserId: sub,
          },
        });
      } catch (e) {}
    }

    return NextResponse.json(message, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}