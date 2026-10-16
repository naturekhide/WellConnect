import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var members = await prisma.circleMember.findMany({
        where: { circleId: params.id, status: "approved" },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        include: {
            user: { select: { id: true, name: true, username: true } },
        },
    });

    return NextResponse.json({
        members: members.map(function (m) {
            return {
                id: m.id,
                userId: m.userId,
                user: m.user,
                role: m.role,
                joinedAt: m.joinedAt,
            };
        }),
    });
}