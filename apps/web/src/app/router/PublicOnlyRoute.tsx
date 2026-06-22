import { Navigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { useAuthenticatedUser, useAuthInitialized } from '@/features/auth';

import { RouteLoader } from './RouteLoader';

export const PublicOnlyRoute = (props: PropsWithChildren) => {
  const initialized = useAuthInitialized();

  const authenticatedUser = useAuthenticatedUser();

  if (!initialized) {
    return <RouteLoader />;
  }

  if (authenticatedUser) {
    return <Navigate replace to="/dashboard" />;
  }

  return <>{props.children}</>;
};
