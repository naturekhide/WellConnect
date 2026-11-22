import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const posts = await prisma.feedPost.findMany({
            where: {
                deletedAt: null, // Only fetch active posts
            },
            orderBy: { createdAt: "desc" },
            take: 100,
            include: {
                author: { select: { name: true, email: true } },
                circle: { select: { name: true, emoji: true } },
                _count: { select: { reactions: true, replies: true } }
            }
        });

        return NextResponse.json({ posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}