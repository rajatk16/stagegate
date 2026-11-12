import { Navigate, Outlet } from 'react-router';

import { PageContainer } from '@/components/layout/PageContainer';

import { useAuth } from '../context/auth';

export const AuthGate = ({ audience }: { audience: 'guest' | 'active' }) => {
  const { session } = useAuth();
  switch (session.status) {
    case 'loading':
      return (
        <PageContainer
          title="Checking your session"
          description="Please wait while we check your account."
        />
      );
    case 'unavailable':
      return (
        <PageContainer
          title="Sign-in unavailable"
          description="Authentication is unavailable for this deployment."
        />
      );
    case 'verify':
    case 'error':
      return <Navigate to="/verify-email" replace />;
    case 'active':
      return audience === 'active' ? (
        <Outlet />
      ) : (
        <Navigate to="/app" replace />
      );
    case 'signed-out':
      return audience === 'guest' ? (
        <Outlet />
      ) : (
        <Navigate to="/sign-in" replace />
      );
  }
};
