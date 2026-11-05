import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        var userId = await getCurrentUserId(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all user data in parallel for speed
        const [
            user,
            moodEntries,
            journalEntries,
            goals,
            insights,
            achievements,
            feedPosts,
            feedReplies,
            circleMemberships
        ] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { name: true, username: true, email: true, createdAt: true }
            }),
            prisma.moodEntry.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
            prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
            prisma.goal.findMany({ where: { userId } }),
            prisma.insight.findMany({ where: { userId } }),
            prisma.achievement.findMany({ where: { userId } }),
            prisma.feedPost.findMany({
                where: { authorId: userId },
                include: { reactions: true, replies: true }
            }),
            prisma.feedReply.findMany({ where: { authorId: userId } }),
            prisma.circleMember.findMany({
                where: { userId },
                include: { circle: { select: { name: true } } }
            })
        ]);

        const exportData = {
            exportDate: new Date().toISOString(),
            accountDetails: user,
            moodHistory: moodEntries,
            journalHistory: journalEntries,
            goals: goals,
            insights: insights,
            achievements: achievements,
            posts: feedPosts,
            comments: feedReplies,
            circlesJoined: circleMemberships.map((m: any) => ({
                circleName: m.circle.name,
                role: m.role,
                status: m.status,
                joinedAt: m.joinedAt
            }))
        };

        // Return as a downloadable JSON file
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="wellconnect-data-${user?.username || "export"}.json"`,
            },
        });

    } catch (error: any) {
        console.error("Data export error:", error);
        return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
    }
}