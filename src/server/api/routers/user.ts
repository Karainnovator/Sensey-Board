/**
 * User Router - User operations and search
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const userRouter = createTRPCRouter({
  getMe: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
    }
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
    }
  }),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1, 'Search query is required'),
        limit: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.user.findMany({
          where: {
            OR: [
              { name: { contains: input.query } },
              { email: { contains: input.query } },
            ],
          },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
          },
          take: input.limit,
          orderBy: {
            name: 'asc',
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),
});
