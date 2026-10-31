import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;
    var targetId = params.id;

    var user = await prisma.user.findUnique({
        where: { id: targetId },
        select: {
            id: true,
            name: true,
            username: true,
            createdAt: true,
            _count: { select: { feedPosts: true, followers: true, following: true } },
        },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if following
    var follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: userId, followingId: targetId } },
    });

    // 🚨 Check if blocked
    var block = await prisma.block.findUnique({
        where: { blockerId_blockedId: { blockerId: userId, blockedId: targetId } },
    });

    return NextResponse.json({
        id: user.id,
        name: user.name,
        username: user.username,
        createdAt: user.createdAt,
        isMe: userId === targetId,
        isFollowing: !!follow,
        isBlocked: !!block, // 🚨 Return block status
        stats: {
            posts: user._count.feedPosts,
            followers: user._count.followers,
            following: user._count.following,
        },
    });
}