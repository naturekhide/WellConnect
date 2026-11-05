import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

// 🚨 Helper to safely parse images whether they are JSON strings, comma-separated strings, or null
function parseImages(imgStr: string | null) {
    if (!imgStr || imgStr === "[]" || imgStr === "") return [];
    try {
        var parsed = JSON.parse(imgStr);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
        // Fallback for old posts saved with commas
        return imgStr.split(",").map(function (u) { return u.trim(); }).filter(function (u) { return u.length > 0; });
    }
}

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

    var whereClause: any = { deletedAt: null };

    if (tab === "following") {
        var following = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        var followingIds = following.map(function (f) { return f.followingId; });
        whereClause.circleId = null;
        whereClause.anonymous = false;
        whereClause.authorId = { in: followingIds };
    } else if (tab === "circles") {
        whereClause.circleId = { in: myCircleList };
    } else {
        whereClause.OR = [
            { circleId: null },
            { circleId: { in: myCircleList } },
        ];
    }

    var posts = await prisma.feedPost.findMany({
        where: whereClause,
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
        include: {
            author: { select: { id: true, name: true, username: true } },
            originalPost: {
                include: { author: { select: { id: true, name: true, username: true } } }
            },
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

    var result = posts.map(function (p: any) {
        return {
            id: p.id,
            content: p.content,
            imageUrls: parseImages(p.imageUrls), // 👈 Use the safe parser
            anonymous: p.anonymous,
            createdAt: p.createdAt,
            author: p.anonymous ? { id: "anonymous", name: "Anonymous", username: "anonymous" } : p.author,
            circleId: p.circleId,
            replyCount: p._count.replies,
            reactionCount: p._count.reactions,
            myReaction: p.reactions[0]?.type || null,
            isMine: p.authorId === userId,
            originalPost: p.originalPost ? {
                id: p.originalPost.id,
                content: p.originalPost.content,
                imageUrls: parseImages(p.originalPost.imageUrls), // 👈 Use the safe parser
                createdAt: p.originalPost.createdAt,
                author: p.originalPost.author,
            } : null,
            recentReplies: p.replies.map(function (r: any) {
                return { id: r.id, content: r.content, author: r.anonymous ? { name: "Anonymous" } : r.author };
            }),
        };
    });

    return NextResponse.json({
        posts: result,
        nextCursor: hasMore ? posts[posts.length - 1].id : null,
        hasMore: hasMore,
    });
}

export async function POST(request: NextRequest) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var body = await request.json();
    var { content, imageUrls, anonymous, circleId, originalPostId } = body;

    if ((!content || content.trim().length === 0) && (!imageUrls || imageUrls.length === 0) && !originalPostId) {
        return NextResponse.json({ error: "Content, image, or original post required" }, { status: 400 });
    }

    if (content && content.length > 1000) {
        return NextResponse.json({ error: "Post too long" }, { status: 400 });
    }

    var imageUrlsString = "[]";
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        imageUrlsString = JSON.stringify(imageUrls); // 👈 Store as JSON array string
    }

    var post = await prisma.feedPost.create({
        data: {
            content: content ? content.trim() : "",
            imageUrls: imageUrlsString,
            anonymous: anonymous || false,
            circleId: circleId || null,
            authorId: userId,
            originalPostId: originalPostId || null,
        },
    });

    if (content && content.trim().length > 0) {
        try {
            const Sentiment = (await import("sentiment")).default;
            const sentiment = new Sentiment();
            var analysis = sentiment.analyze(content);

            if (analysis.score <= -1) {
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
        } catch (aiError) {
            console.error("AI Sentiment failed, but post saved:", aiError);
        }
    }

    return NextResponse.json(post);
}