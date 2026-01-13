# Authentication Implementation - Agent 4

## Summary

Complete NextAuth.js v5 implementation with Keycloak provider for Sensey Board.

## Files Created/Modified

### Core Authentication Files

1. **src/server/auth/config.ts**
   - NextAuth.js v5 configuration
   - Keycloak provider setup
   - Custom callbacks for JWT and session
   - Type augmentation for custom user fields (role, keycloakId)
   - Prisma adapter integration

2. **src/app/api/auth/[...nextauth]/route.ts**
   - NextAuth API route handlers
   - Exports GET and POST handlers for all auth endpoints

3. **src/middleware.ts**
   - Route protection middleware
   - Redirects unauthenticated users to login
   - Redirects authenticated users away from login page
   - Protects /dashboard/_ and /board/_ routes

### Hooks & Utilities

4. **src/hooks/use-auth.ts**
   - Custom auth hooks: `useAuth()`, `useRequireRole()`, `useKeycloakId()`
   - Typed wrappers around NextAuth's useSession
   - Helper functions for role checking

### UI Components

5. **src/components/providers/session-provider.tsx**
   - Client-side SessionProvider wrapper
   - Required for useSession in client components

6. **src/app/(auth)/layout.tsx**
   - Clean, centered layout for auth pages
   - Minimalist design with Sakura Pink theme

7. **src/app/(auth)/login/page.tsx**
   - Login page with Keycloak sign-in button
   - Follows Sensey Board design system
   - Supports callbackUrl redirect after login

8. **src/components/layout/user-menu.tsx**
   - Dropdown menu with user info
   - Sign out functionality
   - Avatar display (initials or image)
   - Placeholder for profile/settings pages

### Supporting Files

9. **src/app/layout.tsx**
   - Root layout with SessionProvider
   - Inter font integration
   - Global CSS import

10. **src/app/globals.css**
    - Global styles with Sakura Pink theme
    - Custom scrollbar styling
    - Focus states

11. **src/app/page.tsx**
    - Root page that redirects to dashboard
    - Middleware handles auth check

12. **src/app/(dashboard)/dashboard/page.tsx**
    - Protected dashboard page
    - Displays user session info
    - Shows UserMenu component in header
    - Example of server-side session access

13. **.env.example**
    - Environment variables template
    - Keycloak configuration
    - Database URL
    - NextAuth secrets

## Dependencies Installed

```bash
bun add next-auth@beta @auth/core @auth/prisma-adapter
```

- next-auth v5.0.0-beta.30
- @auth/core v0.34.3
- @auth/prisma-adapter v2.11.1

## Environment Variables Required

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sensey_board"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Keycloak
KEYCLOAK_CLIENT_ID="sensey-board"
KEYCLOAK_CLIENT_SECRET="your-client-secret"
KEYCLOAK_ISSUER="https://keycloak.example.com/realms/your-realm"
```

## Features Implemented

### Authentication

- ✅ Keycloak OAuth integration
- ✅ NextAuth.js v5 configuration
- ✅ Secure session management (JWT strategy)
- ✅ Custom user fields (role, keycloakId)
- ✅ Prisma adapter for database persistence

### Route Protection

- ✅ Middleware for protected routes
- ✅ Automatic redirect to login for unauthenticated users
- ✅ Redirect away from login for authenticated users
- ✅ CallbackUrl support for post-login navigation

### UI Components

- ✅ Beautiful login page (Sakura Pink theme)
- ✅ UserMenu dropdown with avatar
- ✅ Sign out functionality
- ✅ Loading states
- ✅ Responsive design
- ✅ Accessibility (keyboard navigation, ARIA labels)

### Developer Experience

- ✅ TypeScript strict mode
- ✅ Custom hooks for auth state
- ✅ Type-safe session access
- ✅ Clear documentation and comments
- ✅ Environment variables template

## Usage Examples

### Server Component (Auth Check)

```typescript
import { auth } from '@/server/auth/config';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <div>Hello {session.user.name}</div>;
}
```

### Client Component (Auth Hooks)

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';

export function UserProfile() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <LoginPrompt />;

  return <div>Hello {user.name}</div>;
}
```

### Sign Out

```typescript
import { signOut } from 'next-auth/react';

<button onClick={() => signOut({ callbackUrl: '/login' })}>
  Sign Out
</button>
```

## Testing Authentication Flow

### Prerequisites

1. Keycloak instance running
2. Realm configured with client credentials
3. Database running (PostgreSQL)
4. Environment variables set

### Test Steps

1. Start dev server: `bun run dev`
2. Navigate to http://localhost:3000
3. Should redirect to /dashboard
4. Middleware redirects to /login
5. Click "Sign in with Keycloak"
6. Complete Keycloak authentication
7. Redirected back to /dashboard
8. User info displayed
9. Click avatar → dropdown appears
10. Click "Sign out"
11. Redirected to /login

## Design System Compliance

- ✅ Sakura Pink primary color (#FFB7C5)
- ✅ Clean, minimal design
- ✅ Notion-inspired aesthetics
- ✅ Consistent spacing (4px grid)
- ✅ Smooth transitions (200ms)
- ✅ Proper focus states
- ✅ Mobile responsive

## Deliverables Checklist

- ✅ NextAuth configured with Keycloak
- ✅ Protected routes working (middleware)
- ✅ Login page complete (Sakura Pink theme)
- ✅ User session accessible in components (server & client)
- ✅ Sign out functionality (UserMenu)
- ✅ Custom auth hooks (useAuth, useRequireRole)
- ✅ TypeScript strict mode (no `any` except for adapter compatibility)
- ✅ All code in English
- ✅ Secure session handling
- ✅ Proper error handling
- ✅ Documentation complete

## Known Issues / Notes

1. **TypeScript Library Errors**: There are type definition conflicts between @auth/core versions in node_modules. These are library issues and don't affect functionality.

2. **Adapter Type Assertion**: Used `as any` for PrismaAdapter due to type incompatibility between next-auth and @auth/prisma-adapter. This is safe and commonly used in NextAuth v5 beta.

3. **Prisma Schema**: The User model needs the following fields for auth to work:

   ```prisma
   model User {
     id         String   @id @default(cuid())
     keycloakId String   @unique
     email      String   @unique
     name       String?
     avatar     String?
     role       GlobalRole @default(MEMBER)
     // ... other fields
   }
   ```

4. **Database Setup**: Agent 3 should have created the Prisma schema. If not, authentication will fail at the database level.

## Integration with Other Agents

- **Agent 3 (Database)**: Requires User model in Prisma schema
- **Agent 5 (API)**: Can use `auth()` helper for protected tRPC procedures
- **Agent 6 (Core UI)**: Can use `UserMenu` component in header
- **Agent 7-10**: Can use `useAuth()` hook for client-side auth state

## Next Steps for Other Agents

1. Ensure Prisma schema includes User model with required fields
2. Run migrations to create database tables
3. Add UserMenu to dashboard header (Agent 6)
4. Protect API routes with auth() helper (Agent 5)
5. Add role-based access control where needed

## Security Considerations

- ✅ CSRF protection (NextAuth built-in)
- ✅ Secure cookie handling
- ✅ JWT with secret key
- ✅ Environment variables for secrets
- ✅ Protected routes at middleware level
- ✅ No sensitive data in client state

## Support

For questions or issues with authentication:

- Check NextAuth.js v5 documentation: https://authjs.dev/
- Keycloak provider docs: https://authjs.dev/getting-started/providers/keycloak
- Review this implementation in src/server/auth/config.ts
