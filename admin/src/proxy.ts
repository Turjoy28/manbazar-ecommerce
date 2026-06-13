import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const token = request.cookies.get("adminToken")?.value;
    const { pathname } = request.nextUrl;

    // Exclude API routes and public assets
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    const isLoginPage = pathname === "/login";

    if (!token && !isLoginPage) {
        // Redirect to login page if no token exists
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (token && isLoginPage) {
        // Redirect to dashboard if logged-in user tries to visit login
        const dashboardUrl = new URL("/", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Apply middleware to all routes except public paths/assets
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
