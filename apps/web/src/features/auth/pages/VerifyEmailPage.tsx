import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { useAuth } from '../../../lib';
import { AuthLayout } from '../components';
import { routes } from '../../../app/routes';
import { getAuthErrorMessage } from '../errors';
import { refreshEmailVerification, resendVerificationEmail } from '../services';

export function VerifyEmailPage() {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const initialEmailSent = searchParams.get('sent') !== 'false';

  const [message, setMessage] = useState<string | null>(
    initialEmailSent
      ? 'We sent a verification link to your email address.'
      : 'Your account was created, but the verification email could not be sent.',
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  if (auth.status === 'loading') {
    return (
      <AuthLayout
        description="Loading your account details."
        footer={null}
        title="Checking your account"
      >
        <p className="text-sm text-slate-600" role="status">
          Checking session…
        </p>
      </AuthLayout>
    );
  }

  if (auth.status === 'unauthenticated') {
    return (
      <AuthLayout
        description="Sign in before checking your verification status."
        footer={null}
        title="Sign in required"
      >
        <Link
          className="bg-brand-600 hover:bg-brand-700 inline-flex rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          to={routes.login}
        >
          Sign in
        </Link>
      </AuthLayout>
    );
  }

  if (auth.user.emailVerified) {
    return (
      <AuthLayout
        description="Your email address has been verified."
        footer={null}
        title="Email verified"
      >
        <Link
          className="bg-brand-600 hover:bg-brand-700 inline-flex rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          to={routes.dashboard}
        >
          Continue to dashboard
        </Link>
      </AuthLayout>
    );
  }

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      await resendVerificationEmail();
      setMessage('A new verification email has been sent.');
    } catch (error: unknown) {
      setErrorMessage(getAuthErrorMessage(error, 'send-verification'));
    } finally {
      setIsResending(false);
    }
  };

  const handleCheck = async () => {
    setIsChecking(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const isVerified = await refreshEmailVerification();

      if (!isVerified) {
        setMessage('Your email is not verified yet. Open the link in your email, then try again.');
      }
    } catch (error: unknown) {
      setErrorMessage(getAuthErrorMessage(error, 'verify-email'));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <AuthLayout
      description={`Verify ${auth.user.email ?? 'your email address'} before continuing.`}
      footer={
        <Link className="text-brand-700 font-semibold hover:underline" to={routes.login}>
          Return to sign in
        </Link>
      }
      title="Check your email"
    >
      <div className="space-y-5">
        {message !== null ? (
          <p
            className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800"
            role="status"
          >
            {message}
          </p>
        ) : null}

        {errorMessage !== null ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <button
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          disabled={isChecking || isResending}
          onClick={() => {
            void handleCheck();
          }}
          type="button"
        >
          {isChecking ? 'Checking…' : "I've verified my email"}
        </button>

        <button
          className="text-brand-700 flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:text-slate-400"
          disabled={isChecking || isResending}
          onClick={() => {
            void handleResend();
          }}
          type="button"
        >
          {isResending ? 'Sending…' : 'Send another verification email'}
        </button>
      </div>
    </AuthLayout>
  );
}
