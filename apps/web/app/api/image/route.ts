import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
    var url = request.nextUrl.searchParams.get("url");
    if (!url) return new NextResponse("Missing URL", { status: 400 });

    try {
        // 1. Clean the URL
        const cleanUrl = url.replace(/[\[\]"\\]/g, "").trim();

        // 2. Extract ONLY the filename from the URL
        // Example: "https://...com/a66ac34...jpeg" -> "a66ac34...jpeg"
        const filename = cleanUrl.split("/").pop() || "";

        if (!filename) {
            return new NextResponse("Invalid URL", { status: 400 });
        }

        // 3. Call head() with just the filename
        var blobInfo = await head(filename, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        if (!blobInfo) {
            return new NextResponse("Image not found", { status: 404 });
        }

        // 4. Fetch the image using the downloadUrl returned by head()
        var res = await fetch(blobInfo.downloadUrl);

        if (!res.ok) {
            return new NextResponse("Failed to fetch image", { status: res.status });
        }

        var arrayBuffer = await res.arrayBuffer();
        return new NextResponse(arrayBuffer, {
            headers: {
                "Content-Type": blobInfo.contentType || "image/jpeg",
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