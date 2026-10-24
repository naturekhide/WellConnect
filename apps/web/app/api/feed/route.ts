import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";
import Sentiment from "sentiment";

export const dynamic = "force-dynamic";
var sentiment = new Sentiment();

export async function GET(request: NextRequest) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var url = new URL(request.url);
    var tab = url.searchParams.get("tab") || "for-you";
    var cursor = url.searchParams.get("cursor");
    var take = 20;

    var myCircleIds = await prisma.circleMember.findMany({
        where: { userId: userId, status: "approved" },
        select: { circleId: true },
    });
    var myCircleList = myCircleIds.map(function (m) { return m.circleId; });

    var whereClause: any = {
        deletedAt: null,
        OR: [
            { circleId: null },
            { circleId: { in: myCircleList } },
        ],
    };

    if (tab === "following") {
        var following = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        var followingIds = following.map(function (f) { return f.followingId; });
        whereClause.authorId = { in: followingIds };
    }

    var posts = await prisma.feedPost.findMany({
        where: whereClause,
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
        include: {
            author: { select: { id: true, name: true, username: true } },
            _count: { select: { replies: true, reactions: true } },
            replies: {
                take: 2,
                orderBy: { createdAt: "desc" },
                include: { author: { select: { id: true, name: true } } },
            },
            reactions: { where: { userId: userId } },
        },
    });

    var hasMore = posts.length > take;
    if (hasMore) posts.pop();

    var result = posts.map(function (p) {
        return {
            id: p.id,
            content: p.anonymous ? p.content : p.content,
            imageUrls: p.imageUrls,
            anonymous: p.anonymous,
            createdAt: p.createdAt,
            author: p.anonymous ? { id: "anonymous", name: "Anonymous", username: "anonymous" } : p.author,
            circleId: p.circleId,
            replyCount: p._count.replies,
            reactionCount: p._count.reactions,
            myReaction: p.reactions[0]?.type || null,
            recentReplies: p.replies.map(function (r) {
                return { id: r.id, content: r.content, author: r.anonymous ? { name: "Anonymous" } : r.author };
            }),
        };
    });

    return NextResponse.json({
        posts: result,
        nextCursor: hasMore ? posts[posts.length - 1].id : null,
    });
}

export async function POST(request: NextRequest) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var body = await request.json();
    var { content, imageUrls, anonymous, circleId } = body;

    if ((!content || content.trim().length === 0) && (!imageUrls || imageUrls.length === 0)) {
        return NextResponse.json({ error: "Content or image required" }, { status: 400 });
    }

    if (content && content.length > 1000) {
        return NextResponse.json({ error: "Post too long" }, { status: 400 });
    }

    var post = await prisma.feedPost.create({
        data: {
            content: content ? content.trim() : "",
            imageUrls: imageUrls || [],
            anonymous: anonymous || false,
            circleId: circleId || null,
            authorId: userId,
        },
    });

    // ─── AI REFLECTION BOT (PRIVATE WHISPER) ───
    if (content && content.trim().length > 0) {
        var analysis = sentiment.analyze(content);

        // If the post is highly negative
        if (analysis.score <= -1) {
            // Check if we've already sent a support notification recently
            var recentNotif = await prisma.notification.findFirst({
                where: {
                    userId: userId,
                    type: "system_support",
                    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                },
            });

            if (!recentNotif) {
                await prisma.notification.create({
                    data: {
                        userId: userId,
                        type: "system_support",
                        title: "We hear you 🫂",
                        body: "We noticed your recent post sounded a little heavy. We just want to remind you that you're not alone. Take a deep breath today.",
                        isRead: false,
                    }
                });
            }
        }
    }
    // ──────────────────────────────────────────

    return NextResponse.json(post);
}