import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

var VALID_TYPES = ["hug", "growth", "strength", "grateful"];

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var body = await request.json();
    var type = body.type;

    if (!type || VALID_TYPES.indexOf(type) === -1) {
        return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    var post = await prisma.feedPost.findUnique({
        where: { id: params.id },
        select: { id: true },
    });

    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    var existing = await prisma.feedReaction.findUnique({
        where: {
            userId_postId: { userId: userId, postId: params.id },
        },
    });

    if (existing && existing.type === type) {
        // Same reaction → remove it (toggle off)
        await prisma.feedReaction.delete({
            where: { id: existing.id },
        });
    } else if (existing) {
        // Different reaction → switch
        await prisma.feedReaction.update({
            where: { id: existing.id },
            data: { type: type },
        });
    } else {
        // No reaction yet → add
        await prisma.feedReaction.create({
            data: { userId: userId, postId: params.id, type: type },
        });
    }

    // Return fresh counts + my reaction
    var reactions = await prisma.feedReaction.findMany({
        where: { postId: params.id },
        select: { type: true, userId: true },
    });

    var rc: any = { hug: 0, growth: 0, strength: 0, grateful: 0 };
    var mine: string | null = null;

    reactions.forEach(function (r) {
        if (r.type in rc) rc[r.type]++;
        if (r.userId === userId) mine = r.type;
    });

    return NextResponse.json({ reactions: rc, myReaction: mine });
}