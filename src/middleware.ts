import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'nl', 'tr'];
const defaultLocale = 'en';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

/**
 * NextAuth.js v4 + next-intl Middleware
 *
 * This middleware handles both locale routing and authentication.
 *
 * Protected routes:
 * - /dashboard/*
 * - /board/*
 *
 * Public routes:
 * - /login
 * - /api/*
 * - /_next/*
 * - /favicon.ico
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip for API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Apply intl middleware first
  const intlResponse = intlMiddleware(req);

  // Extract locale from pathname (e.g., /en/dashboard -> en)
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  const locale = pathnameLocale || defaultLocale;

  // Get token for auth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;

  // Auth logic
  const isAuthPage =
    pathname === `/${locale}/login` || pathname.endsWith('/login');
  const isProtectedRoute =
    pathname.includes('/dashboard') || pathname.includes('/board');

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL(`/${locale}/login`, req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  return intlResponse;
}

/**
 * Matcher configuration for middleware
 * Excludes static files and Next.js internals
 */
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
