import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Standard browser-compatible JWT decoder for edge runtime
function decodeJwt(token: string) {
    try {
        const payloadBase64 = token.split(".")[1];
        if (!payloadBase64) return null;
        
        // base64url to base64
        const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        // Decode base64 using atob
        const jsonPayload = atob(base64);
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("[Proxy Middleware] JWT decode error:", e);
        return null;
    }
}

export function proxy(request: NextRequest) {
    const token = request.cookies.get("adminToken")?.value;
    const { pathname } = request.nextUrl;

    // Exclude Next.js internal files, static assets, and api routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    const isLoginPage = pathname === "/login";
    const isSetPasswordPage = pathname === "/set-password";

    // 1. Unauthenticated users: redirect to login unless visiting login or set-password
    if (!token && !isLoginPage && !isSetPasswordPage) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 2. Authenticated users
    if (token) {
        const payload = decodeJwt(token);
        const role = payload?.role;

        // Redirect to home if logged-in user visits login
        if (isLoginPage) {
            const dashboardUrl = new URL("/", request.url);
            return NextResponse.redirect(dashboardUrl);
        }

        // 3. Manager/Sub-Admin Route Protection
        // If role is MANAGER or USER, block Settings and redirect to Products page
        if (role === "MANAGER" || role === "USER") {
            const forbiddenPaths = ["/settings", "/admin/settings"];
            if (forbiddenPaths.some(p => pathname.startsWith(p))) {
                console.log(`[Proxy Middleware] Blocking non-admin role (${role}) from accessing settings path: ${pathname}`);
                // Redirect back to products page as per specification
                const productsUrl = new URL("/products", request.url);
                return NextResponse.redirect(productsUrl);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    // Apply middleware to all routes except public paths/assets
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
