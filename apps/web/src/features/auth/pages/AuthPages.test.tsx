import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderApp } from '../../../test/renderApp';

const mocks = vi.hoisted(() => ({
  createPasswordAccount: vi.fn<(email: string, password: string) => Promise<void>>(),
  signInWithPassword: vi.fn<(email: string, password: string) => Promise<void>>(),
  signOutCurrentUser: vi.fn<() => Promise<void>>(),
}));

vi.mock('../services/authService', () => mocks);

beforeEach(() => {
  mocks.createPasswordAccount.mockReset();
  mocks.signInWithPassword.mockReset();
  mocks.signOutCurrentUser.mockReset();

  mocks.createPasswordAccount.mockResolvedValue();
  mocks.signInWithPassword.mockResolvedValue();
  mocks.signOutCurrentUser.mockResolvedValue();
});

describe('LoginPage', () => {
  it('signs in and navigates to the dashboard', async () => {
    const { router, user } = renderApp(['/login']);

    await user.type(
      screen.getByRole('textbox', { name: 'Email address' }),
      ' Speaker@Example.test ',
    );

    await user.type(screen.getByLabelText('Password'), 'correct horse battery staple');

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mocks.signInWithPassword).toHaveBeenCalledWith(
        'speaker@example.test',
        'correct horse battery staple',
      );
    });

    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
  });

  it('preserves input and announces a failed sign-in', async () => {
    mocks.signInWithPassword.mockRejectedValue(new Error('Firebase operation failed'));

    const { user } = renderApp(['/login']);

    const emailInput = screen.getByRole('textbox', {
      name: 'Email address',
    });

    await user.type(emailInput, 'speaker@example.test');
    await user.type(screen.getByLabelText('Password'), 'incorrect password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('We could not sign you in.');

    expect(emailInput).toHaveValue('speaker@example.test');
  });
});

describe('SignUpPage', () => {
  it('rejects mismatched passwords without calling Firebase', async () => {
    const { user } = renderApp(['/sign-up']);

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'speaker@example.test');

    await user.type(
      screen.getByLabelText('Password', { exact: true }),
      'correct horse battery staple',
    );

    await user.type(screen.getByLabelText('Confirm password'), 'different password value');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();

    expect(mocks.createPasswordAccount).not.toHaveBeenCalled();
  });

  it('creates an account and navigates to the dashboard', async () => {
    const { router, user } = renderApp(['/sign-up']);

    await user.type(
      screen.getByRole('textbox', { name: 'Email address' }),
      'new-speaker@example.test',
    );

    await user.type(
      screen.getByLabelText('Password', { exact: true }),
      'correct horse battery staple',
    );

    await user.type(screen.getByLabelText('Confirm password'), 'correct horse battery staple');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(mocks.createPasswordAccount).toHaveBeenCalledWith(
        'new-speaker@example.test',
        'correct horse battery staple',
      );
    });

    expect(router.state.location.pathname).toBe('/sign-up');
  });
});

describe('AccountMenu', () => {
  it('signs out an authenticated user and navigates to login', async () => {
    const { router, user } = renderApp(['/'], {
      status: 'authenticated',
      user: {
        uid: 'user-123',
        email: 'speaker@example.test',
        displayName: 'Test Speaker',
        photoURL: null,
        emailVerified: false,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
      expect(mocks.signOutCurrentUser).toHaveBeenCalledOnce();
    });

    expect(router.state.location.pathname).toBe('/login');
  });
});
