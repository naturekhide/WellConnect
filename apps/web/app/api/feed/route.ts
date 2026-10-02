import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/get-user";
import { classifySentiment } from "@/lib/ai";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var url = new URL(request.url);
    var limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    var cursor = url.searchParams.get("cursor");

    var posts = await prisma.feedPost.findMany({
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

export async function POST(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var body = await request.json();
    var { content, imageUrls, anonymous } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    if (content.length > 500) {
        return NextResponse.json({ error: "Content too long (max 500 characters)" }, { status: 400 });
    }

    if (imageUrls && imageUrls.length > 4) {
        return NextResponse.json({ error: "Maximum 4 images allowed" }, { status: 400 });
    }

    var text = content.trim();
    var sentiment: string | null = null;

    try {
        var ai = await classifySentiment(text);
        sentiment = ai.sentiment;
    } catch (e) { }

    var post = await prisma.feedPost.create({
        data: {
            authorId: userId,
            content: text,
            imageUrls: JSON.stringify(imageUrls || []),
            anonymous: anonymous || false,
            sentiment: sentiment,
        },
        include: {
            author: { select: { id: true, name: true, username: true } },
        },
    });

    return NextResponse.json({
        id: post.id,
        content: post.content,
        imageUrls: imageUrls || [],
        anonymous: post.anonymous,
        sentiment: post.sentiment,
        createdAt: post.createdAt,
        author: post.anonymous ? null : post.author,
        reactions: { hug: 0, growth: 0, strength: 0, grateful: 0 },
        myReaction: null,
        replyCount: 0,
    }, { status: 201 });
}