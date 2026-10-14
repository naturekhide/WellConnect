import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (params.id === userId) {
        return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 });
    }

    var target = await prisma.user.findUnique({
        where: { id: params.id },
        select: { id: true },
    });

    if (!target) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    var existing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: { followerId: userId, followingId: params.id },
        },
    });

    if (existing) {
        await prisma.follow.delete({ where: { id: existing.id } });
    } else {
        await prisma.follow.create({
            data: { followerId: userId, followingId: params.id },
        });
    }

    var [followerCount, followingCount, isFollowing] = await Promise.all([
        prisma.follow.count({ where: { followingId: params.id } }),
        prisma.follow.count({ where: { followerId: params.id } }),
        prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: userId, followingId: params.id } },
        }),
    ]);

    return NextResponse.json({
        isFollowing: !!isFollowing,
        followerCount: followerCount,
        followingCount: followingCount,
    });
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var [followerCount, followingCount, isFollowing] = await Promise.all([
        prisma.follow.count({ where: { followingId: params.id } }),
        prisma.follow.count({ where: { followerId: params.id } }),
        prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: userId, followingId: params.id } },
        }),
    ]);

    return NextResponse.json({
        isFollowing: !!isFollowing,
        followerCount: followerCount,
        followingCount: followingCount,
    });
}