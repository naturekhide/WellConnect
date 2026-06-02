import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { postId } = body;
    if (!postId) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

    var existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId: token.sub, postId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    } else {
      await prisma.bookmark.create({ data: { userId: token.sub, postId } });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var bookmarks = await prisma.bookmark.findMany({
      where: { userId: token.sub },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            user: { select: { id: true, name: true, username: true, image: true } },
            reactions: { select: { type: true, userId: true } },
            _count: { select: { comments: true } },
          },
        },
      },
      take: 50,
    });

    var posts = bookmarks.map(function(b: any) {
      var post = b.post;
      var rc: any = { HUG: 0, GROWTH: 0, STRENGTH: 0, GRATEFUL: 0 };
      post.reactions.forEach(function(r: any) { if (r.type in rc) rc[r.type]++; });
      return {
        id: post.id, content: post.content, imageUrl: post.imageUrl, videoUrl: post.videoUrl,
        createdAt: post.createdAt, bookmarkedAt: b.createdAt,
        author: { id: post.user.id, name: post.user.name || "Anonymous", username: post.user.username, image: post.user.image },
        reactions: { hug: rc.HUG, growth: rc.GROWTH, strength: rc.STRENGTH, grateful: rc.GRATEFUL },
        commentCount: post._count.comments,
      };
    });

    return NextResponse.json(posts);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}