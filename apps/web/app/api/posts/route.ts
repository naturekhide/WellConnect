import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { AUTH_SECRET } from "@lib/auth-config";

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

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
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
      take: 50,
    });

    const transformedPosts = posts.map((post: any) => {
      const reactionCounts: Record<string, number> = {
        HUG: 0,
        GROWTH: 0,
        STRENGTH: 0,
        GRATEFUL: 0,
      };

      post.reactions.forEach((reaction: any) => {
        if (reaction.type in reactionCounts) {
          reactionCounts[reaction.type]++;
        }
      });

      return {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        author: {
          name: post.user.name || "Anonymous",
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

    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
  req: request, 
  secret: process.env.NEXTAUTH_SECRET 
});
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, groupId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        userId: token.sub,
        groupId: groupId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      author: {
        name: post.user.name || "Anonymous",
        image: post.user.image,
      },
      reactions: {
        hug: 0,
        growth: 0,
        strength: 0,
        grateful: 0,
      },
      commentCount: 0,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}