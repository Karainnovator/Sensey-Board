'use client';

import { useSession } from 'next-auth/react';

/**
 * Custom hook for accessing authentication state
 *
 * This hook provides a typed interface to the NextAuth session
 * with additional helper properties and methods.
 *
 * @returns Authentication state and user information
 *
 * @example
 * ```tsx
 * const { user, isLoading, isAuthenticated } = useAuth();
 *
 * if (isLoading) return <Spinner />;
 * if (!isAuthenticated) return <LoginPrompt />;
 *
 * return <div>Hello {user.name}</div>;
 * ```
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    session,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
    status,
  };
}

/**
 * Custom hook to check if user has a specific role
 *
 * @param requiredRole - The role to check against
 * @returns boolean indicating if user has the required role
 *
 * @example
 * ```tsx
 * const isAdmin = useRequireRole('ADMIN');
 *
 * if (!isAdmin) {
 *   return <AccessDenied />;
 * }
 * ```
 */
export function useRequireRole(requiredRole: string) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return false;
  }

  return user.role === requiredRole;
}

/**
 * Custom hook to get user's external ID (Azure AD)
 *
 * @returns External ID or null
 */
export function useExternalId() {
  const { user } = useAuth();
  return user?.externalId ?? null;
}
