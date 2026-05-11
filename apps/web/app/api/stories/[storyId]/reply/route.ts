import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { storyId: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { content } = body;
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

    var storyId = params.storyId;
    var story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (story.userId === token.sub) return NextResponse.json({ error: "Cannot reply to your own story" }, { status: 403 });

    var reply = await prisma.storyReply.create({
      data: { content: content.trim(), storyId, userId: token.sub },
      include: { user: { select: { id: true, name: true, username: true, image: true } } },
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function GET(request: NextRequest, { params }: { params: { storyId: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var storyId = params.storyId;
    var story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });

    var whereClause: any = { storyId };
    if (story.userId !== token.sub) whereClause.userId = token.sub;

    var replies = await prisma.storyReply.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, username: true, image: true } } },
    });

    return NextResponse.json(replies);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}