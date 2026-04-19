import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "../../../../lib/auth";

const prisma = new PrismaClient();

// GET /api/groups - Fetch all groups
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groups = await prisma.group.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    const transformedGroups = groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      category: group.category,
      imageUrl: group.imageUrl,
      isPrivate: group.isPrivate,
      memberCount: group._count.members,
      postCount: group._count.posts,
      createdAt: group.createdAt,
    }));

    return NextResponse.json(transformedGroups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, isPrivate } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        category: category || "general",
        isPrivate: isPrivate || false,
      },
    });

    await prisma.groupMember.create({
      data: {
        userId: session.user.id,
        groupId: group.id,
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      id: group.id,
      name: group.name,
      description: group.description,
      category: group.category,
      isPrivate: group.isPrivate,
      memberCount: 1,
      postCount: 0,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}