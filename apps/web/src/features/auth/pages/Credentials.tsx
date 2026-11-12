import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/form/FormFields';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/inputGroup';

import { useAuth } from '../context/auth';
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

  const submit = async ({ email, password }: CredentialValues) => {
    try {
      await (signup ? signUp : signIn)(email, password);
    } catch (failure) {
      setError('root.server', { message: credentialMessage(failure, signup) });
    }
  };

  return (
    <PageContainer
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
        <FormField
          id="auth-email"
          label="Email address"
          error={errors.email?.message}
        >
          {(control) => (
            <InputGroupInput
              {...register('email')}
              {...control}
              readOnly={isSubmitting}
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          )}
        </FormField>
        <FormField
          id="auth-password"
          label="Password"
          description={signup ? 'Use at least 8 characters.' : undefined}
          error={errors.password?.message}
        >
          {(control) => (
            <>
              <InputGroupInput
                {...register('password')}
                {...control}
                readOnly={isSubmitting}
                type={showPassword ? 'text' : 'password'}
                autoComplete={signup ? 'new-password' : 'current-password'}
                required
              />
              <InputGroupAddon align="inline-end" className="p-0">
                <InputGroupButton
                  type="button"
                  size="icon-sm"
                  className="size-11"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-controls="auth-password"
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </>
          )}
        </FormField>
        {!signup && (
          <Link
            to="/forgot-password"
            className="inline-flex min-h-11 w-fit items-center text-sm font-medium text-primary underline underline-offset-4"
          >
            Forgot password?
          </Link>
        )}
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
    </PageContainer>
  );
};
