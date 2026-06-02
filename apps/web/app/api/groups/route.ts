import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var groups = await prisma.group.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { members: true, posts: true } } },
    });

    var transformedGroups = groups.map(function(group: any) {
      return {
        id: group.id, name: group.name, description: group.description,
        category: group.category, imageUrl: group.imageUrl, isPrivate: group.isPrivate,
        memberCount: group._count.members, postCount: group._count.posts, createdAt: group.createdAt,
      };
    });

    return NextResponse.json(transformedGroups);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { name, description, category, isPrivate } = body;
    if (!name || name.trim().length === 0) return NextResponse.json({ error: "Group name required" }, { status: 400 });

    var group = await prisma.group.create({
      data: { name: name.trim(), description: description?.trim() || null, category: category || "general", isPrivate: isPrivate || false },
    });

    await prisma.groupMember.create({ data: { userId: token.sub, groupId: group.id, role: "ADMIN" } });

    return NextResponse.json({
      id: group.id, name: group.name, description: group.description,
      category: group.category, isPrivate: group.isPrivate, memberCount: 1, postCount: 0,
    }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}