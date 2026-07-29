import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route categories
const PROTECTED_ROUTE_PREFIX = '/dashboard';
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. CSRF Protection Check for state-changing HTTP methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        // Compare origin host with requesting host name
        if (originUrl.host !== host) {
          return new NextResponse(
            JSON.stringify({ error: 'CSRF verification failed: Origin mismatch.' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ error: 'CSRF verification failed: Malformed Origin.' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
  }

  // 2. Retrieve the session cookie and process routing guards
  const session = request.cookies.get('appwrite-session');
  const isAuthenticated = !!session?.value;

  let response = NextResponse.next();

  if (pathname.startsWith(PROTECTED_ROUTE_PREFIX)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      response = NextResponse.redirect(loginUrl);
    }
  } else if (AUTH_ROUTES.includes(pathname)) {
    if (isAuthenticated) {
      response = NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. Inject strict Security Headers (Equivalent to Helmet.js)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.plaid.com https://api.dwolla.com https://cloud.appwrite.io ws: wss:;
    frame-src 'self' https://cdn.plaid.com https://js.stripe.com;
    media-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

// Apply middleware checks globally across pages and APIs
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (handled within backend route policies)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
