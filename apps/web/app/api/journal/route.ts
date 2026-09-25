import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { classifySentiment } from "@/lib/ai";

var prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    var session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var body = await request.json();
    var { content } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    var userId = (session.user as any).id;
    var trimmed = content.trim();

    // Create entry first
    var entry = await prisma.journalEntry.create({
        data: { userId, content: trimmed },
    });

    // Run AI sentiment analysis in background
    try {
        var sentiment = await classifySentiment(trimmed);
        var updated = await prisma.journalEntry.update({
            where: { id: entry.id },
            data: { sentiment: sentiment.sentiment },
        });
        return NextResponse.json(updated, { status: 201 });
    } catch (e) {
        // If AI fails, return the entry without sentiment
        return NextResponse.json(entry, { status: 201 });
    }
}

export async function GET() {
    var session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var userId = (session.user as any).id;

    var entries = await prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    return NextResponse.json(entries);
}