import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthLayout } from '../components';
import { routes } from '../../../app/routes';
import { getAuthErrorMessage } from '../errors';
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas';
import {
  completePasswordReset,
  inspectPasswordResetCode,
  completeEmailVerification,
} from '../services';

type VerificationStatus = 'processing' | 'success' | 'failure';

function VerifyEmailAction({ actionCode }: { readonly actionCode: string }) {
  const [status, setStatus] = useState<VerificationStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void completeEmailVerification(actionCode)
      .then(() => {
        if (isActive) {
          setStatus('success');
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(getAuthErrorMessage(error, 'verify-email'));
          setStatus('failure');
        }
      });

    return () => {
      isActive = false;
    };
  }, [actionCode]);

  if (status === 'processing') {
    return (
      <AuthLayout
        description="Please wait while we verify your email address."
        footer={null}
        title="Verifying email"
      >
        <p className="text-sm text-slate-600" role="status">
          Verifying…
        </p>
      </AuthLayout>
    );
  }

  if (status === 'failure') {
    return (
      <AuthLayout
        description={errorMessage ?? 'The verification link could not be used.'}
        footer={null}
        title="Verification failed"
      >
        <Link
          className="bg-brand-600 hover:bg-brand-700 inline-flex rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          to={routes.verifyEmail}
        >
          Request another email
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      description="Your email address has been verified successfully."
      footer={null}
      title="Email verified"
    >
      <Link
        className="bg-brand-600 hover:bg-brand-700 inline-flex rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
        to={routes.dashboard}
      >
        Continue to StageGate
      </Link>
    </AuthLayout>
  );
}

function ResetPasswordAction({ actionCode }: { readonly actionCode: string }) {
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [inspectionError, setInspectionError] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    let isActive = true;

    void inspectPasswordResetCode(actionCode)
      .then((email) => {
        if (isActive) {
          setAccountEmail(email);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setInspectionError(getAuthErrorMessage(error, 'reset-password'));
        }
      });

    return () => {
      isActive = false;
    };
  }, [actionCode]);

  const handleReset = async (values: ResetPasswordValues) => {
    try {
      await completePasswordReset(actionCode, values.password);
      setHasCompleted(true);
    } catch (error: unknown) {
      setError('root', {
        message: getAuthErrorMessage(error, 'reset-password'),
      });
    }
  };

  if (inspectionError !== null) {
    return (
      <AuthLayout description={inspectionError} footer={null} title="Reset link unavailable">
        <Link
          className="bg-brand-600 hover:bg-brand-700 inline-flex rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          to={routes.forgotPassword}
        >
          Request another link
        </Link>
      </AuthLayout>
    );
  }

  if (accountEmail === null) {
    return (
      <AuthLayout
        description="Please wait while we check your reset link."
        footer={null}
        title="Checking reset link"
      >
        <p className="text-sm text-slate-600" role="status">
          Checking…
        </p>
      </AuthLayout>
    );
  }

  if (hasCompleted) {
    return (
      <AuthLayout
        description="Your password has been changed. You can now sign in with the new password."
        footer={null}
        title="Password reset complete"
      >
        <Link
          className="bg-brand-600 hover:bg-brand-700 inline-flex rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          to={`${routes.login}?passwordReset=success`}
        >
          Sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      description={`Choose a new password for ${accountEmail}.`}
      footer={null}
      title="Choose a new password"
    >
      <form
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(handleReset)(event);
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
          <label className="block text-sm font-semibold text-slate-800" htmlFor="new-password">
            New password
          </label>

          <input
            {...register('password')}
            aria-invalid={errors.password !== undefined}
            autoComplete="new-password"
            className="focus:border-brand-600 mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5"
            id="new-password"
            type="password"
          />

          {errors.password?.message !== undefined ? (
            <p className="mt-2 text-sm text-red-700">{errors.password.message}</p>
          ) : null}
        </div>

        <div>
          <label
            className="block text-sm font-semibold text-slate-800"
            htmlFor="confirm-new-password"
          >
            Confirm new password
          </label>

          <input
            {...register('confirmPassword')}
            aria-invalid={errors.confirmPassword !== undefined}
            autoComplete="new-password"
            className="focus:border-brand-600 mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5"
            id="confirm-new-password"
            type="password"
          />

          {errors.confirmPassword?.message !== undefined ? (
            <p className="mt-2 text-sm text-red-700">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <button
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Saving password…' : 'Save new password'}
        </button>
      </form>
    </AuthLayout>
  );
}

export function EmailActionPage() {
  const [searchParams] = useSearchParams();

  const mode = searchParams.get('mode');
  const actionCode = searchParams.get('oobCode');

  if (actionCode === null || actionCode.trim() === '') {
    return (
      <AuthLayout
        description="The email link is missing its one-time action code."
        footer={null}
        title="Invalid email link"
      >
        <Link className="text-brand-700 font-semibold hover:underline" to={routes.login}>
          Return to sign in
        </Link>
      </AuthLayout>
    );
  }

  switch (mode) {
    case 'verifyEmail':
      return <VerifyEmailAction actionCode={actionCode} />;

    case 'resetPassword':
      return <ResetPasswordAction actionCode={actionCode} />;

    case null:
    default:
      return (
        <AuthLayout
          description="This type of email action is not supported."
          footer={null}
          title="Unsupported email link"
        >
          <Link className="text-brand-700 font-semibold hover:underline" to={routes.login}>
            Return to sign in
          </Link>
        </AuthLayout>
      );
  }
}
