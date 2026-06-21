import type { PropsWithChildren } from 'react';
import { useAuthenticatedUser, useAuthInitialized } from '@/auth/authSelectors';

import { RouteLoader } from './RouteLoader';
import { Navigate } from 'react-router-dom';

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
