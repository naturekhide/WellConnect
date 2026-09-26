import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/get-user";
import { classifySentiment } from "@/lib/ai";

var prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var body = await request.json();
    var { content } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    var trimmed = content.trim();

    var entry = await prisma.journalEntry.create({
        data: { userId, content: trimmed },
    });

    try {
        var sentiment = await classifySentiment(trimmed);
        var updated = await prisma.journalEntry.update({
            where: { id: entry.id },
            data: { sentiment: sentiment.sentiment },
        });
        return NextResponse.json(updated, { status: 201 });
    } catch (e) {
        return NextResponse.json(entry, { status: 201 });
    }
}

export async function GET(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var entries = await prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    return NextResponse.json(entries);
}