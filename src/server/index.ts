import { serverDB } from '@/database/server';

import { publicProcedure, router } from './trpc';

const appRouter = router({
  messages: publicProcedure.query(async () => {
    await serverDB.query.messages.findMany();
  }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
