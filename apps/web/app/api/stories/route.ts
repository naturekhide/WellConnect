import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var now = new Date();
    var following = await prisma.follow.findMany({ where: { followerId: token.sub }, select: { followingId: true } });
    var userIds = following.map(function(f: any) { return f.followingId; });
    userIds.push(token.sub);

    var stories = await prisma.story.findMany({
      where: { userId: { in: userIds }, expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        views: { where: { userId: token.sub }, select: { id: true } },
        _count: { select: { views: true } },
      },
    });

    var grouped: any = {};
    stories.forEach(function(s: any) {
      if (!grouped[s.userId]) grouped[s.userId] = { user: s.user, stories: [] };
      grouped[s.userId].stories.push(s);
    });

    return NextResponse.json(Object.values(grouped));
  } catch (e) {
    console.error("Stories GET error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { mediaUrl, type, caption } = body;
    if (!mediaUrl || !type) return NextResponse.json({ error: "Media required" }, { status: 400 });

    var expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    var story = await prisma.story.create({
      data: {
        mediaUrl,
        type,
        caption: caption || null,
        userId: token.sub,
        expiresAt,
      },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        _count: { select: { views: true } },
      },
    });

    return NextResponse.json(story, { status: 201 });
  } catch (e) {
    console.error("Stories POST error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}