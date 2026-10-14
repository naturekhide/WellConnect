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

    var user = await prisma.user.findUnique({
        where: { id: params.id },
        select: {
            id: true,
            name: true,
            username: true,
            createdAt: true,
        },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    var [postCount, followerCount, followingCount, isFollowing, isMe] = await Promise.all([
        prisma.feedPost.count({ where: { authorId: params.id } }),
        prisma.follow.count({ where: { followingId: params.id } }),
        prisma.follow.count({ where: { followerId: params.id } }),
        prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: userId, followingId: params.id } },
        }),
        Promise.resolve(userId === params.id),
    ]);

    return NextResponse.json({
        ...user,
        stats: {
            posts: postCount,
            followers: followerCount,
            following: followingCount,
        },
        isFollowing: !!isFollowing,
        isMe: isMe,
    });
}