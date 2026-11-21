import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const q = searchParams.get("q") || "";

        // Search by name or email if a query is provided
        const users = await prisma.user.findMany({
            where: q ? {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                    { username: { contains: q, mode: "insensitive" } },
                ]
            } : {},
            orderBy: { createdAt: "desc" },
            take: 50,
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                suspended: true,
                createdAt: true,
            }
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}