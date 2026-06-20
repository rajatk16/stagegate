import { Navigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

export const ProtectedRoute = (props: PropsWithChildren) => {
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return props.children;
};
