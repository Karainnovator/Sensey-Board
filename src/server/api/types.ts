/**
 * tRPC Type Exports
 *
 * This file exports types only - safe to import in client components.
 * The actual router implementation is in root.ts (server-only).
 */

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { appRouter } from './root';

/**
 * The shape of our router - used for client-side type inference
 */
export type AppRouter = typeof appRouter;

/**
 * Inference helpers for input and output types
 */
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
