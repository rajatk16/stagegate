import { Navigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { useAuthInitialized, useIsAuthenticated } from '@/features/auth';

import { buildLoginRoute } from './routeBuilders';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const initialized = useAuthInitialized();
  const authenticated = useIsAuthenticated();

  if (!initialized) return null;

  if (!authenticated) {
    return <Navigate replace to={buildLoginRoute()} />;
  }

  return <>{children}</>;
};
