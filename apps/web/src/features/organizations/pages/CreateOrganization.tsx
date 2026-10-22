import { Link } from 'react-router';
import { useAuth } from '@/features/auth';

import { CreateOrganizationContent } from '../components';
import { useOrganizations } from '../hooks';
import { Button, InlineAlert } from '@/components';

export const CreateOrganization = () => {
  const session = useAuth();
  const { state, reload } = useOrganizations();

  if (session.status !== 'authenticated') {
    return null;
  }

  if (state.status === 'loading') {
    return (
      <p role="status" className="text-muted-foreground">
        Loading your organizations...
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <InlineAlert tone="error">{state.message}</InlineAlert>

        <Button type="button" variant="outline" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  const needsFirstOrganization = state.organizations.length === 0;

  return (
    <div className="space-y-8">
      {needsFirstOrganization && (
        <div className="space-y-4">
          <InlineAlert tone="info" title="Set up your workspace">
            Create your first organization. If someone has invited you to an
            existing organization, you can accept their invitation instead.
          </InlineAlert>

          <Button asChild variant="outline">
            <Link to="/invitations">View my invitations</Link>
          </Button>
        </div>
      )}

      <CreateOrganizationContent key={session.user.uid} user={session.user} />
    </div>
  );
};
