import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

// 👇 Save the token (called when the app opens)
export async function POST(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        var body = await request.json();
        var { token } = body;

        if (!token) {
            return NextResponse.json({ error: "Token required" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { expoPushToken: token },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Push token save error:", error);
        return NextResponse.json({ error: "Failed to save token" }, { status: 500 });
    }
}

// 👇 Remove the token (called on logout)
export async function DELETE(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { expoPushToken: null },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to remove token" }, { status: 500 });
    }
}