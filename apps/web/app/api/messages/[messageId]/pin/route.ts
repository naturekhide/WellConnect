import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var message = await prisma.message.findUnique({ where: { id: params.messageId } });
    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

    var updated = await prisma.message.update({
      where: { id: params.messageId },
      data: { pinned: !message.pinned },
    });

    return NextResponse.json({ pinned: updated.pinned });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}