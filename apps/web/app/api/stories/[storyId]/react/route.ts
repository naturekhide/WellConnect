import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { storyId: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var { type } = await request.json();
    if (!["HUG", "GROWTH", "STRENGTH", "GRATEFUL"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    var storyId = params.storyId;
    var story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (story.userId === token.sub) return NextResponse.json({ error: "Cannot react to own story" }, { status: 403 });

    var existing = await prisma.storyReaction.findUnique({
      where: { storyId_userId: { storyId, userId: token.sub } },
    });

    if (existing) {
      if (existing.type === type) {
        await prisma.storyReaction.delete({ where: { id: existing.id } });
      } else {
        await prisma.storyReaction.update({ where: { id: existing.id }, data: { type } });
      }
    } else {
      await prisma.storyReaction.create({ data: { type, storyId, userId: token.sub } });
    }

    var reactions = await prisma.storyReaction.findMany({ where: { storyId } });
    var counts: any = { HUG: 0, GROWTH: 0, STRENGTH: 0, GRATEFUL: 0 };
    reactions.forEach(function(r: any) { if (r.type in counts) counts[r.type]++; });

    return NextResponse.json(counts);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}