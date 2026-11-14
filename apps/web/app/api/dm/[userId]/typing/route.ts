import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    var userId = await getCurrentUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 👇 Save the current timestamp to the database for the CURRENT user
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { lastTypingAt: new Date() },
        });
    } catch (e) { }

    return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    var userId = await getCurrentUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 👇 The params.userId is the person you are chatting WITH
    var otherId = params.userId;

    try {
        var otherUser = await prisma.user.findUnique({
            where: { id: otherId }, // 👈 FIXED: Check the OTHER user's timestamp
            select: { lastTypingAt: true },
        });

        var isTyping = false;
        if (otherUser?.lastTypingAt) {
            var diff = Date.now() - new Date(otherUser.lastTypingAt).getTime();
            // If they typed in the last 4 seconds, they are typing
            if (diff < 4000) {
                isTyping = true;
            }
        }

        return NextResponse.json({ isTyping });
    } catch (e) {
        return NextResponse.json({ isTyping: false });
    }
}