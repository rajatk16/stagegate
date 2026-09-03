import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '../../../test/renderApp';
import type { AuthState } from '../../../lib/auth';

const verifiedUser: AuthState = {
  status: 'authenticated',
  user: {
    uid: 'verified-user',
    email: 'verified@example.test',
    displayName: null,
    photoURL: null,
    emailVerified: true,
  },
};

const unverifiedUser: AuthState = {
  status: 'authenticated',
  user: {
    uid: 'unverified-user',
    email: 'pending@example.test',
    displayName: null,
    photoURL: null,
    emailVerified: false,
  },
};

describe('authentication route guards', () => {
  it('waits for initial authentication resolution', () => {
    renderApp(['/events'], {
      status: 'loading',
      user: null,
    });

    expect(screen.getByRole('status')).toHaveTextContent('Checking your session');
  });

  it('redirects a signed-out visitor to login', () => {
    const { router } = renderApp(['/events?status=open'], {
      status: 'unauthenticated',
      user: null,
      reason: 'initial',
    });

    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.state).toEqual({
      returnTo: '/events?status=open',
    });
  });

  it('explains session expiry and preserves the intended route', () => {
    const { router } = renderApp(['/settings'], {
      status: 'unauthenticated',
      user: null,
      reason: 'expired',
    });

    expect(router.state.location.pathname).toBe('/login');

    expect(screen.getByRole('alert')).toHaveTextContent('Your session ended');

    expect(router.state.location.state).toEqual({
      returnTo: '/settings',
      reason: 'expired',
    });
  });

  it('redirects an unverified user to email verification', () => {
    const { router } = renderApp(['/events'], unverifiedUser);

    expect(router.state.location.pathname).toBe('/verify-email');
    expect(router.state.location.state).toEqual({
      returnTo: '/events',
    });
  });

  it('allows a verified user through', () => {
    renderApp(['/events'], verifiedUser);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Events',
      }),
    ).toBeInTheDocument();
  });

  it('keeps authenticated users away from login', () => {
    const { router } = renderApp(
      [
        {
          pathname: '/login',
          state: {
            returnTo: '/events',
          },
        },
      ],
      verifiedUser,
    );

    expect(router.state.location.pathname).toBe('/events');
  });
});
