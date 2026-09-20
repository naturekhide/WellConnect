import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

var prisma = new PrismaClient();

export async function GET() {
  var session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var userId = (session.user as any).id;

  var thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  var entries = await prisma.moodEntry.findMany({
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
    orderBy: { createdAt: "asc" },
  });

  var totalEntries = entries.length;
  var averageScore = totalEntries > 0
    ? Math.round((entries.reduce(function(s: number, e: any) { return s + e.score; }, 0) / totalEntries) * 10) / 10
    : 0;

  var labelCounts: any = { thriving: 0, managing: 0, struggling: 0, crisis: 0 };
  entries.forEach(function(e: any) {
    if (e.label in labelCounts) labelCounts[e.label]++;
  });

  var dominantMood = Object.entries(labelCounts).sort(function(a: any, b: any) { return b[1] - a[1]; })[0][0];

  // Calculate current streak
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

  return NextResponse.json({
    totalEntries,
    averageScore,
    dominantMood,
    labelCounts,
    streak,
    entries,
  });
}