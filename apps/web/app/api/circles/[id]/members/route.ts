import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    var userId = await getCurrentUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Check if the current user is a member of this circle
    var membership = await prisma.circleMember.findUnique({
        where: { circleId_userId: { circleId: params.id, userId: userId } }
    });

    if (!membership || membership.status !== "approved") {
        return NextResponse.json({ error: "Not authorized to view members" }, { status: 403 });
    }

    // 2. Determine if the current user is the creator
    var circle = await prisma.circle.findUnique({ where: { id: params.id } });
    var isCreator = circle?.creatorId === userId;

    // 3. Fetch members. If creator, fetch all (including pending). If regular member, only fetch approved.
    var members = await prisma.circleMember.findMany({
        where: {
            circleId: params.id,
            ...(isCreator ? {} : { status: "approved" }) // 👈 Filter pending for non-creators
        },
        include: { user: { select: { id: true, name: true, username: true } } },
        orderBy: { joinedAt: "desc" }
    });

    return NextResponse.json(members);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    var userId = await getCurrentUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var circle = await prisma.circle.findUnique({ where: { id: params.id } });
    if (!circle || circle.creatorId !== userId) {
        return NextResponse.json({ error: "Not authorized to manage members" }, { status: 403 });
    }

    var body = await request.json();
    var { targetUserId, action } = body; // action: "approve" | "kick"

    if (action === "approve") {
        await prisma.circleMember.update({
            where: { circleId_userId: { circleId: params.id, userId: targetUserId } },
            data: { status: "approved" }
        });
    } else if (action === "kick") {
        await prisma.circleMember.delete({
            where: { circleId_userId: { circleId: params.id, userId: targetUserId } }
        });
    }

    return NextResponse.json({ success: true });
}