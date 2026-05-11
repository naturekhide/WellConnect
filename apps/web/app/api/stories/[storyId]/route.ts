import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function DELETE(request: NextRequest, { params }: { params: { storyId: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var story = await prisma.story.findUnique({ where: { id: params.storyId } });
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (story.userId !== token.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.story.delete({ where: { id: params.storyId } });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}