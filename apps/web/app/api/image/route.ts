import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
    var url = request.nextUrl.searchParams.get("url");
    if (!url) return new NextResponse("Missing URL", { status: 400 });

    console.log("🔍 [PROXY] Received request for URL:", url);
    console.log("🔑 [PROXY] BLOB_READ_WRITE_TOKEN is:", process.env.BLOB_READ_WRITE_TOKEN ? "SET" : "MISSING");

    try {
        // 1. Clean the URL just in case
        const cleanUrl = url.replace(/[\[\]"\\]/g, "").trim();

        console.log("🔄 [PROXY] Calling head()...");
        var blobInfo = await head(cleanUrl, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        console.log("✅ [PROXY] head() success! Download URL:", blobInfo.downloadUrl);

        console.log("🔄 [PROXY] Fetching image from downloadUrl...");
        var res = await fetch(blobInfo.downloadUrl);
        console.log("✅ [PROXY] Fetch status:", res.status);

        if (!res.ok) {
            console.error("❌ [PROXY] Fetch failed with status:", res.status);
            return new NextResponse("Failed to fetch image", {
                status: res.status,
                headers: { "Cache-Control": "no-store" }
            });
        }

        var arrayBuffer = await res.arrayBuffer();
        console.log("✅ [PROXY] ArrayBuffer size:", arrayBuffer.byteLength);

        return new NextResponse(arrayBuffer, {
            headers: {
                "Content-Type": blobInfo.contentType || "image/jpeg",
                // 👇 Disable caching to prevent Vercel from storing errors
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            },
        });
    } catch (e: any) {
        console.error("❌ [PROXY] FATAL ERROR:", e.message);
        return new NextResponse(`Failed to load image: ${e.message}`, {
            status: 500,
            headers: { "Cache-Control": "no-store" }
        });
    }
}