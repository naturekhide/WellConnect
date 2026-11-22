import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function logAdminAction({
    action,
    targetId,
    details,
}: {
    action: string;
    targetId?: string;
    details?: string;
}) {
    try {
        const cookieStore = await cookies();
        const adminId = cookieStore.get("admin_session")?.value;

        if (!adminId) return;

        await prisma.adminLog.create({
            data: {
                adminId,
                action,
                targetId,
                details,
            },
        });
    } catch (error) {
        console.error("Failed to write admin log:", error);
    }
}