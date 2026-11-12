import { Navigate } from 'react-router';

import { Button } from '@/components/ui/button';

import { useAuth } from '../context/auth';
import { AuthPanel } from '../components/AuthPanel';
import { SignOutButton } from '../components/SignOutButton';
import { CheckVerificationButton } from '../components/CheckVerificationButton';

export const VerifyEmail = () => {
  const { session, sendVerification, verificationDelivery } = useAuth();
  if (session.status === 'signed-out') {
    return <Navigate to="/sign-in" replace />;
  }

  if (session.status === 'active') return <Navigate to="/app" replace />;

  if (session.status === 'loading') {
    return (
      <AuthPanel
        title="Checking your session"
        description="Please wait while we check your account."
      />
    );
  }

  if (session.status === 'unavailable') {
    return (
      <AuthPanel
        title="Sign-in unavailable"
        description="Authentication is unavailable for this deployment."
      />
    );
  }

  if (session.status === 'error') {
    return (
      <AuthPanel
        title="Couldn’t open your workspace"
        description={session.message}
      >
        <div className="grid gap-3">
          <CheckVerificationButton />
          <SignOutButton />
        </div>
      </AuthPanel>
    );
  }

  if (session.status !== 'verify') return null;

  const sending = verificationDelivery === 'sending';

  return (
    <AuthPanel
      title="Verify your email"
      description={`Open the verification link for ${session.email}. Then return here to continue.`}
    >
      <div className="grid gap-3">
        {verificationDelivery === 'sent' && (
          <p role="status" className="text-sm text-muted-foreground">
            Verification email sent. Check your inbox or spam folder.
          </p>
        )}
        {verificationDelivery === 'failed' && (
          <p role="alert" className="text-sm text-destructive">
            We couldn’t send the verification email. Try sending it again.
          </p>
        )}
        <CheckVerificationButton />
        <Button
          type="button"
          variant="outline"
          className="min-h-11 cursor-pointer"
          disabled={sending}
          onClick={() => void sendVerification()}
        >
          {sending
            ? 'Sending…'
            : verificationDelivery === 'sent'
              ? 'Resend verification email'
              : 'Send verification email'}
        </Button>
        <SignOutButton />
      </div>
    </AuthPanel>
  );
};
