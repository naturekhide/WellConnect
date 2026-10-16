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

    var membership = await prisma.circleMember.findUnique({
        where: { circleId_userId: { circleId: params.id, userId: userId } },
    });

    if (!membership || membership.status !== "approved") {
        return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    var url = new URL(request.url);
    var limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    var cursor = url.searchParams.get("cursor");

    var posts = await prisma.feedPost.findMany({
        where: { circleId: params.id },
        take: limit + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { createdAt: "desc" },
        include: {
            author: { select: { id: true, name: true, username: true } },
            reactions: { select: { type: true, userId: true } },
            _count: { select: { replies: true } },
        },
    });

    var hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    var transformed = posts.map(function (post: any) {
        var rc: any = { hug: 0, growth: 0, strength: 0, grateful: 0 };
        var mine: string | null = null;
        post.reactions.forEach(function (r: any) {
            if (r.type in rc) rc[r.type]++;
            if (r.userId === userId) mine = r.type;
        });
        return {
            id: post.id,
            content: post.content,
            imageUrls: post.imageUrls ? JSON.parse(post.imageUrls) : [],
            anonymous: post.anonymous,
            sentiment: post.sentiment,
            circleId: post.circleId,
            createdAt: post.createdAt,
            author: post.anonymous ? null : post.author,
            reactions: rc,
            myReaction: mine,
            replyCount: post._count.replies,
        };
    });

    return NextResponse.json({
        posts: transformed,
        hasMore: hasMore,
        nextCursor: hasMore ? posts[posts.length - 1]?.id : null,
    });
}