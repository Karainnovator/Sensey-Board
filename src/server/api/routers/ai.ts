/**
 * AI Router - tRPC endpoints for AI-powered features
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { analyzeTicketRequest, isAIAvailable } from '@/server/services/ai';

const ticketSuggestionSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(['ISSUE', 'FIX', 'HOTFIX', 'PROBLEM']),
  priority: z.enum(['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST']),
  storyPoints: z.number().min(0).max(100),
});

export const aiRouter = createTRPCRouter({
  /**
   * Check if AI features are available
   */
  isAvailable: protectedProcedure.query(() => {
    return { available: isAIAvailable() };
  }),

  /**
   * Analyze user input and suggest tickets
   */
  analyzeTicket: protectedProcedure
    .input(
      z.object({
        userInput: z.string().min(3).max(5000),
        boardId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get board context
      const board = await ctx.db.board.findUnique({
        where: { id: input.boardId },
        select: { name: true, description: true },
      });

      if (!board) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board not found',
        });
      }

      try {
        const result = await analyzeTicketRequest(input.userInput, board);
        return result;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('not configured')
        ) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: error.message,
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze ticket request',
          cause: error,
        });
      }
    }),

  /**
   * Create tickets from AI suggestions
   */
  createFromSuggestions: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        suggestions: z.array(ticketSuggestionSchema),
        addToBacklog: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get board and backlog
      const board = await ctx.db.board.findUnique({
        where: { id: input.boardId },
        include: { backlog: true },
      });

      if (!board) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board not found',
        });
      }

      // Create tickets in transaction
      const tickets = await ctx.db.$transaction(async (tx) => {
        const created = [];

        for (const suggestion of input.suggestions) {
          // Increment counter
          const updatedBoard = await tx.board.update({
            where: { id: input.boardId },
            data: { ticketCounter: { increment: 1 } },
            select: { ticketCounter: true, prefix: true },
          });

          const key = `${updatedBoard.prefix}-${updatedBoard.ticketCounter}`;

          const ticket = await tx.ticket.create({
            data: {
              key,
              title: suggestion.title,
              description: suggestion.description,
              type: suggestion.type,
              priority: suggestion.priority,
              storyPoints: suggestion.storyPoints,
              status: 'TODO',
              boardId: input.boardId,
              backlogId: input.addToBacklog ? board.backlog?.id : null,
              creatorId: ctx.user.id,
              order: Date.now(),
            },
          });

          created.push(ticket);
        }

        return created;
      });

      return { created: tickets.length, tickets };
    }),
});
