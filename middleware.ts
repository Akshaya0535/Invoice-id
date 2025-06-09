import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login"]

  if (publicRoutes.includes(pathname)) {
    // If user is already logged in and tries to access login, redirect to home
    if (session && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Protected routes - require authentication
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Check role-based access for admin routes
  if (pathname.startsWith("/users")) {
    try {
      const sessionData = JSON.parse(session.value)
      if (sessionData.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
