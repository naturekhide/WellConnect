import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
    var url = request.nextUrl.searchParams.get("url");
    if (!url) return new NextResponse("Missing URL", { status: 400 });

    try {
        // 1. Clean the URL
        const cleanUrl = url.replace(/[\[\]"\\]/g, "").trim();

        // 2. Fetch the image with the Vercel Blob token
        const res = await fetch(cleanUrl, {
            headers: {
                // 👇 Pass the token to authenticate the server-side fetch
                Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
            },
        });

        if (!res.ok) {
            console.error("Failed to fetch blob:", res.status, res.statusText);
            return new NextResponse(`Failed to fetch image: ${res.status}`, { status: res.status });
        }

        // 3. Get the image data
        const arrayBuffer = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "image/jpeg";

        // 4. Return the image
        return new NextResponse(arrayBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "no-store, no-cache, must-revalidate",
            },
        });
    } catch (e: any) {
        console.error("Image proxy error:", e.message);
        return new NextResponse(`Failed to load image: ${e.message}`, {
            status: 500,
            headers: { "Cache-Control": "no-store" }
        });
    }
}