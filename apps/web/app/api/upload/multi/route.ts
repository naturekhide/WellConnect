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
        // Use formData.getAll because the mobile app sends it as 'files' array
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        var uploadedUrls: string[] = [];

        // 2. Upload each file to Vercel Blob
        for (const file of files) {
            // Convert the File to a Buffer (this fixes the Web/React Native upload issue)
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Ensure we have a valid filename
            var fileName = file.name || "upload.png";

            const blob = await put(fileName, buffer, {
                access: 'public',
                addRandomSuffix: true,
                contentType: file.type || 'image/png', // Explicitly set the mime type
            });

            uploadedUrls.push(blob.url);
        }

        // 3. Return the URLs to the frontend
        return NextResponse.json({ urls: uploadedUrls });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}