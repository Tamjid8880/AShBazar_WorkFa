import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow public admin pages (login + setup)
    const publicAdminPaths = ["/admin/login", "/admin/setup"];
    if (publicAdminPaths.some(p => path.startsWith(p))) {
      return NextResponse.next();
    }

    // Protect all other /admin routes
    if (path.startsWith("/admin")) {
      if (!token || (token.role !== "admin" && token.role !== "super_admin")) {
        return NextResponse.redirect(new URL("/admin/login?error=AccessDenied", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: () => true
    }
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
