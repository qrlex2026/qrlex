import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Protect /admin routes (except /admin/login)
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        const session = req.cookies.get("qrlex-admin");
        if (!session) {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }
        // Verify role is superadmin
        try {
            const payload = JSON.parse(Buffer.from(session.value, "base64").toString());
            if (payload.role !== "superadmin") {
                return NextResponse.redirect(new URL("/admin/login", req.url));
            }
        } catch {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }
    }

    // Protect /panel routes
    if (pathname.startsWith("/panel")) {
        const session = req.cookies.get("qrlex-owner");
        if (!session) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        // Verify role is owner
        try {
            const payload = JSON.parse(Buffer.from(session.value, "base64").toString());
            if (payload.role !== "owner") {
                return NextResponse.redirect(new URL("/login", req.url));
            }
        } catch {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/panel/:path*"],
};
