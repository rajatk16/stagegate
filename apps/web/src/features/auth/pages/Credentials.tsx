import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { useAuth } from '../context/auth';
import { AuthPanel } from '../components/AuthPanel';
import {
  signInSchema,
  signUpSchema,
  type CredentialValues,
} from '../util/formSchemas';

const credentialMessage = (error: unknown, signup: boolean): string => {
  const code = error instanceof FirebaseError ? error.code : undefined;
  if (code === 'auth/network-request-failed')
    return 'Check your connection and try again.';
  if (code === 'auth/too-many-requests')
    return 'Too many attempts. Wait a moment and try again.';
  if (
    code === 'auth/weak-password' ||
    code === 'auth/password-does-not-meet-requirements'
  ) {
    return 'Choose a stronger password that meets the password requirements.';
  }
  return signup
    ? 'We couldn’t create your account. Try again, sign in, or reset your password.'
    : 'We couldn’t sign you in. Check your email and password and try again.';
};

export const Credentials = ({ mode }: { mode: 'sign-in' | 'signup' }) => {
  const { signIn, signUp } = useAuth();
  const signup = mode === 'signup';
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CredentialValues>({
    resolver: zodResolver(signup ? signUpSchema : signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const passwordDescription =
    [signup && 'password-hint', errors.password && 'password-error']
      .filter(Boolean)
      .join(' ') || undefined;

  const submit = async ({ email, password }: CredentialValues) => {
    try {
      await (signup ? signUp : signIn)(email, password);
    } catch (failure) {
      setError('root.server', { message: credentialMessage(failure, signup) });
    }
  };

  return (
    <AuthPanel
      title={signup ? 'Create your StageGate account' : 'Sign in to StageGate'}
      description={
        signup
          ? 'Use yur proposal email to find any guest submissions after you verify it.'
          : 'Open your workspace and find your event proposals.'
      }
    >
      <form
        className="grid gap-4"
        onSubmit={handleSubmit(submit)}
        aria-busy={isSubmitting}
        noValidate
      >
        <div className="grid gap-1.5">
          <label htmlFor="auth-email" className="text-sm font-medium">
            Email address
          </label>
          <Input
            id="auth-email"
            {...register('email')}
            className="min-h-11"
            readOnly={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="auth-password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Input
              id="auth-password"
              {...register('password')}
              readOnly={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              type={showPassword ? 'text' : 'password'}
              autoComplete={signup ? 'new-password' : 'current-password'}
              aria-describedby={passwordDescription}
              className="min-h-11 pr-12"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-controls="auth-password"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
          {signup && (
            <p id="password-hint" className="text-sm text-muted-foreground">
              Use at least 8 characters.
            </p>
          )}
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.password.message}
            </p>
          )}
          {!signup && (
            <Link
              to="/forgot-password"
              className="inline-flex min-h-11 w-fit items-center text-sm font-medium text-primary underline underline-offset-4"
            >
              Forgot password?
            </Link>
          )}
        </div>
        {errors.root?.server && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 p-3 text-sm text-destructive"
          >
            {errors.root.server.message}
          </p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 w-full cursor-pointer"
        >
          {signup
            ? isSubmitting
              ? 'Creating account…'
              : 'Create account'
            : isSubmitting
              ? 'Signing in…'
              : 'Sign in'}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">
        {signup ? 'Already have an account? ' : 'New to StageGate? '}
        <Link
          to={signup ? '/sign-in' : '/sign-up'}
          className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4"
        >
          {signup ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </AuthPanel>
  );
};
