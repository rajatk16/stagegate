import { Navigate, Outlet, useLocation } from 'react-router';
import type { User } from 'firebase/auth';

import { Button, InlineAlert } from '@/components';
import { isProfileComplete, useAuth } from '@/features';

import { useProfileState } from '../query';

const CompleteProfileGate = ({ user }: { user: User }) => {
  const location = useLocation();
  const { state, refresh, refreshing } = useProfileState(user);

  if (state.status === 'loading') {
    return (
      <p role="status" className="text-muted-foreground">
        Loading your profile...
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <InlineAlert tone="error" title="Could not load your profile">
          {state.message}
        </InlineAlert>

        <Button
          type="button"
          variant="outline"
          disabled={refreshing}
          onClick={refresh}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (!isProfileComplete(state.profile)) {
    return (
      <Navigate to="/profile?onboarding=1" replace state={location.state} />
    );
  }

  return <Outlet />;
};

export const RequireCompleteProfile = () => {
  const session = useAuth();

  if (session.status !== 'authenticated') {
    return null;
  }

  return <CompleteProfileGate user={session.user} />;
};
