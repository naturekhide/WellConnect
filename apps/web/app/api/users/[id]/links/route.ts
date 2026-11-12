import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

// GET: Fetch all links for a user
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        var links = await prisma.profileLink.findMany({
            where: { userId: params.id },
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json({ links });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
    }
}

// POST: Add a new link (Only the owner can add)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    var currentUserId = await getCurrentUserId(request);
    if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure the user is only adding links to their OWN profile
    if (currentUserId !== params.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    try {
        var body = await request.json();
        var { title, url } = body;

        if (!title || !url) {
            return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
        }

        // Ensure URL starts with http
        var formattedUrl = url.startsWith("http") ? url : `https://${url}`;

        // 🚨 Auto-detect the icon based on the URL
        var icon = "🔗"; // Default
        var lowerUrl = formattedUrl.toLowerCase();
        if (lowerUrl.includes("instagram.com")) icon = "📸";
        else if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) icon = "▶️";
        else if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) icon = "🐦";
        else if (lowerUrl.includes("linkedin.com")) icon = "💼";
        else if (lowerUrl.includes("tiktok.com")) icon = "🎵";
        else if (lowerUrl.includes("github.com")) icon = "💻";
        else if (lowerUrl.includes("facebook.com")) icon = "📘";
        else if (lowerUrl.includes("whatsapp.com") || lowerUrl.includes("wa.me")) icon = "💬";
        else if (lowerUrl.includes("spotify.com")) icon = "🎧";
        else if (lowerUrl.includes("threads.net")) icon = "@";
        else if (lowerUrl.includes("snapchat.com")) icon = "👻";

        var newLink = await prisma.profileLink.create({
            data: {
                userId: currentUserId,
                title: title.trim(),
                url: formattedUrl,
                icon: icon, // 👈 Save the icon
            },
        });

        return NextResponse.json(newLink);
    } catch (error: any) {
        console.error("❌ ADD LINK ERROR:", error);
        return NextResponse.json({ error: error.message || "Failed to add link" }, { status: 500 });
    }
}

// DELETE: Remove a link
export async function DELETE(request: NextRequest) {
    var currentUserId = await getCurrentUserId(request);
    if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        var url = new URL(request.url);
        var linkId = url.searchParams.get("linkId");

        if (!linkId) return NextResponse.json({ error: "Link ID required" }, { status: 400 });

        await prisma.profileLink.delete({
            where: { id: linkId, userId: currentUserId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
    }
}