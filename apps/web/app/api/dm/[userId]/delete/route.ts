import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
    var url = new URL(request.url);
    var messageId = url.searchParams.get("messageId");

    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    if (!messageId) return NextResponse.json({ error: "Message ID required" }, { status: 400 });

    var msg = await prisma.directMessage.findUnique({ where: { id: messageId } });
    if (!msg || msg.senderId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.directMessage.update({
        where: { id: messageId },
        data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
}