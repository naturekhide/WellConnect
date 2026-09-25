import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

var prisma = new PrismaClient();

export async function GET() {
    var session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var userId = (session.user as any).id;

    var insights = await prisma.insight.findMany({
        where: { userId, dismissed: false },
        orderBy: { createdAt: "desc" },
        take: 1,
    });

    // Auto-dismiss after fetch — the user just saw it
    if (insights.length > 0) {
        await prisma.insight.update({
            where: { id: insights[0].id },
            data: { dismissed: true },
        });
    }

    return NextResponse.json(insights);
}

export async function PUT(request: Request) {
    var session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var body = await request.json();
    var { insightId } = body;

    if (!insightId) {
        return NextResponse.json({ error: "Insight ID required" }, { status: 400 });
    }

    await prisma.insight.update({
        where: { id: insightId },
        data: { dismissed: true },
    });

    return NextResponse.json({ success: true });
}