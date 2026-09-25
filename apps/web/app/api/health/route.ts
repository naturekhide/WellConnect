import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

var prisma = new PrismaClient();

export async function GET() {
    try {
        var userCount = await prisma.user.count();
        return NextResponse.json({
            status: "ok",
            userCount: userCount,
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