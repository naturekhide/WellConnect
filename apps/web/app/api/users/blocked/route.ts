import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
    try {
        const authHeader = headers().get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as { userId: string };

        const blocks = await prisma.block.findMany({
            where: { blockerId: decoded.userId },
            include: {
                blocked: {
                    select: { id: true, name: true, username: true }
                }
            }
        });

        // 👇 Added ': any' to fix the TS7006 error
        const blockedUsers = blocks.map((b: any) => b.blocked);
        
        return NextResponse.json(blockedUsers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch blocked users" }, { status: 500 });
    }
}