import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
    var url = request.nextUrl.searchParams.get("url");
    if (!url) return new NextResponse("Missing URL", { status: 400 });

    // Clean the URL
    const cleanUrl = url.replace(/[\[\]"\\]/g, "").trim();

    // Redirect the browser directly to the public Blob URL
    return NextResponse.redirect(cleanUrl);
}