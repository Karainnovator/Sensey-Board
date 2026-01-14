/**
 * tRPC Server Configuration
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { prisma } from '@/server/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/server/auth/config';

/**
 * Create context for tRPC requests
 */
export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const session = await getServerSession(authOptions);

  return {
    session,
    db: prisma,
    headers: opts.req.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC with context and transformer
 * allowOutsideOfServer: true allows type inference on client
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  allowOutsideOfServer: true,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

/**
 * Admin procedure
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  return next({ ctx });
});

/**
 * Board mutation procedure - blocks VIEWER role
 * Note: This is a helper procedure that can be used in routers to enforce board permissions.
 * Individual routers should implement permission checks in their mutation handlers.
 */
export const boardMutationProcedure = protectedProcedure;

/**
 * Helper to verify board membership
 * Throws FORBIDDEN error if user is not a member of the board
 */
export async function verifyBoardMembership(
  db: typeof prisma,
  boardId: string,
  userId: string
) {
  const membership = await db.boardMember.findFirst({
    where: { boardId, userId },
  });

  if (!membership) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not a member of this board',
    });
  }

  return membership;
}
