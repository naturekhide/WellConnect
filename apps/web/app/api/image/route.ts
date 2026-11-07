import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";

export async function GET(request: NextRequest) {
    var url = request.nextUrl.searchParams.get("url");
    if (!url) return new NextResponse("Missing URL", { status: 400 });

    try {
        // 1. Pass the FULL URL to head(). The SDK will extract the filename automatically.
        var blobInfo = await head(url, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        if (!blobInfo) {
            return new NextResponse("Image not found", { status: 404 });
        }

        // 2. Fetch the actual image data
        var res = await fetch(blobInfo.downloadUrl);

        if (!res.ok) {
            return new NextResponse("Failed to fetch image", { status: res.status });
        }

        // 3. Return the image
        var arrayBuffer = await res.arrayBuffer();
        return new NextResponse(arrayBuffer, {
            headers: {
                "Content-Type": blobInfo.contentType || "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (e: any) {
        console.error("Image proxy error:", e.message);
        return new NextResponse("Failed to load image", { status: 500 });
    }
}