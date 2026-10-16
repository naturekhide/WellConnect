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

    var circle = await prisma.circle.findUnique({
        where: { id: params.id },
        select: { creatorId: true },
    });

    if (!circle || circle.creatorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    var pending = await prisma.circleMember.findMany({
        where: { circleId: params.id, status: "pending" },
        orderBy: { joinedAt: "asc" },
        include: {
            user: { select: { id: true, name: true, username: true } },
        },
    });

    return NextResponse.json({
        pending: pending.map(function (m) {
            return {
                id: m.id,
                userId: m.userId,
                user: m.user,
                joinedAt: m.joinedAt,
            };
        }),
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var body = await request.json();
    var { userId: targetUserId, action } = body;

    if (!targetUserId || (action !== "approve" && action !== "reject")) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    var circle = await prisma.circle.findUnique({
        where: { id: params.id },
        select: { creatorId: true },
    });

    if (!circle || circle.creatorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    var member = await prisma.circleMember.findUnique({
        where: { circleId_userId: { circleId: params.id, userId: targetUserId } },
    });

    if (!member || member.status !== "pending") {
        return NextResponse.json({ error: "No pending request" }, { status: 404 });
    }

    if (action === "approve") {
        await prisma.circleMember.update({
            where: { id: member.id },
            data: { status: "approved" },
        });
    } else {
        await prisma.circleMember.delete({ where: { id: member.id } });
    }

    return NextResponse.json({ success: true });
}