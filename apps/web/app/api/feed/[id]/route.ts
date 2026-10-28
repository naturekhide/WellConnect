import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

var EDIT_WINDOW_MS = 15 * 60 * 1000;

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    var userId: string = userIdOrNull;

    var post = await prisma.feedPost.findFirst({
        where: { id: params.id, deletedAt: null },
        include: {
            author: { select: { id: true, name: true, username: true } },
            reactions: { select: { type: true, userId: true } },
            replies: {
                where: { deletedAt: null },
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

    var map: any = {};
    var roots: any[] = [];

    post.replies.forEach(function (r) {
        map[r.id] = {
            id: r.id,
            content: r.content,
            anonymous: r.anonymous,
            parentId: r.parentId,
            editedAt: r.editedAt,
            createdAt: r.createdAt,
            author: r.anonymous ? null : r.author,
            children: [],
            isMine: r.authorId === userId,
        };
    });

    post.replies.forEach(function (r) {
        if (r.parentId && map[r.parentId]) {
            map[r.parentId].children.push(map[r.id]);
        } else {
            roots.push(map[r.id]);
        }
    });

    // 🚨 FIX: Safely split the comma-separated string instead of JSON.parse
    var safeImages: string[] = [];
    if (post.imageUrls && post.imageUrls !== "[]") {
        safeImages = post.imageUrls.split(",").filter(function (url) {
            return url.trim().length > 0;
        });
    }

    return NextResponse.json({
        id: post.id,
        content: post.content,
        imageUrls: safeImages, // 🚨 Returns an array
        anonymous: post.anonymous,
        sentiment: post.sentiment,
        circleId: post.circleId,
        editedAt: post.editedAt,
        createdAt: post.createdAt,
        author: post.anonymous ? null : post.author,
        reactions: rc,
        myReaction: mine,
        replyCount: post.replies.length,
        replies: roots,
        isMine: post.authorId === userId,
        canEdit: post.authorId === userId && (Date.now() - new Date(post.createdAt).getTime() < EDIT_WINDOW_MS),
    });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    var userId: string = userIdOrNull;

    var post = await prisma.feedPost.findUnique({
        where: { id: params.id },
        select: { id: true, authorId: true, createdAt: true, deletedAt: true },
    });

    if (!post || post.deletedAt) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.authorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    var elapsed = Date.now() - new Date(post.createdAt).getTime();
    if (elapsed > EDIT_WINDOW_MS) {
        return NextResponse.json({ error: "Edit window expired" }, { status: 400 });
    }

    var body = await request.json();
    var { content } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }
    if (content.length > 500) {
        return NextResponse.json({ error: "Content too long (max 500)" }, { status: 400 });
    }

    var updated = await prisma.feedPost.update({
        where: { id: params.id },
        data: { content: content.trim(), editedAt: new Date() },
        include: {
            author: { select: { id: true, name: true, username: true } },
        },
    });

    return NextResponse.json({
        id: updated.id,
        content: updated.content,
        editedAt: updated.editedAt,
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    var userId: string = userIdOrNull;

    var post = await prisma.feedPost.findUnique({
        where: { id: params.id },
        select: { id: true, authorId: true, deletedAt: true },
    });

    if (!post || post.deletedAt) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.authorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.feedPost.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
}