import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    var userId: string = userIdOrNull;

    var post = await prisma.feedPost.findUnique({
        where: { id: params.id },
        select: { id: true, authorId: true, deletedAt: true },
    });

    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.authorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.feedPost.update({
        where: { id: params.id },
        data: { deletedAt: null },
    });

    return NextResponse.json({ success: true });
}