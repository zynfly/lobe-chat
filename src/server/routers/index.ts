/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from '../trpc';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'hi!'),
});

export type AppRouter = typeof appRouter;
