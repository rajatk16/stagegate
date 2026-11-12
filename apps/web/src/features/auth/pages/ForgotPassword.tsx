import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';

import { useAuth } from '../context/auth';
import { AuthPanel } from '../components/AuthPanel';
import {
  passwordResetSchema,
  type PasswordResetValues,
} from '../util/formSchemas';
import { Button } from '@/components/ui/button';

export const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: '' },
  });

  async function submit({ email }: PasswordResetValues) {
    try {
      await resetPassword(email);
    } catch {
      setError('root.server', {
        message: 'We couldn’t request a reset link. Try again.',
      });
    }
  }

  return (
    <AuthPanel
      title="Reset your password"
      description="Enter the email address you use for StageGate."
    >
      {isSubmitSuccessful ? (
        <p role="status" className="text-sm leading-relaxed">
          If an account exists for that address, we’ll send a password reset
          link.
        </p>
      ) : (
        <form
          className="grid gap-3"
          onSubmit={handleSubmit(submit)}
          aria-busy={isSubmitting}
          noValidate
        >
          <label htmlFor="reset-email" className="text-sm font-medium">
            Email address
          </label>
          <Input
            id="reset-email"
            {...register('email')}
            className="min-h-11"
            readOnly={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'reset-email-error' : undefined}
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
          {errors.email && (
            <p
              id="reset-email-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.email.message}
            </p>
          )}
          {errors.root?.server && (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.server.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-h-11 cursor-pointer"
          >
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
      <Link
        to="/sign-in"
        className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
      >
        Back to sign in
      </Link>
    </AuthPanel>
  );
};
