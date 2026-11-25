import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    try {
        const userId = await getCurrentUserId(request);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, memberId } = await params;

        // Verify the user is the creator
        const circle = await prisma.circle.findUnique({
            where: { id },
            select: { creatorId: true }
        });

        if (!circle || circle.creatorId !== userId) {
            return NextResponse.json({ error: "Only the creator can kick members" }, { status: 403 });
        }

        // Prevent the creator from kicking themselves
        if (userId === memberId) {
            return NextResponse.json({ error: "You cannot kick yourself" }, { status: 400 });
        }

        // Delete the member from the circle
        await prisma.circleMember.delete({
            where: {
                circleId_userId: {
                    circleId: id,
                    userId: memberId
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to kick member:", error);
        return NextResponse.json({ error: "Failed to kick member" }, { status: 500 });
    }
}