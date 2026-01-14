import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  verifyBoardMembership,
} from '../trpc';
import { TRPCError } from '@trpc/server';

export const projectRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyBoardMembership(ctx.db, input.boardId, ctx.user.id);

      return ctx.db.project.findMany({
        where: { boardId: input.boardId },
        include: {
          _count: { select: { tickets: true } },
        },
        orderBy: { name: 'asc' },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string().min(1).max(100),
        color: z.string().default('#FFB7C5'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await verifyBoardMembership(ctx.db, input.boardId, ctx.user.id);

      return ctx.db.project.create({
        data: {
          boardId: input.boardId,
          name: input.name,
          color: input.color,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        select: { boardId: true },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      await verifyBoardMembership(ctx.db, project.boardId, ctx.user.id);

      return ctx.db.project.update({
        where: { id: input.id },
        data: {
          name: input.name,
          color: input.color,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        select: { boardId: true },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      await verifyBoardMembership(ctx.db, project.boardId, ctx.user.id);

      return ctx.db.project.delete({ where: { id: input.id } });
    }),
});
