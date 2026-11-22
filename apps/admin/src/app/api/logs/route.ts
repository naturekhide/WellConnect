import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const logs = await prisma.adminLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 20, // Get the 20 most recent actions
        });
        return NextResponse.json({ logs });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}