import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";

export async function GET(request: NextRequest) {
    var url = request.nextUrl.searchParams.get("url");
    if (!url) return new NextResponse("Missing URL", { status: 400 });

    try {
        // 1. Extract the pathname from the URL
        var urlObj = new URL(url);
        var pathname = urlObj.pathname.substring(1);

        // 2. Use head() to get the blob's metadata (this works on all versions)
        // Passing the pathname is supported, and head() will resolve it correctly
        var blobInfo = await head(pathname, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        if (!blobInfo) {
            return new NextResponse("Image not found", { status: 404 });
        }

        // 3. Fetch the actual image data using the downloadUrl from head()
        // We use the direct fetch here because the blob is public
        var res = await fetch(blobInfo.downloadUrl);

        if (!res.ok) {
            return new NextResponse("Failed to fetch image", { status: res.status });
        }

        // 4. Return the image
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