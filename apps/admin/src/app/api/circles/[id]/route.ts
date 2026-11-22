import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-logger";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get the circle name before deleting, for the log
        const circle = await prisma.circle.findUnique({
            where: { id },
            select: { name: true }
        });

        // Hard delete the circle (Cascades to members, posts, messages)
        await prisma.circle.delete({
            where: { id },
        });

        // Log the action
        await logAdminAction({ 
            action: "DELETE_CIRCLE", 
            targetId: id,
            details: `Deleted circle: ${circle?.name || id}`
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete circle:", error);
        return NextResponse.json({ error: "Failed to delete circle" }, { status: 500 });
    }
}