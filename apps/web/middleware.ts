import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // 1. Handle CORS Preflight
    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    // 2. Admin UI Protection
    const { pathname } = request.nextUrl;
    if (pathname.startsWith('/admin')) {
        // Note: Middleware runs on the Edge and can't use Prisma directly.
        // We will do the strict ADMIN role check inside the Admin Layout component later.
        // For now, just ensure they have some auth token/cookie.
        const hasAuth = request.cookies.has('token') || request.headers.has('authorization');

        if (!hasAuth) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 3. Standard Response with CORS headers
    var response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return response;
}

export const config = {
    // Run on API routes AND admin pages
    matcher: [
        "/api/:path*",
        "/admin/:path*"
    ],
};