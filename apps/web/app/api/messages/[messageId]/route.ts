import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function DELETE(request: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var message = await prisma.message.findUnique({ where: { id: params.messageId } });
    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (message.senderId !== token.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.message.delete({ where: { id: params.messageId } });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var message = await prisma.message.findUnique({ where: { id: params.messageId } });
    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (message.senderId !== token.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 15-minute edit window
    var fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (new Date(message.createdAt) < fifteenMinAgo) {
      return NextResponse.json({ error: "Edit window expired (15 min)" }, { status: 403 });
    }

    var body = await request.json();
    var { content } = body;
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

    var updated = await prisma.message.update({
      where: { id: params.messageId },
      data: { content: content.trim() },
    });

    return NextResponse.json(updated);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}