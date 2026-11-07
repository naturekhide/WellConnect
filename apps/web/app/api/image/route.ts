import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";

export async function GET(request: NextRequest) {
    var url = request.nextUrl.searchParams.get("url");
    if (!url) return new NextResponse("Missing URL", { status: 400 });

    console.log("🔍 [PROXY] Received request for URL:", url);
    console.log("🔑 [PROXY] BLOB_READ_WRITE_TOKEN is:", process.env.BLOB_READ_WRITE_TOKEN ? "SET" : "MISSING");

    try {
        // 1. Test head()
        console.log("🔄 [PROXY] Calling head()...");
        var blobInfo = await head(url, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        console.log("✅ [PROXY] head() success! Download URL:", blobInfo.downloadUrl);

        // 2. Test fetch()
        console.log("🔄 [PROXY] Fetching image from downloadUrl...");
        var res = await fetch(blobInfo.downloadUrl);
        console.log("✅ [PROXY] Fetch status:", res.status);

        if (!res.ok) {
            console.error("❌ [PROXY] Fetch failed with status:", res.status);
            return new NextResponse("Failed to fetch image", { status: res.status });
        }

        var arrayBuffer = await res.arrayBuffer();
        console.log("✅ [PROXY] ArrayBuffer size:", arrayBuffer.byteLength);

        return new NextResponse(arrayBuffer, {
            headers: {
                "Content-Type": blobInfo.contentType || "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (e: any) {
        console.error("❌ [PROXY] FATAL ERROR:", e.message);
        return new NextResponse("Failed to load image", { status: 500 });
    }
}