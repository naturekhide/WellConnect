import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

// GET comments with replies
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;

    const comments = await prisma.comment.findMany({
      where: { 
        postId,
        parentId: null // Only top-level comments
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, username: true, image: true },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: { id: true, name: true, username: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST comment or reply
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = params;
    const body = await request.json();
    const { content, parentId } = body; // Added parentId

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: token.sub,
        postId,
        parentId: parentId || null, // Set parentId for replies
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    // Notify post owner
    if (post.userId !== token.sub) {
      try {
        await prisma.notification.create({
          data: {
            userId: parentId 
              ? (await prisma.comment.findUnique({ where: { id: parentId } }))?.userId || post.userId
              : post.userId,
            type: parentId ? "REPLY" : "COMMENT",
            message: parentId ? "Someone replied to your comment" : "Someone commented on your post",
            link: "/feed",
            fromUserId: token.sub,
          },
        });
      } catch (e) {}
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}