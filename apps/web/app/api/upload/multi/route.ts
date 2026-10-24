import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    // 1. Verify the user is logged in
    var userId = await getCurrentUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        var uploadedUrls: string[] = [];

        // 2. Upload each file to Vercel Blob
        for (const file of files) {
            const blob = await put(file.name, file, {
                access: 'public', // Makes the image publicly viewable
                addRandomSuffix: true, // Prevents filename collisions
            });
            uploadedUrls.push(blob.url); // This is the full https://... URL
        }

        // 3. Return the URLs to the frontend
        return NextResponse.json({ urls: uploadedUrls });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}