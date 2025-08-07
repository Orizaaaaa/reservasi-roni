import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token');
    const roleCookie = req.cookies.get('role');
    const role = roleCookie ? roleCookie.value : undefined;

    // Daftar path yang boleh diakses tanpa autentikasi
    const publicPaths = ['/login', '/', '/booking', '/home',
        '/about_capster/:id', 'history_booking', 'booking_bils/:id'];

    // Jika mengakses path public, lanjutkan tanpa pengecekan
    if (publicPaths.includes(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    // Jika tidak ada token, redirect ke login
    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Proteksi route berdasarkan role
    const urlPath = req.nextUrl.pathname;

    // Admin routes - hanya bisa diakses oleh admin
    if (urlPath.startsWith('/admin_') && role !== 'admin') {
        const url = req.nextUrl.clone();
        url.pathname = '/login'; // atau redirect ke halaman lain
        return NextResponse.redirect(url);
    }

    // User routes - hanya bisa diakses oleh user
    if (!urlPath.startsWith('/admin_') && role !== 'user') {
        const url = req.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    // Middleware akan dijalankan di semua route kecuali:
    matcher: [
        /*
         * Match all request paths except for:
         * - api routes
         * - static files (._next, images, etc)
         * - public routes (login, register, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password).*)',
    ],
};