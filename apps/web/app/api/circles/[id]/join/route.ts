import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var circle = await prisma.circle.findUnique({
        where: { id: params.id },
        select: { id: true, isPrivate: true, creatorId: true },
    });

    if (!circle) {
        return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    var existing = await prisma.circleMember.findUnique({
        where: { circleId_userId: { circleId: params.id, userId: userId } },
    });

    if (existing) {
        // Leave
        if (existing.role === "creator") {
            return NextResponse.json({ error: "Creator can't leave their own circle" }, { status: 400 });
        }
        await prisma.circleMember.delete({ where: { id: existing.id } });
        return NextResponse.json({ status: null, memberCount: await prisma.circleMember.count({ where: { circleId: params.id } }) });
    }

    // Join
    var status = circle.isPrivate ? "pending" : "approved";
    await prisma.circleMember.create({
        data: { circleId: params.id, userId: userId, role: "member", status: status },
    });

    return NextResponse.json({
        status: status,
        memberCount: await prisma.circleMember.count({ where: { circleId: params.id } }),
    });
}