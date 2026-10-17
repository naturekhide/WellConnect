import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

var EDIT_WINDOW_MS = 15 * 60 * 1000;

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string; replyId: string } }
) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    var userId: string = userIdOrNull;

    var reply = await prisma.feedReply.findUnique({
        where: { id: params.replyId },
        select: { id: true, postId: true, authorId: true, createdAt: true, deletedAt: true },
    });

    if (!reply || reply.deletedAt || reply.postId !== params.id) {
        return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }
    if (reply.authorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    var elapsed = Date.now() - new Date(reply.createdAt).getTime();
    if (elapsed > EDIT_WINDOW_MS) {
        return NextResponse.json({ error: "Edit window expired" }, { status: 400 });
    }

    var body = await request.json();
    var { content } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }
    if (content.length > 300) {
        return NextResponse.json({ error: "Reply too long (max 300)" }, { status: 400 });
    }

    var updated = await prisma.feedReply.update({
        where: { id: params.replyId },
        data: { content: content.trim(), editedAt: new Date() },
    });

    return NextResponse.json({
        id: updated.id,
        content: updated.content,
        editedAt: updated.editedAt,
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; replyId: string } }
) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    var userId: string = userIdOrNull;

    var reply = await prisma.feedReply.findUnique({
        where: { id: params.replyId },
        select: { id: true, postId: true, authorId: true, deletedAt: true },
    });

    if (!reply || reply.deletedAt || reply.postId !== params.id) {
        return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }
    if (reply.authorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.feedReply.update({
        where: { id: params.replyId },
        data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
}