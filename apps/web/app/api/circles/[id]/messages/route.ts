import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var membership = await prisma.circleMember.findUnique({
        where: { circleId_userId: { circleId: params.id, userId: userId } },
    });

    if (!membership || membership.status !== "approved") {
        return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    var url = new URL(request.url);
    var since = url.searchParams.get("since");

    var where: any = { circleId: params.id };
    if (since) {
        where.createdAt = { gt: new Date(since) };
    }

    var messages = await prisma.circleMessage.findMany({
        where: where,
        orderBy: { createdAt: "asc" },
        take: since ? 100 : 50,
        include: {
            user: { select: { id: true, name: true, username: true } },
        },
    });

    return NextResponse.json({
        messages: messages.map(function (m) {
            return {
                id: m.id,
                content: m.content,
                createdAt: m.createdAt,
                user: m.user,
            };
        }),
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var membership = await prisma.circleMember.findUnique({
        where: { circleId_userId: { circleId: params.id, userId: userId } },
    });

    if (!membership || membership.status !== "approved") {
        return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    var body = await request.json();
    var { content } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    if (content.length > 500) {
        return NextResponse.json({ error: "Message too long (max 500)" }, { status: 400 });
    }

    var msg = await prisma.circleMessage.create({
        data: {
            circleId: params.id,
            userId: userId,
            content: content.trim(),
        },
        include: {
            user: { select: { id: true, name: true, username: true } },
        },
    });

    return NextResponse.json({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        user: msg.user,
    }, { status: 201 });
}