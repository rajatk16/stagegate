import { useAuth } from '@/features';

import { DashboardContent } from '../components';
import { ReceivedInvitations } from '@/features/invitations/components';
import { useLocation } from 'react-router';
import { isRecord } from '../utils';
import { InlineAlert } from '@/components';

export const Dashboard = () => {
  const session = useAuth();
  const location = useLocation();
  const navigationState: unknown = location.state;

  if (session.status !== 'authenticated') {
    return null;
  }

  const leftOrganization =
    isRecord(navigationState) &&
    isRecord(navigationState.leftOrganization) &&
    navigationState.leftOrganization.uid === session.user.uid &&
    typeof navigationState.leftOrganization.name === 'string'
      ? navigationState.leftOrganization.name
      : null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Your profile, account, and next steps.
        </p>
      </header>

      {leftOrganization !== null && (
        <InlineAlert tone="success" title="You left the organization">
          You no longer have access to {leftOrganization}. You will need a new
          invitation to return.
        </InlineAlert>
      )}

      <ReceivedInvitations
        key={`${session.user.uid}:${session.user.email ?? ''}`}
        user={session.user}
      />

      <DashboardContent key={session.user.uid} user={session.user} />
    </div>
  );
};
