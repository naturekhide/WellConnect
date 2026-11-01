import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user"; // 👈 Using your actual auth helper

export async function POST(
    req: NextRequest, // 👈 Changed to NextRequest
    { params }: { params: { id: string, messageId: string } }
) {
    try {
        // 1. Dynamic Auth Check
        const userId = await getCurrentUserId(req);
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { emoji } = await req.json();
        const circleMessageId = params.messageId;

        // 2. Check for existing reaction using the CIRCLE unique constraint
        const existing = await prisma.messageReaction.findUnique({
            where: {
                circleMessageId_userId: { 
                    circleMessageId,
                    userId
                }
            }
        });

        // 3. Toggle or Create
        if (existing) {
            if (existing.emoji === emoji) {
                // Same emoji -> Remove reaction
                await prisma.messageReaction.delete({
                    where: { id: existing.id }
                });
            } else {
                // Different emoji -> Update reaction
                await prisma.messageReaction.update({
                    where: { id: existing.id },
                    data: { emoji }
                });
            }
        } else {
            // No reaction -> Create new
            await prisma.messageReaction.create({
                data: {
                    circleMessageId,
                    userId,
                    emoji
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Reaction error:", error);
        return NextResponse.json({ error: error.message || "Failed to react" }, { status: 500 });
    }
}