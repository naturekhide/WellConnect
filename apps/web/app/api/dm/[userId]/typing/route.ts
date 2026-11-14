import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/get-user";

// A simple in-memory store (resets if server restarts, but works perfectly for this)
var typingStore: any = {};

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    var userId = await getCurrentUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    typingStore[params.userId] = { userId, timestamp: Date.now() };
    return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    var userId = await getCurrentUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var record = typingStore[userId];
    // If they typed in the last 3 seconds, they are "typing"
    var isTyping = record && (Date.now() - record.timestamp < 3000);

    return NextResponse.json({ isTyping: !!isTyping });
}