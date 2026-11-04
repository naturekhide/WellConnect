import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        var uploadedUrls: string[] = [];

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            var fileName = file.name || "upload.png";
            
            // 👇 Bulletproof type detection
            var contentType = file.type;
            if (!contentType || contentType === "application/octet-stream") {
                if (fileName.endsWith(".webm")) contentType = "audio/webm";
                else if (fileName.endsWith(".m4a")) contentType = "audio/mp4";
                else if (fileName.endsWith(".mp3")) contentType = "audio/mpeg";
                else if (fileName.endsWith(".pdf")) contentType = "application/pdf";
                else if (fileName.endsWith(".png")) contentType = "image/png";
                else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";
                else contentType = "application/octet-stream";
            }

            const blob = await put(fileName, buffer, {
                access: 'public',
                addRandomSuffix: true,
                contentType: contentType, // 👈 Now it's always correct
            });

            uploadedUrls.push(blob.url);
        }

        return NextResponse.json({ urls: uploadedUrls });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}