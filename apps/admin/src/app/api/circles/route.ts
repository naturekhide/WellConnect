import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const circles = await prisma.circle.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                creator: { select: { name: true, email: true } },
                _count: { select: { members: true, posts: true } }
            }
        });

        return NextResponse.json({ circles });
    } catch (error) {
        console.error("Error fetching circles:", error);
        return NextResponse.json({ error: "Failed to fetch circles" }, { status: 500 });
    }
}
