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

    // Build nested tree from flat list
    var map: any = {};
    var roots: any[] = [];

    post.replies.forEach(function (r) {
        map[r.id] = {
            id: r.id,
            content: r.content,
            anonymous: r.anonymous,
            parentId: r.parentId,
            createdAt: r.createdAt,
            author: r.anonymous ? null : r.author,
            children: [],
        };
    });

    post.replies.forEach(function (r) {
        if (r.parentId && map[r.parentId]) {
            map[r.parentId].children.push(map[r.id]);
        } else {
            roots.push(map[r.id]);
        }
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
        replyCount: post.replies.length,
        replies: roots,
    });
}