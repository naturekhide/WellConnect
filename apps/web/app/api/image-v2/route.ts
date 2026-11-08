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

        // 2. Extract the pathname (everything after the domain)
        // Example: "https://...com/folder/file.jpeg" -> "/folder/file.jpeg"
        const urlObj = new URL(cleanUrl);
        const pathname = urlObj.pathname;

        // 3. Try to find the blob using the pathname
        var blobInfo;
        try {
            // First try with the pathname (e.g., "/file.jpeg")
            blobInfo = await head(pathname, {
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });
        } catch (e) {
            // If that fails, try with just the filename
            const filename = pathname.split("/").pop() || "";
            blobInfo = await head(filename, {
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });
        }

        if (!blobInfo) {
            return new NextResponse("Image not found", { status: 404 });
        }

        // 4. Fetch the image
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