import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";



export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Customer account protection
  if (pathname.startsWith("/account")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(url);
    }
  }

  // Admin area protection — unauthenticated sent to /admin/login (not public /login)
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
      return NextResponse.next();
    }
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/account/:path*", "/admin/:path*"] };
