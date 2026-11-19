import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        var userId = await getCurrentUserId(request);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        var blocks = await prisma.block.findMany({
            where: { blockerId: userId },
            include: {
                blocked: {
                    select: { id: true, name: true, username: true }
                }
            }
        });

        var blockedUsers = blocks.map(function (b: any) { return b.blocked; });
        return NextResponse.json(blockedUsers);

    } catch (error) {
        console.error("Failed to fetch blocked users:", error);
        return NextResponse.json({ error: "Failed to fetch blocked users" }, { status: 500 });
    }
}