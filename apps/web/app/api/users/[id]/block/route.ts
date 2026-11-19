import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        // 1. Get Auth Token
        const authHeader = headers().get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as { userId: string };
        const currentUserId = decoded.userId;

        const targetUserId = params.id;

        if (targetUserId === currentUserId) {
            return NextResponse.json({ error: "You cannot block yourself" }, { status: 400 });
        }

        // 2. Create the block (using upsert so it doesn't crash if already blocked)
        await prisma.block.upsert({
            where: {
                blockerId_blockedId: {
                    blockerId: currentUserId,
                    blockedId: targetUserId
                }
            },
            create: {
                blockerId: currentUserId,
                blockedId: targetUserId
            },
            update: {}
        });

        return NextResponse.json({ success: true, message: "User blocked" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to block user" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        // 1. Get Auth Token
        const authHeader = headers().get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as { userId: string };
        const currentUserId = decoded.userId;

        // 2. Delete the block record
        await prisma.block.deleteMany({
            where: {
                blockerId: currentUserId,
                blockedId: params.id
            }
        });

        return NextResponse.json({ success: true, message: "User unblocked" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to unblock user" }, { status: 500 });
    }
}