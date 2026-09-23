import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/hooks"
import { getAuthUrl } from "@/lib";

export const RequireAuth = () => {
  const session = useAuth();
  const location = useLocation();

  if (session.status === 'loading') {
    return null;
  }

  if (session.status === 'unauthenticated') {
    const returnTo = location.pathname + location.search + location.hash;

    return (
      <Navigate 
        to={getAuthUrl("/sign-in", returnTo)}
        replace
      />
    );
  }

  if(!session.user.emailVerified) {
    const returnTo = location.pathname + location.search + location.hash;

    return (
      <Navigate to={getAuthUrl("/verify-email", returnTo)} replace />
    );
  }

  return <Outlet />;
}