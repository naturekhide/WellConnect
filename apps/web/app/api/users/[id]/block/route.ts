import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    var userId = await getCurrentUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var targetId = params.id;
    if (userId === targetId) return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });

    // Check if already blocked
    var existing = await prisma.block.findUnique({
        where: { blockerId_blockedId: { blockerId: userId, blockedId: targetId } }
    });

    if (existing) {
        // Unblock
        await prisma.block.delete({
            where: { blockerId_blockedId: { blockerId: userId, blockedId: targetId } }
        });
        return NextResponse.json({ blocked: false });
    } else {
        // Block
        await prisma.block.create({
            data: { blockerId: userId, blockedId: targetId }
        });
        return NextResponse.json({ blocked: true });
    }
}