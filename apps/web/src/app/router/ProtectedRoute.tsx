import { Navigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { useAuthenticatedUser, useAuthInitialized } from '@/auth/authSelectors';

export const ProtectedRoute = (props: PropsWithChildren) => {
  const initialized = useAuthInitialized();

  const user = useAuthenticatedUser();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return props.children;
};
