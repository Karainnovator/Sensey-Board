/**
 * Board Router
 *
 * Handles all board-related operations including:
 * - CRUD operations for boards
 * - Board member management
 * - Board permissions
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

// Input validators
const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100),
  description: z.string().max(500).optional(),
  prefix: z
    .string()
    .min(1)
    .max(5)
    .regex(/^[A-Z]+$/, 'Prefix must be uppercase letters only'),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .default('#FFB7C5'),
  icon: z.string().optional(),
  parentBoardId: z.string().optional(),
});

const updateBoardSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  icon: z.string().optional(),
});

const addMemberSchema = z.object({
  boardId: z.string(),
  userId: z.string(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

const updateMemberRoleSchema = z.object({
  boardId: z.string(),
  userId: z.string(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
});

export const boardRouter = createTRPCRouter({
  /**
   * Get all boards for the current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.board.findMany({
        where: {
          members: {
            some: {
              userId: ctx.user.id,
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              tickets: true,
              sprints: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
    }
  }),

  /**
   * Get a single board by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const board = await ctx.db.board.findFirst({
          where: {
            id: input.id,
            members: {
              some: {
                userId: ctx.user.id,
              },
            },
          },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
            },
            backlog: true,
            sprints: {
              orderBy: {
                number: 'desc',
              },
            },
            _count: {
              select: {
                tickets: true,
              },
            },
          },
        });

        if (!board) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Board not found or you do not have access',
          });
        }

        return board;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Create a new board
   * Creates board, backlog, and owner membership in a transaction
   */
  create: protectedProcedure
    .input(createBoardSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.$transaction(async (tx) => {
          // If creating child board, verify access to parent
          if (input.parentBoardId) {
            const parentAccess = await tx.boardMember.findFirst({
              where: {
                boardId: input.parentBoardId,
                userId: ctx.user.id,
                role: { in: ['OWNER', 'ADMIN', 'MEMBER'] },
              },
            });
            if (!parentAccess) {
              throw new TRPCError({
                code: 'FORBIDDEN',
                message: 'You must be a member of the parent board',
              });
            }
          }

          // Create board
          const board = await tx.board.create({
            data: {
              name: input.name,
              description: input.description,
              prefix: input.prefix,
              color: input.color,
              icon: input.icon,
              parentBoardId: input.parentBoardId,
            },
          });

          // Create backlog for the board
          await tx.backlog.create({
            data: {
              boardId: board.id,
            },
          });

          // Add creator as owner
          await tx.boardMember.create({
            data: {
              boardId: board.id,
              userId: ctx.user.id,
              role: 'OWNER',
            },
          });

          return board;
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'A board with this prefix already exists',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Update an existing board
   */
  update: protectedProcedure
    .input(updateBoardSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;

        // Check permission
        const membership = await ctx.db.boardMember.findUnique({
          where: {
            boardId_userId: {
              boardId: id,
              userId: ctx.user.id,
            },
          },
        });

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this board',
          });
        }

        return await ctx.db.board.update({
          where: { id },
          data,
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

  /**
   * Delete a board
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check permission - only owner can delete
        const membership = await ctx.db.boardMember.findUnique({
          where: {
            boardId_userId: {
              boardId: input.id,
              userId: ctx.user.id,
            },
          },
        });

        if (!membership || membership.role !== 'OWNER') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only board owners can delete boards',
          });
        }

        // Delete board (cascade will handle members, tickets, etc.)
        await ctx.db.board.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

  /**
   * Add a member to a board
   */
  addMember: protectedProcedure
    .input(addMemberSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check permission - only owner/admin can add members
        const membership = await ctx.db.boardMember.findUnique({
          where: {
            boardId_userId: {
              boardId: input.boardId,
              userId: ctx.user.id,
            },
          },
        });

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to add members',
          });
        }

        // Check if user exists
        const userExists = await ctx.db.user.findUnique({
          where: { id: input.userId },
        });

        if (!userExists) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Add member
        const newMember = await ctx.db.boardMember.create({
          data: {
            boardId: input.boardId,
            userId: input.userId,
            role: input.role,
          },
        });

        return newMember;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'User is already a member of this board',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Remove a member from a board
   */
  removeMember: protectedProcedure
    .input(z.object({ boardId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check permission - only owner/admin can remove members
        const membership = await ctx.db.boardMember.findUnique({
          where: {
            boardId_userId: {
              boardId: input.boardId,
              userId: ctx.user.id,
            },
          },
        });

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to remove members',
          });
        }

        // Cannot remove the owner
        const targetMember = await ctx.db.boardMember.findUnique({
          where: {
            boardId_userId: {
              boardId: input.boardId,
              userId: input.userId,
            },
          },
        });

        if (targetMember?.role === 'OWNER') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot remove the board owner',
          });
        }

        // Remove member
        await ctx.db.boardMember.delete({
          where: {
            boardId_userId: {
              boardId: input.boardId,
              userId: input.userId,
            },
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Member not found',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Update a member's role
   */
  updateMemberRole: protectedProcedure
    .input(updateMemberRoleSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check permission - only owner can update roles
        const membership = await ctx.db.boardMember.findUnique({
          where: {
            boardId_userId: {
              boardId: input.boardId,
              userId: ctx.user.id,
            },
          },
        });

        if (!membership || membership.role !== 'OWNER') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only board owners can update member roles',
          });
        }

        // Cannot change owner role
        const targetMember = await ctx.db.boardMember.findUnique({
          where: {
            boardId_userId: {
              boardId: input.boardId,
              userId: input.userId,
            },
          },
        });

        if (targetMember?.role === 'OWNER' || input.role === 'OWNER') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot change owner role',
          });
        }

        // Update role
        const updatedMember = await ctx.db.boardMember.update({
          where: {
            boardId_userId: {
              boardId: input.boardId,
              userId: input.userId,
            },
          },
          data: {
            role: input.role,
          },
        });

        return updatedMember;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Member not found',
            });
          }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Get child boards
   */
  getChildren: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.board.findMany({
          where: { parentBoardId: input.boardId },
          include: {
            _count: {
              select: {
                tickets: true,
                sprints: true,
              },
            },
            members: {
              take: 3,
              include: {
                user: {
                  select: { id: true, name: true, avatar: true },
                },
              },
            },
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Get board hierarchy (parent + children)
   */
  getHierarchy: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const board = await ctx.db.board.findUnique({
          where: { id: input.boardId },
          include: {
            parentBoard: {
              select: {
                id: true,
                name: true,
                prefix: true,
                color: true,
              },
            },
            childBoards: {
              select: {
                id: true,
                name: true,
                prefix: true,
                color: true,
                _count: {
                  select: { tickets: true },
                },
              },
            },
          },
        });

        if (!board) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Board not found',
          });
        }

        return board;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),

  /**
   * Get all ancestor boards (breadcrumb)
   */
  getAncestors: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const ancestors: Array<{
          id: string;
          name: string;
          prefix: string;
          color: string;
        }> = [];
        let currentId: string | null = input.boardId;

        while (currentId) {
          const currentBoard: {
            id: string;
            name: string;
            prefix: string;
            color: string;
            parentBoardId: string | null;
          } | null = await ctx.db.board.findUnique({
            where: { id: currentId },
            select: {
              id: true,
              name: true,
              prefix: true,
              color: true,
              parentBoardId: true,
            },
          });

          if (!currentBoard) break;
          if (currentBoard.id !== input.boardId) {
            ancestors.unshift({
              id: currentBoard.id,
              name: currentBoard.name,
              prefix: currentBoard.prefix,
              color: currentBoard.color,
            });
          }
          currentId = currentBoard.parentBoardId;
        }

        return ancestors;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
      }
    }),
});
