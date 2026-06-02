import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 5; // Only 5 videos per page — no infinite scroll

    const posts = await prisma.post.findMany({
      where: {
        groupId: null,
        videoUrl: { not: null },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        reactions: {
          select: {
            type: true,
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    const total = await prisma.post.count({
      where: { groupId: null, videoUrl: { not: null } },
    });

    const transformedPosts = posts.map((post: any) => {
      const reactionCounts: Record<string, number> = {
        HUG: 0, GROWTH: 0, STRENGTH: 0, GRATEFUL: 0,
      };
      post.reactions.forEach((r: any) => {
        if (r.type in reactionCounts) reactionCounts[r.type]++;
      });

      return {
        id: post.id,
        content: post.content,
        videoUrl: post.videoUrl,
        createdAt: post.createdAt,
        author: {
          id: post.user.id,
          name: post.user.name || "Anonymous",
          username: post.user.username,
          image: post.user.image,
        },
        reactions: {
          hug: reactionCounts.HUG,
          growth: reactionCounts.GROWTH,
          strength: reactionCounts.STRENGTH,
          grateful: reactionCounts.GRATEFUL,
        },
        commentCount: post._count.comments,
      };
    });

    return NextResponse.json({
      posts: transformedPosts,
      hasMore: page * limit < total,
      total,
      page,
    });
  } catch (error) {
    console.error("Reels error:", error);
    return NextResponse.json({ error: "Failed to fetch reels" }, { status: 500 });
  }
}