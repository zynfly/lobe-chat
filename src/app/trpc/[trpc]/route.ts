import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

import { createContext } from '@/server/context';
import { appRouter } from '@/server/routers';

export const runtime = 'edge';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    /**
     * @link https://trpc.io/docs/v11/context
     */
    createContext: createContext,

    endpoint: '/trpc',

    onError: ({ error, path }) => {
      console.log('Error in tRPC handler (edge) on path', path);
      console.error(error);
    },

    req: req,
    router: appRouter,
  });

export { handler as GET, handler as POST };
