import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;
    var targetId = params.id;

    // 1. Fetch the user profile data
    var user = await prisma.user.findUnique({
        where: { id: targetId },
        select: {
            id: true,
            name: true,
            username: true,
            createdAt: true,
            links: { orderBy: { createdAt: "asc" } },
            _count: { select: { feedPosts: true, followers: true, following: true } },
        },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 2. Fetch the user's public posts
    var posts = await prisma.feedPost.findMany({
        where: {
            authorId: targetId,
            deletedAt: null,
            circleId: null,  // Only public posts
            anonymous: false // Only non-anonymous posts
        },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
            author: { select: { id: true, name: true, username: true } },
            _count: { select: { replies: true, reactions: true } },
        },
    });

    // Format posts for the frontend
    var formattedPosts = posts.map((p: any) => {
        var parsedImages = [];
        if (p.imageUrls) {
            try { parsedImages = JSON.parse(p.imageUrls); } catch (e) { parsedImages = [p.imageUrls]; }
        }
        return {
            id: p.id,
            content: p.content,
            imageUrls: parsedImages,
            createdAt: p.createdAt,
            author: p.author,
            replyCount: p._count.replies,
            reactionCount: p._count.reactions,
            isMine: p.authorId === userId,
        };
    });

    // 3. Check relationships
    var follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: userId, followingId: targetId } },
    });

    var block = await prisma.block.findUnique({
        where: { blockerId_blockedId: { blockerId: userId, blockedId: targetId } },
    });

    // 4. Return everything
    return NextResponse.json({
        id: user.id,
        name: user.name,
        username: user.username,
        createdAt: user.createdAt,
        links: user.links,
        posts: formattedPosts, // 👈 Send posts to the frontend
        isMe: userId === targetId,
        isFollowing: !!follow,
        isBlocked: !!block,
        stats: {
            posts: user._count.feedPosts,
            followers: user._count.followers,
            following: user._count.following,
        },
    });
}