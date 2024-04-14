'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, memo } from 'react';

import AuthLayout from '@/layout/AuthLayout';
import { DefaultLayoutDesktop } from '@/layout/DefaultLayout';

const defaultLayoutRoutes = new Set(['/']);

const authLayoutRoutes = new Set(['/sign-in', '/sign-up']);

const DesktopLayout = memo<PropsWithChildren>(({ children }) => {
  const pathname = usePathname();

  if (defaultLayoutRoutes.has(pathname)) return children;

  if (authLayoutRoutes.has(pathname)) return <AuthLayout>{children}</AuthLayout>;

  return <DefaultLayoutDesktop>{children}</DefaultLayoutDesktop>;
});

export default DesktopLayout;
