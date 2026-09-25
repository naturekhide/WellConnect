import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { classifySentiment, analyzeEmotion } from "@/lib/ai";

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

    var journals = await prisma.journalEntry.findMany({
        where: { userId, createdAt: { gte: twoWeeksAgo } },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    var insights: any[] = [];

    // Auto-dismiss baseline_intro when user hits 3+ entries
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
    }

    // AI Journal Analysis — analyze recent journal entries
    if (journals.length >= 3) {
        var negativeCount = 0;
        var positiveCount = 0;

        for (var i = 0; i < journals.length; i++) {
            var j = journals[i];
            if (!j.sentiment) {
                try {
                    var s = await classifySentiment(j.content);
                    if (s.sentiment === "low") negativeCount++;
                    else if (s.sentiment === "positive") positiveCount++;

                    await prisma.journalEntry.update({
                        where: { id: j.id },
                        data: { sentiment: s.sentiment },
                    });
                } catch (e) { }
            } else {
                if (j.sentiment === "low") negativeCount++;
                else if (j.sentiment === "positive") positiveCount++;
            }
        }

        if (negativeCount >= 3) {
            insights.push({
                type: "mood_shift",
                title: "Your writing has been heavy",
                description: "Your recent journal entries reflect some difficult feelings. You're not alone — consider talking to someone you trust.",
                actionLink: "/journal",
            });
        } else if (positiveCount >= 3) {
            insights.push({
                type: "positive_trend",
                title: "Your words shine ✨",
                description: "Your recent journal entries reflect a lot of positive energy. Whatever you're doing, keep doing it.",
            });
        } else {
            insights.push({
                type: "pattern_nudge",
                title: "You've been reflecting 🎉",
                description: "You've written " + journals.length + " entries recently. Self-reflection is a powerful habit.",
                actionLink: "/journal",
            });
        }
    } else if (entries.length >= 1 && entries.length < 3) {
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
    for (var k = 0; k < insights.length; k++) {
        var insight = insights[k];

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