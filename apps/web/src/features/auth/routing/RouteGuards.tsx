import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '../../../lib';
import { routes } from '../../../app/routes';
import { getCurrentPath, readAuthNavigationState } from './authNavigation';

const SessionLoadingPage = () => (
  <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
    <div
      className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm"
      role="status"
    >
      Checking your session...
    </div>
  </main>
);

export const RequireAuthentication = () => {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === 'loading') {
    return <SessionLoadingPage />;
  }

  if (auth.status === 'unauthenticated') {
    const state =
      auth.reason === 'expired'
        ? {
            returnTo: getCurrentPath(location),
            reason: 'expired' as const,
          }
        : {
            returnTo: getCurrentPath(location),
          };

    return <Navigate replace state={state} to={routes.login} />;
  }

  return <Outlet />;
};

export const RequireVerifiedEmail = () => {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === 'loading') return <SessionLoadingPage />;

  if (auth.status === 'unauthenticated') {
    return <Navigate replace state={{ returnTo: getCurrentPath(location) }} to={routes.login} />;
  }

  if (!auth.user.emailVerified) {
    return (
      <Navigate
        replace
        state={{
          returnTo: getCurrentPath(location),
        }}
        to={routes.verifyEmail}
      />
    );
  }
  return <Outlet />;
};

export const AnonymousOnly = () => {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === 'loading') return <SessionLoadingPage />;

  if (auth.status === 'unauthenticated') return <Outlet />;

  const navigation = readAuthNavigationState(location.state);

  return (
    <Navigate replace to={auth.user.emailVerified ? navigation.returnTo : routes.verifyEmail} />
  );
};
