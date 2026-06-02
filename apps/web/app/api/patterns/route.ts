import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

// Record an activity
export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;
    var body = await request.json();
    var { action } = body;

    if (!action) return NextResponse.json({ error: "Action required" }, { status: 400 });

    var now = new Date();
    var pattern = await prisma.userPattern.create({
      data: {
        userId: sub,
        action: action,
        dayOfWeek: now.getDay(),
        hour: now.getHours(),
      },
    });

    return NextResponse.json(pattern, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

// Get pattern analysis
export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;

    // Get last 14 days of patterns
    var twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    var patterns = await prisma.userPattern.findMany({
      where: { userId: sub, createdAt: { gte: twoWeeksAgo } },
      orderBy: { createdAt: "desc" },
    });

    if (patterns.length < 3) {
      return NextResponse.json({ patterns: [], insights: [] });
    }

    var now = new Date();
    var currentDay = now.getDay();
    var currentHour = now.getHours();

    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Find most active day
    var dayCounts: Record<number, number> = {};
    patterns.forEach(function(p: any) { dayCounts[p.dayOfWeek] = (dayCounts[p.dayOfWeek] || 0) + 1; });
    var mostActiveDay = Object.entries(dayCounts).sort(function(a: any, b: any) { return b[1] - a[1]; })[0];
    var mostActiveDayNum = parseInt(mostActiveDay[0]);

    // Find most active hour
    var hourCounts: Record<number, number> = {};
    patterns.forEach(function(p: any) { hourCounts[p.hour] = (hourCounts[p.hour] || 0) + 1; });
    var mostActiveHour = Object.entries(hourCounts).sort(function(a: any, b: any) { return b[1] - a[1]; })[0];
    var mostActiveHourNum = parseInt(mostActiveHour[0]);

    // Check if user is active at their usual time
    var isActiveNow = patterns.some(function(p: any) {
      return p.dayOfWeek === currentDay && Math.abs(p.hour - currentHour) <= 1;
    });

    // Check if user missed their usual time
    var usualHourPatterns = patterns.filter(function(p: any) { return p.hour === mostActiveHourNum; });
    var isUsuallyActiveNow = usualHourPatterns.length >= 2 && 
      Math.abs(mostActiveHourNum - currentHour) <= 1;

    var insights: any[] = [];

    // It's their usual active time
    if (isUsuallyActiveNow && mostActiveHourNum >= 6 && mostActiveHourNum < 12) {
      insights.push({
        type: "pattern_nudge",
        title: "Morning check-in time 🌅",
        description: "You usually check in around " + formatHour(mostActiveHourNum) + ". Need a mindful moment?",
        actionLink: "/feed",
      });
    } else if (isUsuallyActiveNow && mostActiveHourNum >= 20) {
      insights.push({
        type: "pattern_nudge",
        title: "Late night reflection 🌙",
        description: "You're often active around this time. Take a moment to breathe and reflect.",
        actionLink: "/wellness",
      });
    }

    // It's their most active day
    if (currentDay === mostActiveDayNum && !isActiveNow) {
      insights.push({
        type: "pattern_nudge",
        title: dayNames[mostActiveDayNum] + " reflection",
        description: "You're usually most active on " + dayNames[mostActiveDayNum] + "s. Share what's on your mind today.",
        actionLink: "/feed",
      });
    }

    // User is active at unusual hour
    if (currentHour < 6 || currentHour >= 23) {
      insights.push({
        type: "pattern_nudge",
        title: "You're up late 💙",
        description: "It's late — don't forget to rest. A good night's sleep makes everything easier.",
        actionLink: "/wellness?category=sleep",
      });
    }

    return NextResponse.json({
      patterns: {
        total: patterns.length,
        mostActiveDay: dayNames[mostActiveDayNum],
        mostActiveHour: formatHour(mostActiveHourNum),
        commonActions: getCommonActions(patterns),
      },
      insights: insights,
    });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return hour + " AM";
  return (hour - 12) + " PM";
}

function getCommonActions(patterns: any[]): string[] {
  var counts: Record<string, number> = {};
  patterns.forEach(function(p: any) { counts[p.action] = (counts[p.action] || 0) + 1; });
  return Object.entries(counts)
    .sort(function(a: any, b: any) { return b[1] - a[1]; })
    .slice(0, 3)
    .map(function(e: any) { return e[0]; });
}