import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; messageId: string } }
) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var messageId = params.messageId;

    if (!messageId) {
        return NextResponse.json({ error: "Message ID missing" }, { status: 400 });
    }

    var msg = await prisma.circleMessage.findUnique({ where: { id: messageId } });
    if (!msg || msg.userId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.circleMessage.update({
        where: { id: messageId },
        data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
}