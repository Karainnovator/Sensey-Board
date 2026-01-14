/**
 * Invitation Router
 * Handles guest user invitations and board access
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const inviteGuestSchema = z.object({
  boardId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['VIEWER', 'MEMBER']),
});

export const invitationRouter = createTRPCRouter({
  /**
   * Invite a guest to a board
   * Only OWNER and ADMIN can invite
   */
  inviteGuest: protectedProcedure
    .input(inviteGuestSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to invite
      const membership = await ctx.db.boardMember.findFirst({
        where: {
          boardId: input.boardId,
          userId: ctx.user.id,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only board owners and admins can invite guests',
        });
      }

      // Find or create user by email
      let user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        // Create new guest user
        user = await ctx.db.user.create({
          data: {
            email: input.email,
            name: input.email.split('@')[0],
            role: 'GUEST',
            externalId: `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          },
        });
      }

      // Check if already a member
      const existingMember = await ctx.db.boardMember.findFirst({
        where: {
          boardId: input.boardId,
          userId: user.id,
        },
      });

      if (existingMember) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already a member of this board',
        });
      }

      // Add as board member
      const newMember = await ctx.db.boardMember.create({
        data: {
          boardId: input.boardId,
          userId: user.id,
          role: input.role,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
        },
      });

      return newMember;
    }),

  /**
   * Get all guests for a board
   */
  getBoardGuests: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify user has access to board
      const membership = await ctx.db.boardMember.findFirst({
        where: {
          boardId: input.boardId,
          userId: ctx.user.id,
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this board',
        });
      }

      // Get all members
      const members = await ctx.db.boardMember.findMany({
        where: { boardId: input.boardId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return members;
    }),

  /**
   * Remove a guest from a board
   */
  removeGuest: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission
      const membership = await ctx.db.boardMember.findFirst({
        where: {
          boardId: input.boardId,
          userId: ctx.user.id,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only board owners and admins can remove members',
        });
      }

      // Cannot remove owner
      const targetMembership = await ctx.db.boardMember.findFirst({
        where: {
          boardId: input.boardId,
          userId: input.userId,
        },
      });

      if (targetMembership?.role === 'OWNER') {
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
    }),

  /**
   * Update guest role
   */
  updateGuestRole: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        userId: z.string(),
        role: z.enum(['VIEWER', 'MEMBER', 'ADMIN']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner
      const membership = await ctx.db.boardMember.findFirst({
        where: {
          boardId: input.boardId,
          userId: ctx.user.id,
          role: 'OWNER',
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only board owners can change roles',
        });
      }

      // Cannot change owner role
      const targetMembership = await ctx.db.boardMember.findFirst({
        where: {
          boardId: input.boardId,
          userId: input.userId,
        },
      });

      if (targetMembership?.role === 'OWNER') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot change the owner role',
        });
      }

      // Update role
      const updated = await ctx.db.boardMember.update({
        where: {
          boardId_userId: {
            boardId: input.boardId,
            userId: input.userId,
          },
        },
        data: { role: input.role },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      return updated;
    }),
});
