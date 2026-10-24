import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var url = new URL(request.url);
    var tab = url.searchParams.get("tab") || "for-you";
    var cursor = url.searchParams.get("cursor");
    var take = 20;

    // 1. Get the IDs of all circles the user is a member of
    var myCircleIds = await prisma.circleMember.findMany({
        where: { userId: userId, status: "approved" },
        select: { circleId: true },
    });
    var myCircleList = myCircleIds.map(function (m) { return m.circleId; });

    // 2. Build the base query
    var whereClause: any = {
        deletedAt: null,
    };

    // 3. Apply Tab-Specific Logic
    if (tab === "following") {
        var following = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        var followingIds = following.map(function (f) { return f.followingId; });

        whereClause.circleId = null; // Only public posts
        whereClause.anonymous = false; // No anonymous posts in following
        whereClause.authorId = { in: followingIds };

    } else if (tab === "circles") {
        whereClause.circleId = { in: myCircleList };

    } else {
        // "for-you": Show public posts + posts from circles I am in
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
            content: p.content,
            // Convert String back to Array for the frontend UI
            imageUrls: p.imageUrls ? p.imageUrls.split(",") : [],
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
        hasMore: hasMore,
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

    // Convert Array to String for Prisma Database
    var imageUrlsString = "";
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        imageUrlsString = imageUrls.join(",");
    } else if (typeof imageUrls === "string") {
        imageUrlsString = imageUrls;
    }

    var post = await prisma.feedPost.create({
        data: {
            content: content ? content.trim() : "",
            imageUrls: imageUrlsString,
            anonymous: anonymous || false,
            circleId: circleId || null,
            authorId: userId,
        },
    });

    // ─── AI REFLECTION BOT (PRIVATE WHISPER) ───
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
    // ──────────────────────────────────────────

    return NextResponse.json(post);
}