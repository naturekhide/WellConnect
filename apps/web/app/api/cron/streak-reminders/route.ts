import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { notifyStreakReminder, notifyDailyCheckin } from "@/lib/notifications";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    // Protect with a secret query param
    var url = new URL(request.url);
    var secret = url.searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET && secret !== "wellconnect-cron-2026") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var now = new Date();
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    var results = {
        streakReminders: 0,
        dailyCheckins: 0,
        totalUsers: 0,
    };

    // Get all users with streak reminders enabled
    var users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            notificationPreference: true,
        },
    });

    results.totalUsers = users.length;

    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        var prefs = user.notificationPreference;

        // Skip if no preferences or disabled
        if (prefs) {
            if (!prefs.streakReminders && !prefs.dailyCheckin) continue;
        }

        // Check if user has checked in today
        var todayEntry = await prisma.moodEntry.findFirst({
            where: {
                userId: user.id,
                createdAt: { gte: today, lt: tomorrow },
            },
        });

        if (todayEntry) continue; // Already checked in

        // Calculate streak
        var entries = await prisma.moodEntry.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
            take: 60,
        });

        var streak = calculateStreak(entries.map(function (e: any) { return e.createdAt; }));

        // Send streak reminder if they have a streak going
        if (streak > 0 && (!prefs || prefs.streakReminders)) {
            await notifyStreakReminder(user.id, streak);
            results.streakReminders++;
        } else if (streak === 0 && (!prefs || prefs.dailyCheckin)) {
            // No streak — send gentle daily check-in reminder
            await notifyDailyCheckin(user.id);
            results.dailyCheckins++;
        }
    }

    return NextResponse.json(results);
}

function calculateStreak(dates: Date[]): number {
    if (dates.length === 0) return 0;

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var uniqueDates = Array.from(
        new Set(dates.map(function (d: any) {
            var day = new Date(d);
            day.setHours(0, 0, 0, 0);
            return day.getTime();
        }))
    ).sort(function (a: any, b: any) { return b - a; });

    var streak = 0;
    var checkDate = today.getTime() - 86400000; // Start from yesterday (user hasn't checked in today)

    for (var i = 0; i < uniqueDates.length; i++) {
        if (uniqueDates[i] === checkDate) {
            streak++;
            checkDate -= 86400000;
        } else if (uniqueDates[i] < checkDate) {
            break;
        }
    }

    return streak;
}