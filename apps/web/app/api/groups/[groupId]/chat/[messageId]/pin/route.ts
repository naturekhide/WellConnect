import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { groupId: string; messageId: string } }
) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var message = await prisma.groupMessage.findUnique({ where: { id: params.messageId } });
    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Check if user is group admin
    var membership = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: token.sub, groupId: params.groupId } },
    });
    if (!membership || membership.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can pin messages" }, { status: 403 });
    }

    var updated = await prisma.groupMessage.update({
      where: { id: params.messageId },
      data: { pinned: !message.pinned },
    });

    return NextResponse.json({ pinned: updated.pinned });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}