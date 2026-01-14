/**
 * Root tRPC Router
 *
 * This is the primary router for the tRPC server.
 * All routers should be manually added here.
 */

import { createCallerFactory, createTRPCRouter } from './trpc';
import { boardRouter } from './routers/board';
import { sprintRouter } from './routers/sprint';
import { ticketRouter } from './routers/ticket';
import { backlogRouter } from './routers/backlog';
import { userRouter } from './routers/user';
import { invitationRouter } from './routers/invitation';
import { aiRouter } from './routers/ai';
import { projectRouter } from './routers/project';

/**
 * This is the main router for the application
 * It contains all sub-routers
 */
export const appRouter = createTRPCRouter({
  board: boardRouter,
  sprint: sprintRouter,
  ticket: ticketRouter,
  backlog: backlogRouter,
  user: userRouter,
  invitation: invitationRouter,
  ai: aiRouter,
  project: projectRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCaller = createCallerFactory(appRouter);
