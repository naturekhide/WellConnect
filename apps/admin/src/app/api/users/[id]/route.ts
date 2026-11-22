import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-logger";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { role, suspended } = body;

        // Update the user in the database
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(role !== undefined && { role }),
                ...(suspended !== undefined && { suspended }),
            },
        });

        // 🛑 Log the actions
        if (role !== undefined) {
            await logAdminAction({
                action: "CHANGE_ROLE",
                targetId: id,
                details: `Changed role to ${role}`
            });
        }

        if (suspended !== undefined) {
            await logAdminAction({
                action: suspended ? "BAN_USER" : "UNBAN_USER",
                targetId: id,
                details: suspended ? "Suspended user account" : "Reactivated user account"
            });
        }

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}