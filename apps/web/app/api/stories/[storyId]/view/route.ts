import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { storyId: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var storyId = params.storyId;

    // Get the story
    var story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Don't count if viewer is the story creator
    if (story.userId === token.sub) {
      var count = await prisma.storyView.count({ where: { storyId } });
      return NextResponse.json({ views: count });
    }

    await prisma.storyView.upsert({
      where: { storyId_userId: { storyId, userId: token.sub } },
      update: {},
      create: { storyId, userId: token.sub },
    });

    var count = await prisma.storyView.count({ where: { storyId } });
    return NextResponse.json({ views: count });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}