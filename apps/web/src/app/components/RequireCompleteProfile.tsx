import { Navigate, Outlet, useLocation } from 'react-router';

import { Button, InlineAlert } from '@/components';
import { isProfileComplete, useAuth } from '@/features';

import { useProfileState } from '../query';

export const RequireCompleteProfile = () => {
  const session = useAuth();
  const location = useLocation();

  if (session.status !== 'authenticated') {
    return null;
  }

  const { state, refresh, refreshing } = useProfileState(session.user);

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
