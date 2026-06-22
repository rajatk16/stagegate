import { Navigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { useBootstrapInitialized } from '@/features/bootstrap';
import { useAuthenticatedUser, useAuthInitialized } from '@/features/auth';

import { RouteLoader } from './RouteLoader';

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
