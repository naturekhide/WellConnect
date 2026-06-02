import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;

    var entries = await prisma.moodEntry.findMany({
      where: { userId: sub },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (entries.length === 0) {
      return NextResponse.json({ streak: 0, longestStreak: 0, totalEntries: 0 });
    }

    var streak = 0;
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var dates = entries.map(function(e: any) {
      var d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });

    var uniqueDates = Array.from(new Set(dates)).sort(function(a: any, b: any) { return b - a; });

    var checkDate = today.getTime();
    for (var i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === checkDate) {
        streak++;
        checkDate -= 86400000;
      } else if (uniqueDates[i] < checkDate) {
        break;
      }
    }

    var longestStreak = 0;
    var currentLongest = 1;
    for (var j = 1; j < uniqueDates.length; j++) {
      if (uniqueDates[j - 1] - uniqueDates[j] === 86400000) {
        currentLongest++;
      } else {
        longestStreak = Math.max(longestStreak, currentLongest);
        currentLongest = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentLongest);

    return NextResponse.json({
      streak: streak,
      longestStreak: longestStreak,
      totalEntries: uniqueDates.length,
    });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}