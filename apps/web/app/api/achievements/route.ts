import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/get-user";
import { ACHIEVEMENTS, checkAchievements } from "@/lib/achievements";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for new achievements (silent unlock)
    await checkAchievements(userId);

    var unlocked = await prisma.achievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: "desc" },
    });

    var unlockedKeys = unlocked.map(function (u: any) { return u.key; });

    var achievements = ACHIEVEMENTS.map(function (a: any) {
        var match = unlocked.find(function (u: any) { return u.key === a.key; });
        return {
            ...a,
            unlocked: !!match,
            unlockedAt: match?.unlockedAt || null,
        };
    });

    return NextResponse.json({
        achievements,
        totalUnlocked: unlockedKeys.length,
        total: ACHIEVEMENTS.length,
    });
}