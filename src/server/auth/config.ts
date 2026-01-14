import { PrismaAdapter } from '@auth/prisma-adapter';
import type {
  NextAuthOptions,
  User as NextAuthUser,
  Account,
  Session,
} from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { AdapterUser } from 'next-auth/adapters';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/server/db';

/**
 * Module augmentation for `next-auth` types.
 * Extends the built-in session and JWT types with our custom fields.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      externalId: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
    externalId: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    externalId?: string;
  }
}

/**
 * NextAuth.js v4 configuration with Azure AD provider
 *
 * Environment variables required:
 * - AZURE_AD_CLIENT_ID
 * - AZURE_AD_CLIENT_SECRET
 * - AZURE_AD_TENANT_ID
 * - NEXTAUTH_SECRET
 * - NEXTAUTH_URL (e.g., http://localhost:3000)
 */
// Only use adapter in production with real database
const useAdapter =
  process.env.NODE_ENV === 'production' || process.env.USE_DATABASE === 'true';

export const authOptions: NextAuthOptions = {
  providers: [
    // Development fallback - only works in dev mode
    CredentialsProvider({
      id: 'credentials',
      name: 'Development Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV === 'development') {
          if (
            credentials?.email === 'demo@sensey.dev' &&
            credentials?.password === 'demo123'
          ) {
            return {
              id: 'dev-user-1',
              email: 'demo@sensey.dev',
              name: 'Demo User',
              role: 'ADMIN',
              externalId: 'dev-external-id',
            };
          }
        }
        return null;
      },
    }),
    // Production: Azure AD
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? '',
      tenantId: process.env.AZURE_AD_TENANT_ID ?? 'common',
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
    }),
  ],
  // Only use database adapter in production
  ...(useAdapter && {
    adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  }),
  callbacks: {
    /**
     * JWT callback - adds custom fields to the token
     */
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: NextAuthUser | AdapterUser;
      account?: Account | null;
    }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as NextAuthUser).role ?? 'MEMBER';
        token.externalId = (user as NextAuthUser).externalId ?? '';
      }

      // Save external ID (Azure AD) on first authentication
      if (account?.providerAccountId && user) {
        // External ID is already set during user creation by the adapter
        token.externalId = account.providerAccountId;
      }

      return token;
    },

    /**
     * Session callback - adds custom fields to the session
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id ?? '';
        session.user.role = token.role ?? 'MEMBER';
        session.user.externalId = token.externalId ?? '';
      }
      return session;
    },
  },
  pages: {
    signIn: '/en/login',
    error: '/en/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
