/**
 * Backlog Router - Each board has exactly ONE backlog
 */

import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  verifyBoardMembership,
} from '../trpc';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

export const backlogRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify board membership before fetching backlog
        await verifyBoardMembership(ctx.db, input.boardId, ctx.user.id);

        const backlog = await ctx.db.backlog.findUnique({
          where: { boardId: input.boardId },
          include: {
            tickets: {
              where: { parentId: null }, // Only get top-level tickets
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
                creator: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
                labels: true,
                subTickets: {
                  include: {
                    assignee: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                      },
                    },
                  },
                  orderBy: { order: 'asc' },
                },
                _count: {
                  select: {
                    comments: true,
                    subTickets: true,
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
            _count: {
              select: {
                tickets: true,
              },
            },
          },
        });

        if (!backlog) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Backlog not found for this board',
          });
        }

        return backlog;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  addTicket: protectedProcedure
    .input(z.object({ ticketId: z.string(), backlogId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get backlog to verify board membership
        const backlog = await ctx.db.backlog.findUnique({
          where: { id: input.backlogId },
          select: { boardId: true },
        });

        if (!backlog) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Backlog not found',
          });
        }

        // Verify board membership
        await verifyBoardMembership(ctx.db, backlog.boardId, ctx.user.id);

        await ctx.db.ticket.update({
          where: { id: input.ticketId },
          data: {
            backlogId: input.backlogId,
            sprintId: null,
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Ticket or backlog not found',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),
});
