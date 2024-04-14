'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { PropsWithChildren, memo } from 'react';

import UserUpdater from './UserUpdater';

const Clerk = memo(({ children }: PropsWithChildren) => {
  return (
    <ClerkProvider>
      {children}
      <UserUpdater />
    </ClerkProvider>
  );
});

export default Clerk;
