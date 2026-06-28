import { Navigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { FullPageLoader } from '@/components/feedback';
import { useAuthInitialized, useIsAuthenticated } from '@/features/auth';

import { buildLoginRoute } from './routeBuilders';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const initialized = useAuthInitialized();
  const authenticated = useIsAuthenticated();

  if (!initialized)
    return (
      <FullPageLoader
        title="Loading..."
        description="Please wait while we load up your account..."
      />
    );

  if (!authenticated) {
    return <Navigate replace to={buildLoginRoute()} />;
  }

  return <>{children}</>;
};
