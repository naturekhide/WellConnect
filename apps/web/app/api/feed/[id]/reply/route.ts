import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";
import { notifyReply } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var body = await request.json();
    var { content, anonymous, parentId } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    if (content.length > 300) {
        return NextResponse.json({ error: "Reply too long (max 300 characters)" }, { status: 400 });
    }

    var post = await prisma.feedPost.findUnique({
        where: { id: params.id },
        select: { id: true, authorId: true },
    });

    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    var parentReply: any = null;

    if (parentId) {
        parentReply = await prisma.feedReply.findUnique({
            where: { id: parentId },
            select: { id: true, postId: true, authorId: true },
        });

        if (!parentReply || parentReply.postId !== params.id) {
            return NextResponse.json({ error: "Invalid parent reply" }, { status: 400 });
        }
    }

    var reply = await prisma.feedReply.create({
        data: {
            postId: params.id,
            authorId: userId,
            content: content.trim(),
            anonymous: anonymous || false,
            parentId: parentId || null,
        },
        include: {
            author: { select: { id: true, name: true, username: true } },
        },
    });

    // Determine notification target:
    // - If reply has a parent → notify the parent reply's author (unless self)
    // - Otherwise → notify the post author (unless self)
    var replierName = anonymous ? "Someone" : (reply.author?.name || "Someone");
    var isThreaded = !!parentId;

    if (parentReply && parentReply.authorId && parentReply.authorId !== userId) {
        await notifyReply(parentReply.authorId, replierName, params.id, anonymous, true);
    } else if (!parentReply && post.authorId && post.authorId !== userId) {
        await notifyReply(post.authorId, replierName, params.id, anonymous, false);
    }

    return NextResponse.json({
        id: reply.id,
        content: reply.content,
        anonymous: reply.anonymous,
        parentId: reply.parentId,
        createdAt: reply.createdAt,
        author: reply.anonymous ? null : reply.author,
        children: [],
    }, { status: 201 });
}