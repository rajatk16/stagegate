import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthLayout } from '../components';
import { routes } from '../../../app/routes';
import { getAuthErrorMessage } from '../errors';
import { requestPasswordReset } from '../services';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas';

export function ForgotPasswordPage() {
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleRequest = async (values: ForgotPasswordValues) => {
    try {
      await requestPasswordReset(values.email);
      setHasSubmitted(true);
    } catch (error: unknown) {
      setError('root', {
        message: getAuthErrorMessage(error, 'request-password-reset'),
      });
    }
  };

  if (hasSubmitted) {
    return (
      <AuthLayout
        description="If an account matches that address, a password-reset email has been sent."
        footer={null}
        title="Check your email"
      >
        <Link
          className="bg-brand-600 hover:bg-brand-700 inline-flex rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          to={routes.login}
        >
          Return to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      description="Enter your email address and we’ll send password-reset instructions."
      footer={
        <Link className="text-brand-700 font-semibold hover:underline" to={routes.login}>
          Return to sign in
        </Link>
      }
      title="Reset your password"
    >
      <form
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(handleRequest)(event);
        }}
      >
        {errors.root?.message !== undefined ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {errors.root.message}
          </div>
        ) : null}

        <div>
          <label
            className="block text-sm font-semibold text-slate-800"
            htmlFor="reset-request-email"
          >
            Email address
          </label>

          <input
            {...register('email')}
            aria-describedby={errors.email === undefined ? undefined : 'reset-request-email-error'}
            aria-invalid={errors.email !== undefined}
            autoComplete="email"
            className="focus:border-brand-600 mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 shadow-sm"
            id="reset-request-email"
            inputMode="email"
            type="email"
          />

          {errors.email?.message !== undefined ? (
            <p className="mt-2 text-sm text-red-700" id="reset-request-email-error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <button
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Sending instructions…' : 'Send reset instructions'}
        </button>
      </form>
    </AuthLayout>
  );
}
