import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;

    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    var entries = await prisma.moodEntry.findMany({
      where: { userId: sub, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "asc" },
    });

    var averageScore = entries.length > 0
      ? Math.round((entries.reduce(function(sum: number, e: any) { return sum + e.score; }, 0) / entries.length) * 10) / 10
      : 0;

    var labelCounts: any = { thriving: 0, managing: 0, struggling: 0, crisis: 0 };
    entries.forEach(function(e: any) {
      if (e.label in labelCounts) labelCounts[e.label]++;
    });

    var dominantMood = Object.entries(labelCounts).sort(function(a: any, b: any) { return b[1] - a[1]; })[0][0];

    var now = new Date();
    var sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    var fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    var recent = entries.filter(function(e: any) { return new Date(e.createdAt) >= sevenDaysAgo; });
    var previous = entries.filter(function(e: any) {
      return new Date(e.createdAt) >= fourteenDaysAgo && new Date(e.createdAt) < sevenDaysAgo;
    });

    var recentAvg = recent.length > 0 ? recent.reduce(function(s: number, e: any) { return s + e.score; }, 0) / recent.length : 0;
    var previousAvg = previous.length > 0 ? previous.reduce(function(s: number, e: any) { return s + e.score; }, 0) / previous.length : 0;

    var trend = recentAvg > previousAvg ? "up" : recentAvg < previousAvg ? "down" : "stable";

    return NextResponse.json({
      totalEntries: entries.length,
      averageScore: averageScore,
      dominantMood: dominantMood,
      labelCounts: labelCounts,
      trend: trend,
      recentAvg: Math.round(recentAvg * 10) / 10,
      previousAvg: Math.round(previousAvg * 10) / 10,
    });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}