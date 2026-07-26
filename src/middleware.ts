import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route categories
const PROTECTED_ROUTE_PREFIX = '/dashboard';
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Retrieve the session cookie
  const session = request.cookies.get('appwrite-session');
  const isAuthenticated = !!session?.value;

  // 1. Guard protected paths (e.g. /dashboard)
  if (pathname.startsWith(PROTECTED_ROUTE_PREFIX)) {
    if (!isAuthenticated) {
      // Redirect unauthenticated user to login, preserving current path in query
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Prevent authenticated users from visiting auth pages (login, signup, etc.)
  if (AUTH_ROUTES.includes(pathname)) {
    if (isAuthenticated) {
      // Redirect authenticated user straight to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware matching to only auth pages and dashboard routes
export const config = {
  matcher: [
    '/login',
    '/signup',
    '/forgot-password',
    '/dashboard/:path*',
  ],
};
