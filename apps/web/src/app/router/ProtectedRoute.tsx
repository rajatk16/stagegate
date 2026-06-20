import { Navigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { useAuthInitialized, useIsAuthenticated } from '@/auth/authSelectors';

export const ProtectedRoute = (props: PropsWithChildren) => {
  const initialized = useAuthInitialized();

  const isAuthenticated = useIsAuthenticated();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return props.children;
};
