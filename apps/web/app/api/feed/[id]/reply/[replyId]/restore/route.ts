import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function POST(
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
        select: { id: true, postId: true, authorId: true },
    });

    if (!reply || reply.postId !== params.id) {
        return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }
    if (reply.authorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.feedReply.update({
        where: { id: params.replyId },
        data: { deletedAt: null },
    });

    return NextResponse.json({ success: true });
}