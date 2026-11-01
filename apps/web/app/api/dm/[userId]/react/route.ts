import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var body = await request.json();
    var { messageId, emoji } = body;

    if (!messageId || !emoji) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Check if reaction already exists
    var existing = await prisma.messageReaction.findUnique({
        where: { messageId_userId: { messageId, userId } }
    });

    if (existing) {
        if (existing.emoji === emoji) {
            // If they clicked the same emoji, remove it (toggle off)
            await prisma.messageReaction.delete({ where: { id: existing.id } });
        } else {
            // If they clicked a different emoji, update it
            await prisma.messageReaction.update({
                where: { id: existing.id },
                data: { emoji }
            });
        }
    } else {
        // Create new reaction
        await prisma.messageReaction.create({
            data: { messageId, userId, emoji }
        });
    }

    return NextResponse.json({ success: true });
}