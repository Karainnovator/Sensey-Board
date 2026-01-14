'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

/**
 * Session Provider Wrapper
 *
 * Wraps the NextAuth SessionProvider for client-side session access.
 * This component must be used in a client component context.
 *
 * @param children - Child components that need session access
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
