import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var circle = await prisma.circle.findUnique({
        where: { id: params.id },
        include: {
            creator: { select: { id: true, name: true, username: true } },
            _count: { select: { members: true, posts: true } },
        },
    });

    if (!circle) {
        return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    var membership = await prisma.circleMember.findUnique({
        where: { circleId_userId: { circleId: params.id, userId: userId } },
    });

    return NextResponse.json({
        id: circle.id,
        name: circle.name,
        slug: circle.slug,
        description: circle.description,
        emoji: circle.emoji,
        coverColor: circle.coverColor,
        isPrivate: circle.isPrivate,
        creator: circle.creator,
        memberCount: circle._count.members,
        postCount: circle._count.posts,
        myRole: membership?.role || null,
        myStatus: membership?.status || null,
    });
}