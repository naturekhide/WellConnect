import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            reactions: true,
            groupMembers: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const recentPosts = await prisma.post.findMany({
      where: { userId: token.sub },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      image: user.image,
      createdAt: user.createdAt,
      stats: {
        posts: user._count.posts,
        comments: user._count.comments,
        reactions: user._count.reactions,
        groups: user._count.groupMembers,
      },
      recentPosts,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio } = body;

    const updatedUser = await prisma.user.update({
      where: { id: token.sub },
      data: {
        name: name?.trim() || null,
        bio: bio?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}