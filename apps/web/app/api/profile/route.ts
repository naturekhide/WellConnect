import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: {
        id: true, name: true, username: true, email: true, bio: true, image: true, website: true, createdAt: true,
        _count: { select: { posts: true, comments: true, reactions: true, groupMembers: true, followers: true, following: true } },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    var recentPosts = await prisma.post.findMany({
      where: { userId: token.sub },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { reactions: true, comments: true } } },
    });

    return NextResponse.json({
      id: user.id, name: user.name, username: user.username, email: user.email,
      bio: user.bio, image: user.image, website: user.website, createdAt: user.createdAt,
      stats: {
        posts: user._count.posts, comments: user._count.comments, reactions: user._count.reactions,
        groups: user._count.groupMembers, followers: user._count.followers, following: user._count.following,
      },
      recentPosts,
    });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { name, bio, website } = body;

    var updatedUser = await prisma.user.update({
      where: { id: token.sub },
      data: { name: name?.trim() || null, bio: bio?.trim() || null, website: website?.trim() || null },
      select: { id: true, name: true, username: true, email: true, bio: true, image: true, website: true },
    });

    return NextResponse.json(updatedUser);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}