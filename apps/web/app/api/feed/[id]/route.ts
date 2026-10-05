import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var post = await prisma.feedPost.findUnique({
        where: { id: params.id },
        include: {
            author: { select: { id: true, name: true, username: true } },
            reactions: { select: { type: true, userId: true } },
            replies: {
                orderBy: { createdAt: "asc" },
                include: {
                    author: { select: { id: true, name: true, username: true } },
                },
            },
        },
    });

    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    var rc: any = { hug: 0, growth: 0, strength: 0, grateful: 0 };
    var mine: string | null = null;

    post.reactions.forEach(function (r) {
        if (r.type in rc) rc[r.type]++;
        if (r.userId === userId) mine = r.type;
    });

    var replies = post.replies.map(function (reply) {
        return {
            id: reply.id,
            content: reply.content,
            anonymous: reply.anonymous,
            createdAt: reply.createdAt,
            author: reply.anonymous ? null : reply.author,
        };
    });

    return NextResponse.json({
        id: post.id,
        content: post.content,
        imageUrls: post.imageUrls ? JSON.parse(post.imageUrls) : [],
        anonymous: post.anonymous,
        sentiment: post.sentiment,
        createdAt: post.createdAt,
        author: post.anonymous ? null : post.author,
        reactions: rc,
        myReaction: mine,
        replyCount: replies.length,
        replies: replies,
    });
}