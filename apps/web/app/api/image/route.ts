import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    var url = request.nextUrl.searchParams.get("url");
    if (!url) return new NextResponse("Missing URL", { status: 400 });

    try {
        // 1. Fetch the image from Vercel Blob
        var res = await fetch(url);
        
        if (!res.ok) {
            return new NextResponse("Failed to fetch image", { status: res.status });
        }

        // 2. Get the image data as an array buffer
        var arrayBuffer = await res.arrayBuffer();
        
        // 3. Get the content type (e.g., image/jpeg)
        var contentType = res.headers.get("content-type") || "image/jpeg";

        // 4. Return the image with the correct headers
        return new NextResponse(arrayBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable", // Cache it heavily
            },
        });
    } catch (e) {
        return new NextResponse("Failed to load image", { status: 500 });
    }
}