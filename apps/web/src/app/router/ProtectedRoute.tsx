import { Navigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { RouteLoader } from './RouteLoader';
import { useBootstrapInitialized } from '@/bootstrap/hooks';
import { useAuthenticatedUser, useAuthInitialized } from '@/auth/authSelectors';

export const ProtectedRoute = (props: PropsWithChildren) => {
  const authInitialized = useAuthInitialized();
  const bootstrapInitialized = useBootstrapInitialized();

  const user = useAuthenticatedUser();

  if (!authInitialized || (user && !bootstrapInitialized)) {
    return <RouteLoader />;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return <>{props.children}</>;
};
