import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";
import Sentiment from "sentiment";

export const dynamic = "force-dynamic";
var sentiment = new Sentiment();

export async function GET(request: NextRequest) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var entries = await prisma.journalEntry.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var body = await request.json();
    var { content } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    var journal = await prisma.journalEntry.create({
        data: {
            content: content.trim(),
            userId: userId,
        },
    });

    // ─── AI REFLECTION BOT (PRIVATE WHISPER) ───
    var analysis = sentiment.analyze(content);

    if (analysis.score <= -1) {
        var recentNotif = await prisma.notification.findFirst({
            where: {
                userId: userId,
                type: "system_support",
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
        });

        if (!recentNotif) {
            await prisma.notification.create({
                data: {
                    userId: userId,
                    type: "system_support",
                    title: "A gentle check-in 🫂",
                    body: "We noticed your journal entry sounded a bit heavy today. Remember that it's okay to not be okay. Be gentle with yourself.",
                    isRead: false,
                }
            });
        }
    }
    // ──────────────────────────────────────────

    return NextResponse.json(journal);
}