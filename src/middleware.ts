import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);

const PROTECTED_ROUTES = ["/mi-cuenta", "/admin"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/registro"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;

  let session: { role?: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload as { role?: string };
    } catch {
      // Invalid token
    }
  }

  // Redirect logged-in users away from auth pages
  if (session && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/mi-cuenta", request.url));
  }

  // Protect user routes
  if (!session && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect admin routes
  if (
    ADMIN_ROUTES.some((r) => pathname.startsWith(r)) &&
    session?.role !== "OPERADORA" &&
    session?.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/mi-cuenta", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/mi-cuenta/:path*",
    "/admin/:path*",
    "/login",
    "/registro",
  ],
};
