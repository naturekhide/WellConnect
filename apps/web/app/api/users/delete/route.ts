import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export async function DELETE(request: NextRequest) {
    try {
        var userId = await getCurrentUserId(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Because of onDelete: Cascade in the schema, 
        // this will automatically delete all their posts, messages, reactions, and memberships.
        await prisma.user.delete({
            where: { id: userId }
        });

        // Note: If you use NextAuth, you might also need to clear the session cookie here.

        return NextResponse.json({ success: true, message: "Account deleted." });
    } catch (error: any) {
        console.error("Delete account error:", error);
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }
}