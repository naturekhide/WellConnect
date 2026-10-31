import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    var url = request.nextUrl.searchParams.get("url");
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    try {
        const response = await fetch(url);
        const blob = await response.blob();
        
        // 🚨 Force the browser to download it
        return new NextResponse(blob, {
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="download"`,
            },
        });
    } catch (e) {
        return NextResponse.json({ error: "Download failed" }, { status: 500 });
    }
}