import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { extractAndSaveHashtags } from "@/lib/hashtags";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var { searchParams } = new URL(request.url);
    var groupId = searchParams.get('groupId');
    var feed = searchParams.get('feed') || 'for-you';

    var whereClause: any = {};
    if (groupId) whereClause.groupId = groupId;
    else whereClause.groupId = null;

    if (feed === 'following') {
      var following = await prisma.follow.findMany({ where: { followerId: token.sub }, select: { followingId: true } });
      var followingIds = following.map(function(f: any) { return f.followingId; });
      followingIds.push(token.sub);
      whereClause.userId = { in: followingIds };
    }

    var posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: feed === 'trending' ? { reactions: { _count: "desc" } } : { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        reactions: { select: { type: true, userId: true } },
        poll: {
          include: {
            options: {
              include: {
                _count: { select: { votes: true } },
                votes: { where: { userId: token.sub }, select: { id: true } },
              },
            },
          },
        },
        hashtags: { include: { hashtag: true } },
        _count: { select: { comments: true } },
      },
      take: 50,
    });

    var transformedPosts = posts.map(function(post: any) {
      var rc: any = { HUG: 0, GROWTH: 0, STRENGTH: 0, GRATEFUL: 0 };
      post.reactions.forEach(function(r: any) { if (r.type in rc) rc[r.type]++; });
      return {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        videoUrl: post.videoUrl,
        poll: post.poll,
        hashtags: post.hashtags,
        createdAt: post.createdAt,
        author: { id: post.user.id, name: post.user.name || "Anonymous", username: post.user.username, image: post.user.image },
        reactions: { hug: rc.HUG, growth: rc.GROWTH, strength: rc.STRENGTH, grateful: rc.GRATEFUL },
        commentCount: post._count.comments,
      };
    });

    return NextResponse.json(transformedPosts);
  } catch (e) {
    console.error("Error fetching posts:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { content, groupId, imageUrl, videoUrl } = body;

    if ((!content || content.trim().length === 0) && !imageUrl && !videoUrl) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    var post = await prisma.post.create({
      data: { content: content?.trim() || "", userId: token.sub, groupId: groupId || null, imageUrl: imageUrl || null, videoUrl: videoUrl || null },
      include: { user: { select: { id: true, name: true, username: true, image: true } } },
    });

    if (content && content.includes("#")) {
      try { await extractAndSaveHashtags(post.id, content); } catch (e) {}
    }

    return NextResponse.json({
      id: post.id, content: post.content, imageUrl: post.imageUrl, videoUrl: post.videoUrl,
      poll: null, createdAt: post.createdAt,
      author: { id: post.user.id, name: post.user.name || "Anonymous", username: post.user.username, image: post.user.image },
      reactions: { hug: 0, growth: 0, strength: 0, grateful: 0 }, commentCount: 0,
    }, { status: 201 });
  } catch (e) {
    console.error("Error creating post:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}