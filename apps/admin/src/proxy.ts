import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow login and API routes
    if (pathname.startsWith('/login') || pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // Check for auth cookie
    const adminToken = request.cookies.get('admin_session')?.value;

    if (!adminToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};