/**
 * Standardized error handling utilities
 */

import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: unknown): never {
  if (error instanceof TRPCError) {
    throw error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A record with this value already exists',
        });
      case 'P2025':
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Record not found',
        });
      case 'P2003':
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Foreign key constraint failed',
        });
      case 'P2014':
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Relation violation',
        });
      default:
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Database error: ${error.code}`,
          cause: error,
        });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid data provided',
      cause: error,
    });
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    cause: error,
  });
}

export function assertBoardAccess(
  membership: { role: string } | null,
  requiredRole?: 'OWNER' | 'ADMIN' | 'MEMBER'
): void {
  if (!membership) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this board',
    });
  }

  if (requiredRole) {
    const roleHierarchy = ['VIEWER', 'MEMBER', 'ADMIN', 'OWNER'];
    const userRoleIndex = roleHierarchy.indexOf(membership.role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    if (userRoleIndex < requiredRoleIndex) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `This action requires ${requiredRole} role or higher`,
      });
    }
  }
}
