import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

var prisma = new PrismaClient();

export async function POST() {
    var session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var userId = (session.user as any).id;

    var twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    var entries = await prisma.moodEntry.findMany({
        where: { userId, createdAt: { gte: twoWeeksAgo } },
        orderBy: { createdAt: "asc" },
    });

    var insights: any[] = [];

    // Auto-dismiss baseline_intro once user has 3+ entries
    if (entries.length >= 3) {
        await prisma.insight.updateMany({
            where: { userId, type: "baseline_intro", dismissed: false },
            data: { dismissed: true },
        });
    }

    if (entries.length >= 3) {
        var mid = Math.floor(entries.length / 2);
        var firstHalf = entries.slice(0, mid);
        var secondHalf = entries.slice(mid);

        var firstAvg = firstHalf.reduce(function (s: number, e: any) { return s + e.score; }, 0) / firstHalf.length;
        var secondAvg = secondHalf.reduce(function (s: number, e: any) { return s + e.score; }, 0) / secondHalf.length;
        var difference = Math.round((secondAvg - firstAvg) * 10) / 10;

        if (difference >= 2) {
            insights.push({
                type: "positive_trend",
                title: "You're on an upswing! 🌱",
                description: "Your mood has improved by " + difference + " points recently. Whatever you're doing, keep it up.",
            });
        } else if (difference <= -2) {
            insights.push({
                type: "mood_shift",
                title: "Your mood has shifted",
                description: "Your mood has dipped recently. Be kind to yourself — consider journaling or reaching out to someone you trust.",
                actionLink: "/journal",
            });
        } else {
            insights.push({
                type: "pattern_nudge",
                title: "Steady and grounded",
                description: "Your mood has been stable this week. Consistency is a form of strength.",
            });
        }

        var recentJournals = await prisma.journalEntry.findMany({
            where: { userId, createdAt: { gte: twoWeeksAgo } },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        if (recentJournals.length >= 3) {
            insights.push({
                type: "pattern_nudge",
                title: "You've been reflecting 🎉",
                description: "You've written " + recentJournals.length + " journal entries in the last 2 weeks. Self-reflection is a powerful habit.",
                actionLink: "/journal",
            });
        }
    } else if (entries.length > 0) {
        var baselineShown = await prisma.insight.findFirst({
            where: { userId, type: "baseline_intro" },
        });

        if (!baselineShown) {
            insights.push({
                type: "baseline_intro",
                title: "Building your baseline",
                description: "Keep checking in daily so we can understand your patterns better.",
            });
        }
    }

    var saved: any[] = [];
    for (var i = 0; i < insights.length; i++) {
        var insight = insights[i];

        var existing = await prisma.insight.findFirst({
            where: { userId, type: insight.type, dismissed: false },
        });

        if (!existing) {
            var created = await prisma.insight.create({
                data: {
                    userId,
                    type: insight.type,
                    title: insight.title,
                    description: insight.description,
                    actionLink: insight.actionLink || null,
                },
            });
            saved.push(created);
        }
    }

    return NextResponse.json({ generated: saved.length, insights: saved });
}