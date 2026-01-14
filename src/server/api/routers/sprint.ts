/**
 * Sprint Router
 *
 * Handles all sprint-related operations including:
 * - CRUD operations for sprints
 * - Auto-migration of unfinished tickets to new sprint (R6)
 * - Sprint completion
 */

import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  verifyBoardMembership,
} from '../trpc';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

// Input validators
const createSprintSchema = z
  .object({
    boardId: z.string(),
    name: z.string().min(1, 'Sprint name is required').max(100),
    goal: z.string().max(500).optional(),
    startDate: z.date(),
    endDate: z.date(),
    autoStart: z.boolean().default(true), // Auto-start sprint by default
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

const updateSprintSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  goal: z.string().max(500).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

const completeSprintSchema = z.object({
  id: z.string(),
  moveUnfinishedToBacklog: z.boolean().default(false),
});

export const sprintRouter = createTRPCRouter({
  /**
   * Get all sprints for a board
   */
  getAll: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.sprint.findMany({
          where: { boardId: input.boardId },
          include: {
            _count: {
              select: { tickets: true },
            },
          },
          orderBy: { number: 'desc' },
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Get the current active sprint for a board
   */
  getCurrent: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const sprint = await ctx.db.sprint.findFirst({
          where: {
            boardId: input.boardId,
            status: 'ACTIVE',
          },
          include: {
            tickets: {
              where: { parentId: null }, // Only get top-level tickets
              include: {
                assignee: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
                creator: {
                  select: { id: true, name: true, email: true, avatar: true },
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
                _count: { select: { comments: true, subTickets: true } },
              },
              orderBy: { order: 'asc' },
            },
            _count: { select: { tickets: true } },
          },
        });
        return sprint;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Get a single sprint by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const sprint = await ctx.db.sprint.findUnique({
          where: { id: input.id },
          include: {
            tickets: {
              where: { parentId: null }, // Only get top-level tickets
              include: {
                assignee: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
                creator: {
                  select: { id: true, name: true, email: true, avatar: true },
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
                _count: { select: { comments: true, subTickets: true } },
              },
              orderBy: { order: 'asc' },
            },
            _count: { select: { tickets: true } },
          },
        });
        if (!sprint) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Sprint not found',
          });
        }
        return sprint;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Create a new sprint
   * CRITICAL: Implements auto-migration of unfinished tickets (R6)
   */
  create: protectedProcedure
    .input(createSprintSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify board membership before creating sprint
        await verifyBoardMembership(ctx.db, input.boardId, ctx.user.id);

        return await ctx.db.$transaction(async (tx) => {
          // Get next sprint number
          const lastSprint = await tx.sprint.findFirst({
            where: { boardId: input.boardId },
            orderBy: { number: 'desc' },
          });
          const nextNumber = (lastSprint?.number ?? 0) + 1;

          // Get previous active sprint and its incomplete tickets
          const previousActive = await tx.sprint.findFirst({
            where: { boardId: input.boardId, status: 'ACTIVE' },
            include: {
              tickets: { where: { status: { not: 'DONE' } } },
            },
          });

          // Mark previous sprint as completed if exists
          if (previousActive) {
            await tx.sprint.update({
              where: { id: previousActive.id },
              data: { status: 'COMPLETED' },
            });
          }

          // Create new sprint
          const newSprint = await tx.sprint.create({
            data: {
              boardId: input.boardId,
              number: nextNumber,
              name: input.name,
              goal: input.goal,
              startDate: input.startDate,
              endDate: input.endDate,
              status: input.autoStart ? 'ACTIVE' : 'PLANNED',
            },
          });

          // Auto-migrate incomplete tickets (R6)
          if (previousActive && previousActive.tickets.length > 0) {
            await tx.ticket.updateMany({
              where: { id: { in: previousActive.tickets.map((t) => t.id) } },
              data: { sprintId: newSprint.id },
            });
          }

          return newSprint;
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Sprint with this number already exists',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Update an existing sprint
   */
  update: protectedProcedure
    .input(updateSprintSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;

        // Get sprint to verify board membership
        const sprint = await ctx.db.sprint.findUnique({
          where: { id },
          select: { boardId: true },
        });

        if (!sprint) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Sprint not found',
          });
        }

        // Verify board membership
        await verifyBoardMembership(ctx.db, sprint.boardId, ctx.user.id);

        return await ctx.db.sprint.update({
          where: { id },
          data,
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Sprint not found',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Start a planned sprint
   */
  start: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.$transaction(async (tx) => {
          const sprint = await tx.sprint.findUnique({
            where: { id: input.id },
            select: { boardId: true, status: true },
          });

          if (!sprint) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Sprint not found',
            });
          }

          // Verify board membership (using ctx.db instead of tx)
          await verifyBoardMembership(ctx.db, sprint.boardId, ctx.user.id);

          if (sprint.status !== 'PLANNED') {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Only planned sprints can be started',
            });
          }

          // Check if there's already an active sprint
          const activeSprint = await tx.sprint.findFirst({
            where: {
              boardId: sprint.boardId,
              status: 'ACTIVE',
            },
          });

          if (activeSprint) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Another sprint is already active',
            });
          }

          // Start the sprint
          return await tx.sprint.update({
            where: { id: input.id },
            data: { status: 'ACTIVE' },
          });
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Complete a sprint
   */
  complete: protectedProcedure
    .input(completeSprintSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.$transaction(async (tx) => {
          const sprint = await tx.sprint.findUnique({
            where: { id: input.id },
            include: {
              board: { select: { id: true } },
              tickets: { where: { status: { not: 'DONE' } } },
            },
          });

          if (!sprint) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Sprint not found',
            });
          }

          // Verify board membership (using ctx.db instead of tx)
          await verifyBoardMembership(ctx.db, sprint.board.id, ctx.user.id);

          // Mark sprint as completed
          await tx.sprint.update({
            where: { id: input.id },
            data: { status: 'COMPLETED' },
          });

          // Move unfinished tickets to backlog if requested
          if (input.moveUnfinishedToBacklog && sprint.tickets.length > 0) {
            const backlog = await tx.backlog.findUnique({
              where: { boardId: sprint.board.id },
            });

            if (backlog) {
              await tx.ticket.updateMany({
                where: { id: { in: sprint.tickets.map((t) => t.id) } },
                data: { sprintId: null, backlogId: backlog.id },
              });
            }
          }

          return { success: true };
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Delete a sprint
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get sprint to verify board membership
        const sprint = await ctx.db.sprint.findUnique({
          where: { id: input.id },
          select: { boardId: true },
        });

        if (!sprint) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Sprint not found',
          });
        }

        // Verify board membership
        await verifyBoardMembership(ctx.db, sprint.boardId, ctx.user.id);

        await ctx.db.sprint.delete({ where: { id: input.id } });
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Sprint not found',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),
});
