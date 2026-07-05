import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip public paths
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") || 
    pathname.startsWith("/static") ||
    pathname.includes(".") // file extensions
  ) {
    return NextResponse.next();
  }

  // Check auth via a dummy cookie we'll set on login
  const authRole = request.cookies.get("authRole")?.value;

  // Protect /coach routes
  if (pathname.startsWith("/coach") && authRole !== "coach") {
    return NextResponse.redirect(new URL("/auth/coach-login", request.url));
  }

  // Protect /player routes
  if (pathname.startsWith("/player") && authRole !== "player") {
    return NextResponse.redirect(new URL("/auth/player-login", request.url));
  }

  // Redirect root to landing if no role, else to their respective dashboard
  if (pathname === "/") {
    if (authRole === "coach") {
      return NextResponse.redirect(new URL("/coach/dashboard", request.url));
    } else if (authRole === "player") {
      return NextResponse.redirect(new URL("/player/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/auth/landing", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
