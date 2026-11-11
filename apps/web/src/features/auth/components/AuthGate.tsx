import { Navigate, Outlet } from 'react-router';

import { AuthPanel } from './AuthPanel';
import { useAuth } from '../context/auth';

export const AuthGate = ({ audience }: { audience: 'guest' | 'active' }) => {
  const { session } = useAuth();
  switch (session.status) {
    case 'loading':
      return (
        <AuthPanel
          title="Checking your session"
          description="Please wait while we check your account."
        />
      );
    case 'unavailable':
      return (
        <AuthPanel
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
