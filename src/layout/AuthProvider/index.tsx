import { PropsWithChildren } from 'react';

import { getServerConfig } from '@/config/server';

import Clerk from './Clerk';
import NextAuth from './NextAuth';

const { ENABLE_OAUTH_SSO = false } = getServerConfig();

const AuthProvider = ({ children }: PropsWithChildren) =>
  ENABLE_OAUTH_SSO ? <NextAuth>{children}</NextAuth> : <Clerk>{children}</Clerk>;

export default AuthProvider;
