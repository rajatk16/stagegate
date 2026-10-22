import { User } from 'firebase/auth';

import { Button, InlineAlert } from '@/components';

import { ProfileForm } from './ProfileForm';
import { useProfileState } from '@/app/query';
import { Navigate, useLocation, useSearchParams } from 'react-router';
import { isProfileComplete } from '../utils';

export const ProfileLoader = ({ user }: { user: User }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const onboarding = searchParams.get('onboarding') === '1';
  const { state, refresh, refreshing, refreshError } = useProfileState(user);

  if (state.status === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border bg-card p-6 text-muted-foreground"
      >
        Loading your profile...
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="max-w-3xl space-y-4 rounded-xl border bg-card p-6">
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

  if (onboarding && isProfileComplete(state.profile)) {
    return <Navigate to="/dashboard" replace state={location.state} />;
  }

  return (
    <div className="space-y-4 flex justify-center flex-col flex-1">
      {onboarding && (
        <InlineAlert tone="info" title="Complete your profile">
          Add your name and timezone to continue to your workspace.
        </InlineAlert>
      )}
      {refreshError && (
        <InlineAlert tone="warning">
          Could not refresh your profile. Your current edits are preserved.{' '}
          {refreshError}
        </InlineAlert>
      )}

      <ProfileForm user={user} profile={state.profile} />
    </div>
  );
};
