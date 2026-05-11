import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var otherUserId = new URL(request.url).searchParams.get('userId');

    if (otherUserId) {
      var messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: token.sub, recipientId: otherUserId },
            { senderId: otherUserId, recipientId: token.sub },
          ],
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      });

      // Only mark as read if the recipient (token.sub) has read receipts ON
      var me = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { readReceipts: true },
      });

      if (me?.readReceipts !== false) {
        await prisma.message.updateMany({
          where: { senderId: otherUserId, recipientId: token.sub, readAt: null },
          data: { readAt: new Date() },
        });
      }

      return NextResponse.json(messages);
    }

    var allMessages = await prisma.message.findMany({
      where: { OR: [{ senderId: token.sub }, { recipientId: token.sub }] },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
        recipient: { select: { id: true, name: true, username: true, image: true } },
      },
      take: 100,
    });

    var conversations = new Map();
    allMessages.forEach(function(message: any) {
      var otherUser = message.senderId === token.sub ? message.recipient : message.sender;
      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user: otherUser,
          lastMessage: message,
          unreadCount: message.recipientId === token.sub && !message.readAt ? 1 : 0,
        });
      }
    });

    return NextResponse.json(Array.from(conversations.values()));
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { recipientId, content, audioUrl, imageUrl, fileUrl, replyToId } = body;

    if (!recipientId) return NextResponse.json({ error: "Recipient required" }, { status: 400 });
    if (!content?.trim() && !audioUrl && !imageUrl && !fileUrl) return NextResponse.json({ error: "Content required" }, { status: 400 });

    var message = await prisma.message.create({
      data: {
        content: content?.trim() || "",
        audioUrl: audioUrl || null,
        imageUrl: imageUrl || null,
        fileUrl: fileUrl || null,
        replyToId: replyToId || null,
        senderId: token.sub,
        recipientId,
      },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
        recipient: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    // Check if muted before sending notification
    var isMuted = await prisma.mutedConversation.findUnique({
      where: { userId_mutedUserId: { userId: recipientId, mutedUserId: token.sub } },
    });

    if (!isMuted) {
      try {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: "MESSAGE",
            message: audioUrl ? "New voice message" : imageUrl ? "New image" : fileUrl ? "New file" : "New message",
            link: "/messages/" + token.sub,
            fromUserId: token.sub,
          },
        });
      } catch (e) {}
    }

    return NextResponse.json(message, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}