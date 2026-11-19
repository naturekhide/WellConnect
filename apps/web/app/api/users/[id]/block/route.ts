import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        var userId = await getCurrentUserId(request);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        var targetUserId = params.id;
        if (targetUserId === userId) {
            return NextResponse.json({ error: "You cannot block yourself" }, { status: 400 });
        }

        await prisma.block.upsert({
            where: {
                blockerId_blockedId: {
                    blockerId: userId,
                    blockedId: targetUserId
                }
            },
            create: {
                blockerId: userId,
                blockedId: targetUserId
            },
            update: {}
        });

        return NextResponse.json({ success: true, message: "User blocked" });

    } catch (error) {
        console.error("Block failed:", error);
        return NextResponse.json({ error: "Failed to block user" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        var userId = await getCurrentUserId(request);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await prisma.block.deleteMany({
            where: {
                blockerId: userId,
                blockedId: params.id
            }
        });

        return NextResponse.json({ success: true, message: "User unblocked" });

    } catch (error) {
        console.error("Unblock failed:", error);
        return NextResponse.json({ error: "Failed to unblock user" }, { status: 500 });
    }
}