/**
 * Ticket Router - Handles all ticket operations including hierarchy
 */

import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  verifyBoardMembership,
} from '../trpc';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

const createTicketSchema = z.object({
  boardId: z.string(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  type: z.enum(['ISSUE', 'FIX', 'HOTFIX', 'PROBLEM']).default('ISSUE'),
  priority: z
    .enum(['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST'])
    .default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).default('TODO'),
  assigneeId: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  reviewerIds: z.array(z.string()).optional(),
  sprintId: z.string().optional(),
  backlogId: z.string().optional(),
  parentId: z.string().optional(),
  storyPoints: z.number().int().min(0).max(100).optional(),
});

const updateTicketSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  type: z.enum(['ISSUE', 'FIX', 'HOTFIX', 'PROBLEM']).optional(),
  priority: z.enum(['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  assigneeId: z.string().nullable().optional(),
  assigneeIds: z.array(z.string()).optional(),
  reviewerId: z.string().nullable().optional(),
  reviewerIds: z.array(z.string()).optional(),
  storyPoints: z.number().int().min(0).max(100).nullable().optional(),
  percentage: z.number().int().min(0).max(100).optional(),
  weight: z.number().int().min(1).max(100).optional(),
  missionRank: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(), // For linking/unlinking as sub-ticket
});

const moveTicketSchema = z.object({
  ticketId: z.string(),
  sprintId: z.string().nullable().optional(),
  backlogId: z.string().nullable().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
});

const createSubTicketSchema = z.object({
  parentId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['ISSUE', 'FIX', 'HOTFIX', 'PROBLEM']).default('ISSUE'),
  priority: z
    .enum(['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST'])
    .default('MEDIUM'),
  assigneeId: z.string().optional(),
});

