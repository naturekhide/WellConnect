import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    // ... (Keep your existing GET function exactly as it is) ...
}

export async function POST(request: NextRequest) {
    var userIdOrNull = await getCurrentUserId(request);
    if (!userIdOrNull) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    var userId: string = userIdOrNull;

    var body = await request.json();
    var { content, imageUrls, anonymous, circleId } = body;

    if ((!content || content.trim().length === 0) && (!imageUrls || imageUrls.length === 0)) {
        return NextResponse.json({ error: "Content or image required" }, { status: 400 });
    }

    var post = await prisma.feedPost.create({
        data: {
            content: content ? content.trim() : "",
            imageUrls: imageUrls || [],
            anonymous: anonymous || false,
            circleId: circleId || null,
            authorId: userId,
        },
    });

    // ─── AI REFLECTION BOT (PRIVATE WHISPER) ───
    if (content && content.trim().length > 0) {
        try {
            // 🚨 DYNAMIC IMPORT FIX
            const Sentiment = (await import("sentiment")).default;
            const sentiment = new Sentiment();

            var analysis = sentiment.analyze(content);

            if (analysis.score <= -1) {
                var recentNotif = await prisma.notification.findFirst({
                    where: {
                        userId: userId,
                        type: "system_support",
                        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                    },
                });

                if (!recentNotif) {
                    await prisma.notification.create({
                        data: {
                            userId: userId,
                            type: "system_support",
                            title: "We hear you 🫂",
                            body: "We noticed your recent post sounded a little heavy. We just want to remind you that you're not alone. Take a deep breath today.",
                            isRead: false,
                        }
                    });
                }
            }
        } catch (aiError) {
            console.error("AI Sentiment failed:", aiError);
        }
    }
    // ──────────────────────────────────────────

    return NextResponse.json(post);
}