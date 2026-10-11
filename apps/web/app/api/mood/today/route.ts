import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export async function GET(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    var entry = await prisma.moodEntry.findFirst({
        where: { userId, createdAt: { gte: today, lt: tomorrow } },
    });

    return NextResponse.json(entry);
}