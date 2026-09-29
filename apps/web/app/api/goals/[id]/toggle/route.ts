import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/get-user";
import { checkAchievements } from "@/lib/achievements";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var goal = await prisma.goal.findFirst({
        where: { id: params.id, userId },
    });

    if (!goal) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    var updated = await prisma.goal.update({
        where: { id: goal.id },
        data: {
            completed: !goal.completed,
            completedAt: !goal.completed ? new Date() : null,
        },
    });

    if (updated.completed) {
        checkAchievements(userId).catch(function () { });
    }

    return NextResponse.json(updated);
}