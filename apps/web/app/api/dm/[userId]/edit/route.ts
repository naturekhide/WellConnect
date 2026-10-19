import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    var url = new URL(request.url);
    var messageId = url.searchParams.get("messageId");

    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    if (!messageId) return NextResponse.json({ error: "Message ID required" }, { status: 400 });

    var body = await request.json();
    var { content } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    var msg = await prisma.directMessage.findUnique({ where: { id: messageId } });
    if (!msg || msg.senderId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Enforce 15-minute edit window
    var elapsed = Date.now() - new Date(msg.createdAt).getTime();
    if (elapsed > 15 * 60 * 1000) {
        return NextResponse.json({ error: "Edit window expired (15 minutes)" }, { status: 400 });
    }

    var updated = await prisma.directMessage.update({
        where: { id: messageId },
        data: { content: content.trim() },
    });

    return NextResponse.json({ id: updated.id, content: updated.content });
}