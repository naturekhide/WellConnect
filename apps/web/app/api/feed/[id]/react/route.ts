import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";
import { notifyReaction } from "@/lib/notifications";

export const dynamic = "force-dynamic";

var VALID_TYPES = ["hug", "growth", "strength", "grateful"];
var EMOJI: any = { hug: "🤗", growth: "🌱", strength: "💪", grateful: "🙏" };

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
        select: { id: true, authorId: true },
    });

    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    var existing = await prisma.feedReaction.findUnique({
        where: {
            userId_postId: { userId: userId, postId: params.id },
        },
    });

    var justAdded = false;

    if (existing && existing.type === type) {
        await prisma.feedReaction.delete({ where: { id: existing.id } });
    } else if (existing) {
        await prisma.feedReaction.update({
            where: { id: existing.id },
            data: { type: type },
        });
    } else {
        await prisma.feedReaction.create({
            data: { userId: userId, postId: params.id, type: type },
        });
        justAdded = true;
    }

    // Notify the post author (only on new reaction, not on toggle-off or switch, only if not self)
    if (justAdded && post.authorId && post.authorId !== userId) {
        var reactor = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
        });
        var isAnonymousPost = false;
        var fullPost = await prisma.feedPost.findUnique({
            where: { id: params.id },
            select: { anonymous: true },
        });
        if (fullPost) isAnonymousPost = fullPost.anonymous;

        // Reactor's identity: check if they post anonymously — but reactions don't have an "anonymous" flag.
        // For now, use the reactor's real name unless we later add reaction anonymity.
        await notifyReaction(
            post.authorId,
            reactor?.name || "Someone",
            params.id,
            EMOJI[type] || "🤗",
            false
        );
    }

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