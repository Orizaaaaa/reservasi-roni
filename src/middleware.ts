// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const role = req.cookies.get('role')?.value;

    // Daftar path publik (static + dinamis)
    const publicMatchers: Array<(p: string) => boolean> = [
        p => p === '/',                          // home
        p => p === '/login',
        p => p === '/booking',
        p => p === '/home',
        p => p === '/history_booking',           // <- perbaiki: awali dengan '/'
        p => p.startsWith('/about_capster/'),    // dinamis: /about_capster/:id
        p => p.startsWith('/booking_bils/'),     // dinamis: /booking_bils/:id
    ];

    const isPublic = publicMatchers.some(test => test(pathname));
    if (isPublic) return NextResponse.next();

    // Proteksi route berbasis role
    if (pathname.startsWith('/admin_')) {
        if (role !== 'admin') {
            const url = req.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    } else {
        // Rute non-admin (private) khusus user login
        if (role !== 'user') {
            const url = req.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

// Keluarkan rute publik dari matcher agar middleware tidak berjalan di sana
export const config = {
    matcher: [
        // Semua path kecuali:
        // - api dan aset statik
        // - rute publik yang memang bebas
        '/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password|$|booking|home|history_booking|about_capster/.*|booking_bils/.*).*)',
    ],
};
