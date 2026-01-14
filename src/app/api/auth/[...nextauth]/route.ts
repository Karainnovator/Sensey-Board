import NextAuth from 'next-auth';
import { authOptions } from '@/server/auth/config';

/**
 * NextAuth.js v4 API Route Handlers
 *
 * This file exports the GET and POST handlers for NextAuth.js
 * All authentication requests will be handled through these routes.
 *
 * Endpoints:
 * - GET  /api/auth/session      - Get current session
 * - POST /api/auth/signin       - Sign in with provider
 * - POST /api/auth/signout      - Sign out
 * - GET  /api/auth/callback/*   - OAuth callbacks
 * - GET  /api/auth/csrf         - CSRF token
 * - GET  /api/auth/providers    - List configured providers
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
