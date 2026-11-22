import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-logger";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Soft delete the post
        await prisma.feedPost.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        // 🛑 Log the action
        await logAdminAction({
            action: "DELETE_POST",
            targetId: id,
            details: "Deleted a feed post"
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete post:", error);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}