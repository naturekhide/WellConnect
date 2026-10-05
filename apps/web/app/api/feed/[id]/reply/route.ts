import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var body = await request.json();
    var { content, anonymous } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    if (content.length > 300) {
        return NextResponse.json({ error: "Reply too long (max 300 characters)" }, { status: 400 });
    }

    var post = await prisma.feedPost.findUnique({
        where: { id: params.id },
        select: { id: true },
    });

    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    var reply = await prisma.feedReply.create({
        data: {
            postId: params.id,
            authorId: userId,
            content: content.trim(),
            anonymous: anonymous || false,
        },
        include: {
            author: { select: { id: true, name: true, username: true } },
        },
    });

    return NextResponse.json({
        id: reply.id,
        content: reply.content,
        anonymous: reply.anonymous,
        createdAt: reply.createdAt,
        author: reply.anonymous ? null : reply.author,
    }, { status: 201 });
}