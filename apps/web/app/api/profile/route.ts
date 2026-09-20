import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

var prisma = new PrismaClient();

export async function GET() {
    var session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var userId = (session.user as any).id;

    var user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, username: true, email: true, createdAt: true },
    });

    if (!user) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    var checkIns = await prisma.moodEntry.count({ where: { userId } });
    var journalEntries = await prisma.journalEntry.count({ where: { userId } });
    var goals = await prisma.goal.count({ where: { userId } });

    return NextResponse.json({
        ...user,
        stats: { checkIns, journalEntries, goals },
    });
}

export async function PUT(request: NextRequest) {
    var session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var userId = (session.user as any).id;
    var body = await request.json();
    var { name, username } = body;

    if (username) {
        var existing = await prisma.user.findFirst({
            where: { username: username.trim(), NOT: { id: userId } },
        });
        if (existing) {
            return NextResponse.json({ error: "Username already taken" }, { status: 400 });
        }
    }

    var updated = await prisma.user.update({
        where: { id: userId },
        data: {
            name: name?.trim(),
            username: username?.trim(),
        },
        select: { id: true, name: true, username: true, email: true, createdAt: true },
    });

    var checkIns = await prisma.moodEntry.count({ where: { userId } });
    var journalEntries = await prisma.journalEntry.count({ where: { userId } });
    var goals = await prisma.goal.count({ where: { userId } });

    return NextResponse.json({
        ...updated,
        stats: { checkIns, journalEntries, goals },
    });
}