export const ticketRouter = createTRPCRouter({
  getByBacklog: protectedProcedure
    .input(z.object({ backlogId: z.string() }))
    .query(async ({ ctx, input }) => {
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

        return await ctx.db.ticket.findMany({
          where: { backlogId: input.backlogId },
          include: {
            assignee: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            creator: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            reviewer: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            assignees: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
            },
            reviewers: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
            },
            project: {
              select: { id: true, name: true, color: true },
            },
            subTickets: true,
            labels: true,
            _count: { select: { comments: true, subTickets: true } },
          },
          orderBy: { order: 'asc' },
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  getBySprint: protectedProcedure
    .input(z.object({ sprintId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Get sprint to verify board membership
        const sprint = await ctx.db.sprint.findUnique({
          where: { id: input.sprintId },
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

        return await ctx.db.ticket.findMany({
          where: { sprintId: input.sprintId },
          include: {
            assignee: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            creator: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            reviewer: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            assignees: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
            },
            reviewers: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
            },
            project: {
              select: { id: true, name: true, color: true },
            },
            subTickets: true,
            labels: true,
            _count: { select: { comments: true, subTickets: true } },
          },
          orderBy: { order: 'asc' },
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Get ticket first to verify board membership
        const ticketCheck = await ctx.db.ticket.findUnique({
          where: { id: input.id },
          select: { boardId: true },
        });

        if (!ticketCheck) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Ticket not found',
          });
        }

        // Verify board membership
        await verifyBoardMembership(ctx.db, ticketCheck.boardId, ctx.user.id);

        // Get full ticket data
        const ticket = await ctx.db.ticket.findUnique({
          where: { id: input.id },
          include: {
            assignee: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            creator: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            reviewer: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            assignees: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
            },
            reviewers: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
            },
            project: {
              select: { id: true, name: true, color: true },
            },
            parent: true,
            subTickets: {
              include: {
                assignee: { select: { id: true, name: true, avatar: true } },
              },
            },
            comments: {
              include: {
                user: { select: { id: true, name: true, avatar: true } },
              },
              orderBy: { createdAt: 'desc' },
            },
            labels: true,
          },
        });

        if (!ticket) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Ticket not found',
          });
        }

        return ticket;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  create: protectedProcedure
    .input(createTicketSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify board membership before creating ticket
        await verifyBoardMembership(ctx.db, input.boardId, ctx.user.id);

        return await ctx.db.$transaction(async (tx) => {
          const board = await tx.board.update({
            where: { id: input.boardId },
            data: { ticketCounter: { increment: 1 } },
            select: { ticketCounter: true, prefix: true },
          });
          const key = `${board.prefix}-${board.ticketCounter}`;

          // Create ticket
          const ticket = await tx.ticket.create({
            data: {
              boardId: input.boardId,
              title: input.title,
              description: input.description,
              type: input.type,
              priority: input.priority,
              status: input.status,
              assigneeId: input.assigneeId,
              sprintId: input.sprintId,
              backlogId: input.backlogId,
              parentId: input.parentId,
              storyPoints: input.storyPoints,
              key,
              creatorId: ctx.user.id,
              order: Date.now(),
            },
          });

          // Create assignee relations if provided
          if (input.assigneeIds && input.assigneeIds.length > 0) {
            await tx.ticketAssignee.createMany({
              data: input.assigneeIds.map((userId) => ({
                ticketId: ticket.id,
                userId,
              })),
            });
          }

          // Create reviewer relations if provided
          if (input.reviewerIds && input.reviewerIds.length > 0) {
            await tx.ticketReviewer.createMany({
              data: input.reviewerIds.map((userId) => ({
                ticketId: ticket.id,
                userId,
              })),
            });
          }

          // Fetch and return complete ticket with relations
          return await tx.ticket.findUnique({
            where: { id: ticket.id },
            include: {
              assignee: {
                select: { id: true, name: true, email: true, avatar: true },
              },
              creator: {
                select: { id: true, name: true, email: true, avatar: true },
              },
              reviewer: {
                select: { id: true, name: true, email: true, avatar: true },
              },
              assignees: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                },
              },
              reviewers: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                },
              },
              project: {
                select: { id: true, name: true, color: true },
              },
            },
          });
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Ticket key already exists',
            });
          }
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Board not found',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  update: protectedProcedure
    .input(updateTicketSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, assigneeIds, reviewerIds, ...data } = input;

        // Get ticket to verify board membership
        const ticket = await ctx.db.ticket.findUnique({
          where: { id },
          select: { boardId: true },
        });

        if (!ticket) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Ticket not found',
          });
        }

        // Verify board membership
        await verifyBoardMembership(ctx.db, ticket.boardId, ctx.user.id);

        return await ctx.db.$transaction(async (tx) => {
          // Update ticket
          await tx.ticket.update({
            where: { id },
            data,
          });

          // Sync assignees if provided
          if (assigneeIds !== undefined) {
            // Delete existing assignee relations
            await tx.ticketAssignee.deleteMany({
              where: { ticketId: id },
            });

            // Create new assignee relations
            if (assigneeIds.length > 0) {
              await tx.ticketAssignee.createMany({
                data: assigneeIds.map((userId) => ({
                  ticketId: id,
                  userId,
                })),
              });
            }
          }

          // Sync reviewers if provided
          if (reviewerIds !== undefined) {
            // Delete existing reviewer relations
            await tx.ticketReviewer.deleteMany({
              where: { ticketId: id },
            });

            // Create new reviewer relations
            if (reviewerIds.length > 0) {
              await tx.ticketReviewer.createMany({
                data: reviewerIds.map((userId) => ({
                  ticketId: id,
                  userId,
                })),
              });
            }
          }

          // Fetch and return complete ticket with relations
          return await tx.ticket.findUnique({
            where: { id },
            include: {
              assignee: {
                select: { id: true, name: true, email: true, avatar: true },
              },
              creator: {
                select: { id: true, name: true, email: true, avatar: true },
              },
              reviewer: {
                select: { id: true, name: true, email: true, avatar: true },
              },
              assignees: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                },
              },
              reviewers: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                },
              },
              project: {
                select: { id: true, name: true, color: true },
              },
            },
          });
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Ticket not found',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  move: protectedProcedure
    .input(moveTicketSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { ticketId, sprintId, backlogId, status } = input;

        // Get ticket to verify board membership
        const ticket = await ctx.db.ticket.findUnique({
          where: { id: ticketId },
          select: { boardId: true },
        });

        if (!ticket) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Ticket not found',
          });
        }

        // Verify board membership
        await verifyBoardMembership(ctx.db, ticket.boardId, ctx.user.id);

        // Build update data dynamically to handle undefined vs null
        const updateData: {
          sprintId?: string | null;
          backlogId?: string | null;
          status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
        } = {};

        if (sprintId !== undefined) {
          updateData.sprintId = sprintId;
        }
        if (backlogId !== undefined) {
          updateData.backlogId = backlogId;
        }
        if (status !== undefined) {
          updateData.status = status;
        }

        await ctx.db.ticket.update({
          where: { id: ticketId },
          data: updateData,
        });
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Ticket not found',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  updateOrder: protectedProcedure
    .input(z.object({ ticketId: z.string(), order: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get ticket to verify board membership
        const ticket = await ctx.db.ticket.findUnique({
          where: { id: input.ticketId },
          select: { boardId: true },
        });

        if (!ticket) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Ticket not found',
          });
        }

        // Verify board membership
        await verifyBoardMembership(ctx.db, ticket.boardId, ctx.user.id);

        await ctx.db.ticket.update({
          where: { id: input.ticketId },
          data: { order: input.order },
        });
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Ticket not found',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get ticket to verify board membership
        const ticket = await ctx.db.ticket.findUnique({
          where: { id: input.id },
          select: { boardId: true },
        });

        if (!ticket) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Ticket not found',
          });
        }

        // Verify board membership
        await verifyBoardMembership(ctx.db, ticket.boardId, ctx.user.id);

        await ctx.db.ticket.delete({ where: { id: input.id } });
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Ticket not found',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  createSubTicket: protectedProcedure
    .input(createSubTicketSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.$transaction(async (tx) => {
          const parentTicket = await tx.ticket.findUnique({
            where: { id: input.parentId },
            select: { boardId: true, sprintId: true, backlogId: true },
          });
          if (!parentTicket) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Parent ticket not found',
            });
          }

          // Verify board membership (using ctx.db instead of tx for the helper)
          await verifyBoardMembership(
            ctx.db,
            parentTicket.boardId,
            ctx.user.id
          );

          const board = await tx.board.update({
            where: { id: parentTicket.boardId },
            data: { ticketCounter: { increment: 1 } },
            select: { ticketCounter: true, prefix: true },
          });
          const key = `${board.prefix}-${board.ticketCounter}`;
          return await tx.ticket.create({
            data: {
              boardId: parentTicket.boardId,
              parentId: input.parentId,
              sprintId: parentTicket.sprintId,
              backlogId: parentTicket.backlogId,
              title: input.title,
              description: input.description,
              type: input.type,
              priority: input.priority,
              status: 'TODO',
              assigneeId: input.assigneeId,
              key,
              creatorId: ctx.user.id,
              order: Date.now(),
            },
            include: {
              assignee: {
                select: { id: true, name: true, email: true, avatar: true },
              },
              creator: {
                select: { id: true, name: true, email: true, avatar: true },
              },
              reviewer: {
                select: { id: true, name: true, email: true, avatar: true },
              },
              assignees: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                },
              },
              reviewers: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                },
              },
              project: {
                select: { id: true, name: true, color: true },
              },
            },
          });
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Ticket key already exists',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Get tickets with optional child board inclusion
   */
  getWithHierarchy: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        includeChildBoards: z.boolean().default(false),
        sprintId: z.string().optional(),
        backlogId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Verify board membership for the primary board
        await verifyBoardMembership(ctx.db, input.boardId, ctx.user.id);

        const boardIds = [input.boardId];

        if (input.includeChildBoards) {
          const childBoards = await ctx.db.board.findMany({
            where: { parentBoardId: input.boardId },
            select: { id: true },
          });
          boardIds.push(...childBoards.map((b) => b.id));
        }

        // Build where clause for tickets
        // When includeChildBoards is true, we need to handle backlog/sprint filtering differently
        // because child boards have their own backlogId/sprintId
        const whereClause: Record<string, unknown> = {
          boardId: { in: boardIds },
        };

        if (input.sprintId) {
          // For sprint view: get all tickets with no sprint assigned when viewing child boards
          // This lets us see backlog items from child boards in a combined view
          if (input.includeChildBoards) {
            // Get sprints from all boards that have the same sprint number/period
            // For now, just filter by boardId since sprints are board-specific
            whereClause.sprintId = input.sprintId;
          } else {
            whereClause.sprintId = input.sprintId;
          }
        } else if (input.backlogId) {
          // For backlog view with child boards: get tickets that are in ANY backlog (not in a sprint)
          if (input.includeChildBoards) {
            whereClause.backlogId = { not: null };
            whereClause.sprintId = null;
          } else {
            whereClause.backlogId = input.backlogId;
          }
        }

        return await ctx.db.ticket.findMany({
          where: whereClause,
          include: {
            assignee: {
              select: { id: true, name: true, avatar: true },
            },
            reviewer: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            assignees: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
            },
            reviewers: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
            },
            project: {
              select: { id: true, name: true, color: true },
            },
            board: {
              select: { id: true, name: true, prefix: true, color: true },
            },
            _count: {
              select: { subTickets: true, comments: true },
            },
          },
          orderBy: { order: 'asc' },
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),
});
