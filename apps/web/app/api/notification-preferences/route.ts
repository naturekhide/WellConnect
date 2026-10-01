import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  var userId = await getCurrentUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  // Create default preferences if none exist
  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { userId },
    });
  }

  return NextResponse.json(prefs);
}

export async function PUT(request: NextRequest) {
  var userId = await getCurrentUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var body = await request.json();
  var { dailyCheckin, checkinTime, achievements, insights, streakReminders, weeklySummary } = body;

  var updated = await prisma.notificationPreference.upsert({
    where: { userId },
    update: {
      dailyCheckin,
      checkinTime,
      achievements,
      insights,
      streakReminders,
      weeklySummary,
    },
    create: {
      userId,
      dailyCheckin: dailyCheckin ?? true,
      checkinTime: checkinTime ?? "09:00",
      achievements: achievements ?? true,
      insights: insights ?? true,
      streakReminders: streakReminders ?? true,
      weeklySummary: weeklySummary ?? false,
    },
  });

  return NextResponse.json(updated);
}