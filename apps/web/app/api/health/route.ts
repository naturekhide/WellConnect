import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // 👈 Prevents caching

export async function GET() {
    try {
        // 🚨 Fastest possible DB query to wake up Neon
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json({
            status: "ok",
            db: "awake",
            databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + "...",
        });
    } catch (e: any) {
        return NextResponse.json({
            status: "error",
            message: e.message,
            databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + "...",
        }, { status: 500 });
    }
}