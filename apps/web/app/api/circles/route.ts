import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

function slugify(name: string) {
    return name.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 50);
}

export async function GET(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var url = new URL(request.url);
    var q = url.searchParams.get("q") || "";

    var circles = await prisma.circle.findMany({
        where: q ? { name: { contains: q, mode: "insensitive" } } : {},
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
            creator: { select: { id: true, name: true, username: true } },
            _count: { select: { members: true, posts: true } },
            members: userId ? {
                where: { userId: userId },
                select: { status: true },
            } : false,
        },
    });

    var transformed = circles.map(function (c: any) {
        var myMembership = c.members && c.members[0];
        return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            emoji: c.emoji,
            coverColor: c.coverColor,
            isPrivate: c.isPrivate,
            creator: c.creator,
            memberCount: c._count.members,
            postCount: c._count.posts,
            myStatus: myMembership ? myMembership.status : null,
        };
    });

    return NextResponse.json({ circles: transformed });
}

export async function POST(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    var body = await request.json();
    var { name, description, emoji, coverColor, isPrivate } = body;

    if (!name || name.trim().length < 3) {
        return NextResponse.json({ error: "Name must be at least 3 characters" }, { status: 400 });
    }
    if (name.length > 50) {
        return NextResponse.json({ error: "Name too long (max 50)" }, { status: 400 });
    }

    var slug = slugify(name);

    var existing = await prisma.circle.findFirst({
        where: { OR: [{ name: name.trim() }, { slug: slug }] },
    });
    if (existing) {
        return NextResponse.json({ error: "A circle with that name already exists" }, { status: 400 });
    }

    var circle = await prisma.circle.create({
        data: {
            name: name.trim(),
            slug: slug,
            description: description?.trim() || null,
            emoji: emoji || "🌿",
            coverColor: coverColor || "#059669",
            isPrivate: isPrivate || false,
            creatorId: userId,
            members: {
                create: {
                    userId: userId,
                    role: "creator",
                    status: "approved",
                },
            },
        },
        include: {
            creator: { select: { id: true, name: true, username: true } },
            _count: { select: { members: true, posts: true } },
        },
    });

    return NextResponse.json({
        id: circle.id,
        name: circle.name,
        slug: circle.slug,
        description: circle.description,
        emoji: circle.emoji,
        coverColor: circle.coverColor,
        isPrivate: circle.isPrivate,
        creator: circle.creator,
        memberCount: circle._count.members,
        postCount: circle._count.posts,
        myStatus: "approved",
    }, { status: 201 });
}