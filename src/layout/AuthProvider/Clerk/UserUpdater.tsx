import { useSession, useUser } from '@clerk/nextjs';
import { memo } from 'react';

// update the user data into the context
const UserUpdater = memo(() => {
  const { isLoaded, user, isSignedIn } = useUser();

  const { session } = useSession();
  console.log('isLoaded:', isLoaded, 'isSignedIn:', isSignedIn);
  console.log('user:', user);
  console.log('session:', session);
  return null;
});

export default UserUpdater;
