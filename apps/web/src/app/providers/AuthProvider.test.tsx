import { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from './AuthProvider';
import { useAuth, type AuthUser } from '../../lib/auth';

type MutableAuthUser = {
  -readonly [Key in keyof AuthUser]: AuthUser[Key];
};

type AuthListener = (user: MutableAuthUser | null) => void;

const mocks = vi.hoisted(() => ({
  onIdTokenChanged: vi.fn<(auth: unknown, listener: AuthListener) => () => void>(),
}));

vi.mock('firebase/auth', () => ({
  onIdTokenChanged: mocks.onIdTokenChanged,
}));

vi.mock('../../lib/firebaseClient', () => ({
  firebaseAuth: {},
}));

const listeners = new Set<AuthListener>();

function createUser(): MutableAuthUser {
  return {
    uid: 'user-123',
    email: 'speaker@example.test',
    displayName: 'Test Speaker',
    photoURL: null,
    emailVerified: false,
  } satisfies AuthUser;
}

function AuthProbe() {
  const auth = useAuth();

  return (
    <>
      <p role="status">{auth.status}</p>

      {auth.status === 'authenticated' ? (
        <>
          <p>{auth.user.uid}</p>
          <p>{auth.user.email}</p>
          <p>{auth.user.emailVerified ? 'Verified' : 'Unverified'}</p>
        </>
      ) : null}
    </>
  );
}

function emitAuthState(user: AuthUser | null) {
  act(() => {
    for (const listener of listeners) {
      listener(user);
    }
  });
}

beforeEach(() => {
  listeners.clear();
  mocks.onIdTokenChanged.mockReset();

  mocks.onIdTokenChanged.mockImplementation((_auth, listener) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  });
});

describe('AuthProvider', () => {
  it('waits for Firebase before resolving the initial session', () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent(/^loading$/);

    emitAuthState(null);

    expect(screen.getByRole('status')).toHaveTextContent(/^unauthenticated$/);
  });

  it('restores an existing signed-in session', () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    emitAuthState(createUser());

    expect(screen.getByRole('status')).toHaveTextContent(/^authenticated$/);
    expect(screen.getByText('user-123')).toBeInTheDocument();
    expect(screen.getByText('speaker@example.test')).toBeInTheDocument();
  });

  it('updates consumers when the same user object changes', () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    const user = createUser();

    emitAuthState(user);

    expect(screen.getByText('Unverified')).toBeInTheDocument();

    user.emailVerified = true;
    emitAuthState(user);

    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.queryByText('Unverified')).not.toBeInTheDocument();
  });

  it('removes the user after sign-out', () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    emitAuthState(createUser());
    emitAuthState(null);

    expect(screen.getByRole('status')).toHaveTextContent(/^unauthenticated$/);
    expect(screen.queryByText('speaker@example.test')).not.toBeInTheDocument();
  });

  it('keeps one active subscription in Strict Mode and cleans it up', () => {
    const { unmount } = render(
      <StrictMode>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </StrictMode>,
    );

    expect(listeners.size).toBe(1);

    emitAuthState(createUser());

    expect(screen.getByRole('status')).toHaveTextContent(/^authenticated$/);

    unmount();

    expect(listeners.size).toBe(0);
  });

  it('ignores a callback from a disposed subscription', () => {
    render(
      <StrictMode>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </StrictMode>,
    );

    const disposedListener = mocks.onIdTokenChanged.mock.calls[0]?.[1];

    if (disposedListener === undefined) {
      throw new Error('Expected an initial subscription.');
    }

    emitAuthState(null);

    act(() => {
      disposedListener(createUser());
    });

    expect(screen.getByRole('status')).toHaveTextContent(/^unauthenticated$/);
  });

  it('rejects useAuth outside its provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      expect(() => render(<AuthProbe />)).toThrow('useAuth must be used within an AuthProvider');
    } finally {
      consoleError.mockRestore();
    }
  });
});
