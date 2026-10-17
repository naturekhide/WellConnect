import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var url = new URL(request.url);
    var q = url.searchParams.get("q") || "";
    var type = url.searchParams.get("type") || "all";

    if (q.trim().length < 2) {
        return NextResponse.json({ users: [], posts: [], circles: [], journals: [] });
    }

    var query = q.trim();

    var result: any = {
        users: [],
        posts: [],
        circles: [],
        journals: [],
    };

    if (type === "all" || type === "users") {
        var users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { username: { contains: query, mode: "insensitive" } },
                ],
            },
            take: 20,
            select: { id: true, name: true, username: true },
        });
        result.users = users;
    }

    if (type === "all" || type === "circles") {
        var circles = await prisma.circle.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
            },
            take: 20,
            include: {
                _count: { select: { members: true, posts: true } },
            },
        });
        result.circles = circles.map(function (c) {
            return {
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description,
                emoji: c.emoji,
                coverColor: c.coverColor,
                isPrivate: c.isPrivate,
                memberCount: c._count.members,
                postCount: c._count.posts,
            };
        });
    }

    if (type === "all" || type === "posts") {
        var myCircleIds = await prisma.circleMember.findMany({
            where: { userId: userId, status: "approved" },
            select: { circleId: true },
        });
        var myCircleList = myCircleIds.map(function (m) { return m.circleId; });

        var posts = await prisma.feedPost.findMany({
            where: {
                content: { contains: query, mode: "insensitive" },
                anonymous: false,
                deletedAt: null,
                OR: [
                    { circleId: null },
                    { circleId: { in: myCircleList } },
                ],
            },
            take: 30,
            orderBy: { createdAt: "desc" },
            include: {
                author: { select: { id: true, name: true, username: true } },
                _count: { select: { replies: true } },
            },
        });

        result.posts = posts.map(function (p) {
            return {
                id: p.id,
                content: p.content,
                createdAt: p.createdAt,
                author: p.author,
                circleId: p.circleId,
                replyCount: p._count.replies,
            };
        });
    }

    if (type === "all" || type === "journals") {
        var journals = await prisma.journalEntry.findMany({
            where: {
                userId: userId,
                content: { contains: query, mode: "insensitive" },
            },
            take: 20,
            orderBy: { createdAt: "desc" },
            select: { id: true, content: true, createdAt: true },
        });
        result.journals = journals;
    }

    return NextResponse.json(result);
}