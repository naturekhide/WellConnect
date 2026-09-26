import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/get-user";

var prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var body = await request.json();
    var { title, frequency } = body;

    if (!title || title.trim().length === 0) {
        return NextResponse.json({ error: "Title required" }, { status: 400 });
    }

    var goal = await prisma.goal.create({
        data: {
            userId,
            title: title.trim(),
            frequency: frequency || "daily",
        },
    });

    return NextResponse.json(goal, { status: 201 });
}

export async function GET(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(goals);
}