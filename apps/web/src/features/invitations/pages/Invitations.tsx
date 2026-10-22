import { useAuth } from '@/features/auth';

import { ReceivedInvitations } from '../components';

export const Invitations = () => {
  const session = useAuth();

  if (session.status !== 'authenticated') {
    return null;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Invitations</h1>

        <p className="text-muted-foreground">
          Review and accept invitations to join organizations.
        </p>
      </header>

      <ReceivedInvitations
        key={`${session.user.uid}:${session.user.email ?? ''}`}
        user={session.user}
      />
    </div>
  );
};
