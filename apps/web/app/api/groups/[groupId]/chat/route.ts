import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var groupId = params.groupId;
    var groupChat = await prisma.groupChat.findUnique({ where: { groupId } });
    if (!groupChat) {
      groupChat = await prisma.groupChat.create({ data: { name: "Group Chat", groupId } });
    }

    var messages = await prisma.groupMessage.findMany({
      where: { groupChatId: groupChat.id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
      },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (e) {
    console.error("Group chat GET error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var groupId = params.groupId;
    var body = await request.json();
    var { content, audioUrl, imageUrl } = body;

    // Allow posts with text, audio, or image
    if (!content?.trim() && !audioUrl && !imageUrl) {
      return NextResponse.json({ error: "Content, audio, or image required" }, { status: 400 });
    }

    // Check membership
    var membership = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: token.sub, groupId } },
    });
    if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    // Find or create group chat
    var groupChat = await prisma.groupChat.findUnique({ where: { groupId } });
    if (!groupChat) {
      groupChat = await prisma.groupChat.create({ data: { name: "Group Chat", groupId } });
    }

    var message = await prisma.groupMessage.create({
      data: {
        content: content?.trim() || (imageUrl || ""),
        audioUrl: audioUrl || null,
        senderId: token.sub,
        groupChatId: groupChat.id,
      },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (e) {
    console.error("Group chat POST error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}