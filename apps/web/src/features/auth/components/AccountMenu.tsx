import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { routes } from '../../../app/routes';
import { useAuth } from '../../../lib/auth';
import { signOutCurrentUser } from '../services/authService';

export function AccountMenu() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (auth.status === 'loading') {
    return (
      <span className="text-sm text-slate-500" role="status">
        Checking session…
      </span>
    );
  }

  if (auth.status === 'unauthenticated') {
    return (
      <Link
        className="text-brand-700 rounded-md px-3 py-2 text-sm font-semibold hover:bg-slate-100"
        to={routes.login}
      >
        Sign in
      </Link>
    );
  }

  const handleLogout = async () => {
    setIsSigningOut(true);
    setErrorMessage(null);

    try {
      await signOutCurrentUser();
      await navigate(routes.login, { replace: true });
    } catch {
      setErrorMessage('Sign out failed. Please try again.');
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-48 truncate text-sm text-slate-600 sm:inline">
        {auth.user.displayName ?? auth.user.email ?? 'Signed in'}
      </span>

      <button
        className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:text-slate-400"
        disabled={isSigningOut}
        onClick={() => {
          void handleLogout();
        }}
        type="button"
      >
        {isSigningOut ? 'Signing out…' : 'Sign out'}
      </button>

      {errorMessage !== null ? (
        <span className="sr-only" role="alert">
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}
