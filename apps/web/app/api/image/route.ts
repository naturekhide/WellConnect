import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";

export async function GET(request: NextRequest) {
    var url = request.nextUrl.searchParams.get("url");
    if (!url) return new NextResponse("Missing URL", { status: 400 });

    try {
        // 1. Fetch the image from Vercel Blob with the token
        var res = await fetch(url, {
            headers: {
                // 👇 Pass the Vercel Blob token to authenticate server-side fetches
                Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
            },
        });

        if (!res.ok) {
            console.error("Blob fetch failed:", res.status, res.statusText);
            return new NextResponse("Failed to fetch image", { status: res.status });
        }

        // 2. Get the image data
        var arrayBuffer = await res.arrayBuffer();
        var contentType = res.headers.get("content-type") || "image/jpeg";

        // 3. Return the image
        return new NextResponse(arrayBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (e: any) {
        console.error("Image proxy error:", e.message);
        return new NextResponse("Failed to load image", { status: 500 });
    }
}